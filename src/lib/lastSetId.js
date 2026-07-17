// 记住上次输入的集合编号（UI 便利，非成绩数据；连续做同一套时免重填）。
const KEY = 'qcpr:lastSetId';

export function getLastSetId() {
  try {
    return localStorage.getItem(KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setLastSetId(v) {
  try {
    localStorage.setItem(KEY, v);
  } catch (e) {
    /* 忽略（隐私模式等） */
  }
}
