import { useState, useEffect, useCallback, useRef } from 'react';
import * as storage from '../lib/storage.js';

const LEGACY_KEY = 'qcpr:records:v1'; // 旧版 localStorage 键
const MIGRATED_KEY = 'qcpr:records:v1:migrated';

/**
 * 首次运行时把旧的 localStorage 数据迁移到服务器（一次性）。
 * 仅当服务器为空且本地有旧数据时执行；迁移后把本地键改名保留为备份（不删除）。
 * @returns {boolean} 是否发生了迁移（发生则调用方需重新拉取）
 */
async function migrateLegacyData(serverRecords) {
  if (serverRecords.length > 0) return false;
  let raw;
  try {
    raw = localStorage.getItem(LEGACY_KEY);
  } catch (e) {
    return false;
  }
  if (!raw) return false;
  try {
    const legacy = JSON.parse(raw);
    if (!Array.isArray(legacy) || legacy.length === 0) return false;
    await storage.importJSON(raw);
    // 保留备份：改名而非删除，避免误操作丢数据
    localStorage.setItem(MIGRATED_KEY, raw);
    localStorage.removeItem(LEGACY_KEY);
    return true;
  } catch (e) {
    console.error('[useRecords] 旧数据迁移失败', e);
    return false;
  }
}

/**
 * 成绩数据读写 hook。数据来自后端 /api/records。
 * 暴露 loading / error，便于页面处理加载与失败态。
 */
export function useRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const migratedRef = useRef(false); // 迁移只尝试一次

  const load = useCallback(async () => {
    try {
      setError(null);
      let data = await storage.getRecords();
      if (!migratedRef.current) {
        migratedRef.current = true;
        const migrated = await migrateLegacyData(data);
        if (migrated) data = await storage.getRecords();
      }
      setRecords(data);
    } catch (e) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次挂载拉取
  useEffect(() => {
    load();
  }, [load]);

  // 页面重新可见 / 获得焦点时刷新（替代原跨标签 storage 事件；手机切回自动同步）
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState !== 'hidden') load();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [load]);

  const add = useCallback(
    async (r) => {
      const full = await storage.addRecord(r);
      await load();
      return full;
    },
    [load]
  );

  const update = useCallback(
    async (id, patch) => {
      await storage.updateRecord(id, patch);
      await load();
    },
    [load]
  );

  const remove = useCallback(
    async (id) => {
      await storage.deleteRecord(id);
      await load();
    },
    [load]
  );

  return { records, loading, error, add, update, remove, refresh: load };
}
