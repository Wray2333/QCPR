// 连续计时练习的本地草稿（UI 便利，非成绩数据）。
// 计时后要切到相机 / AI 应用查错题，手机浏览器可能回收页面；
// 进行中的状态随时落盘，回来后据此恢复，避免丢失已计时的成绩。
import { MODULE_MAP, MODULES } from './modules.js';

const DRAFT_KEY = 'qcpr:practiceDraft:v1';
const MODULES_KEY = 'qcpr:lastModules';

/** 读取草稿；不存在或损坏返回 null */
export function loadPracticeDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (
      d &&
      (d.phase === 'running' || d.phase === 'review') &&
      Array.isArray(d.queue) &&
      d.queue.length > 0 &&
      d.queue.every((id) => MODULE_MAP[id]) &&
      Array.isArray(d.results)
    ) {
      return d;
    }
  } catch (e) {
    /* 解析失败视为无草稿 */
  }
  return null;
}

export function savePracticeDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    /* 忽略（隐私模式等） */
  }
}

export function clearPracticeDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    /* 忽略 */
  }
}

/** 上次选择的模块序列（缺省为第一个模块） */
export function getLastModules() {
  try {
    const ids = JSON.parse(localStorage.getItem(MODULES_KEY));
    if (Array.isArray(ids) && ids.length && ids.every((id) => MODULE_MAP[id])) {
      return ids;
    }
  } catch (e) {
    /* 忽略 */
  }
  return [MODULES[0].id];
}

export function setLastModules(ids) {
  try {
    localStorage.setItem(MODULES_KEY, JSON.stringify(ids));
  } catch (e) {
    /* 忽略 */
  }
}
