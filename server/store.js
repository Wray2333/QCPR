// 成绩数据的 JSON 文件读写层。
// 数据存于 <项目根>/data/records.json，所有磁盘访问收敛于此。
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'records.json');
const TMP_FILE = join(DATA_DIR, 'records.json.tmp');

/**
 * 读取全部记录。
 * 文件不存在 → 返回 []（首次运行的正常情况）。
 * 文件存在但 JSON 损坏 → 抛错（调用方返回 500），绝不当作空数组，
 * 以免后续写入覆盖掉真实但暂时读不出的数据。
 */
export async function readRecords() {
  let raw;
  try {
    raw = await readFile(DATA_FILE, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
  if (!raw.trim()) return [];
  const data = JSON.parse(raw); // 损坏则抛 SyntaxError，由上层处理
  if (!Array.isArray(data)) {
    throw new Error('records.json 内容不是数组');
  }
  return data;
}

// 写操作串行化队列：并发写请求排队执行，避免相互撕裂。
let writeChain = Promise.resolve();

function enqueueWrite(task) {
  const run = writeChain.then(task, task);
  // 无论成功失败都让链条继续，但不吞掉本次结果
  writeChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/**
 * 原子写入：先写临时文件再 rename，保证读者永远看到完整文件。
 * 通过队列串行化，天然防止并发写竞争。
 */
export function writeRecords(records) {
  return enqueueWrite(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(TMP_FILE, JSON.stringify(records, null, 2), 'utf8');
    await rename(TMP_FILE, DATA_FILE);
    return records;
  });
}

/** 新增一条：后端补全 id / date / schemaVersion，插到数组头部，返回完整记录 */
export async function addRecord(record) {
  const records = await readRecords();
  const full = {
    id: randomUUID(),
    date: new Date().toISOString(),
    schemaVersion: 1,
    ...record,
  };
  await writeRecords([full, ...records]);
  return full;
}

/** 按 id 局部更新，返回更新后的记录；id 不存在返回 null */
export async function updateRecord(id, patch) {
  const records = await readRecords();
  let updated = null;
  const next = records.map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, ...patch, id: r.id }; // id 不可被 patch 覆盖
    return updated;
  });
  if (!updated) return null;
  await writeRecords(next);
  return updated;
}

/** 按 id 删除，返回是否删除了记录 */
export async function deleteRecord(id) {
  const records = await readRecords();
  const next = records.filter((r) => r.id !== id);
  if (next.length === records.length) return false;
  await writeRecords(next);
  return true;
}

/** 整体覆盖（导入用）。入参须为数组，返回写入条数 */
export async function replaceAll(records) {
  if (!Array.isArray(records)) {
    throw new Error('导入数据格式错误：应为数组');
  }
  await writeRecords(records);
  return records.length;
}
