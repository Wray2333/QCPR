// 成绩数据存储层 —— 封装对后端 /api/records 的访问。
// 所有函数均为 async。id / date / schemaVersion 由服务端补全。
const BASE = '/api/records';

/** 统一请求：非 2xx 抛错（带服务端返回的 error 文案）；204 返回 null */
async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let msg = `请求失败（${res.status}）`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch (e) {
      /* 响应无 JSON body，用默认文案 */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

/** 读取全部记录，返回数组 */
export async function getRecords() {
  const data = await request(BASE);
  return Array.isArray(data) ? data : [];
}

/** 新增一条，返回服务端补全后的完整记录 */
export async function addRecord(record) {
  return request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
}

/** 按 id 局部更新，返回更新后的记录 */
export async function updateRecord(id, patch) {
  return request(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

/** 按 id 删除 */
export async function deleteRecord(id) {
  await request(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/** 导出为格式化 JSON 字符串（备份用） */
export async function exportJSON() {
  const records = await getRecords();
  return JSON.stringify(records, null, 2);
}

/** 从 JSON 字符串导入（整体覆盖），返回写入条数 */
export async function importJSON(str) {
  const data = JSON.parse(str); // 解析失败在调用方 try/catch 中处理
  if (!Array.isArray(data)) throw new Error('数据格式错误：应为数组');
  const { count } = await request(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return count;
}
