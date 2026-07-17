// Vite 插件：挂载 /api/records REST 接口，读写 data/records.json。
// 同一套 middleware 用于开发（configureServer）与生产预览（configurePreviewServer），
// 与前端同源同端口，无需 proxy。
import {
  readRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  replaceAll,
} from './store.js';

const BASE = '/api/records';

function sendJSON(res, status, body) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(payload);
}

// 204/205 语义上无响应体
function sendNoContent(res, status) {
  res.statusCode = status;
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        reject(new Error('请求体过大'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data.trim()) return resolve(undefined);
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('请求体不是合法 JSON'));
      }
    });
    req.on('error', reject);
  });
}

// 处理一个 /api/records 请求；返回 true 表示已接管，false 表示交还给 Vite。
async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  if (path !== BASE && !path.startsWith(`${BASE}/`)) return false;

  // /api/records/:id 中的 id
  const idPart = path.slice(BASE.length).replace(/^\//, '');
  const id = idPart ? decodeURIComponent(idPart) : null;

  try {
    // 集合级：/api/records
    if (!id) {
      if (req.method === 'GET') {
        return sendJSON(res, 200, await readRecords()), true;
      }
      if (req.method === 'POST') {
        const body = await readBody(req);
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          return sendJSON(res, 400, { error: '请求体应为记录对象' }), true;
        }
        return sendJSON(res, 201, await addRecord(body)), true;
      }
      if (req.method === 'PUT') {
        const body = await readBody(req);
        const count = await replaceAll(body); // 非数组会抛错 → 400
        return sendJSON(res, 200, { count }), true;
      }
      return sendJSON(res, 405, { error: '方法不允许' }), true;
    }

    // 单条级：/api/records/:id
    if (req.method === 'PATCH') {
      const body = await readBody(req);
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return sendJSON(res, 400, { error: '请求体应为补丁对象' }), true;
      }
      const updated = await updateRecord(id, body);
      if (!updated) return sendJSON(res, 404, { error: '记录不存在' }), true;
      return sendJSON(res, 200, updated), true;
    }
    if (req.method === 'DELETE') {
      const ok = await deleteRecord(id);
      if (!ok) return sendJSON(res, 404, { error: '记录不存在' }), true;
      return sendNoContent(res, 204), true;
    }
    return sendJSON(res, 405, { error: '方法不允许' }), true;
  } catch (e) {
    // 校验类错误（数组/JSON）归 400，其余（文件损坏等）归 500
    const isValidation = /数组|JSON|格式/.test(e.message || '');
    return (
      sendJSON(res, isValidation ? 400 : 500, {
        error: e.message || '服务器内部错误',
      }),
      true
    );
  }
}

/** 返回 Vite 插件对象 */
export function recordsApi() {
  const middleware = (req, res, next) => {
    handle(req, res).then(
      (handled) => {
        if (!handled) next();
      },
      (e) => {
        sendJSON(res, 500, { error: e.message || '服务器内部错误' });
      }
    );
  };
  return {
    name: 'qcpr-records-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
