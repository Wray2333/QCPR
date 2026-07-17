// 趋势与弱模块分析 —— 主页图表与分析卡片的数据计算全部收敛于此。
import { MODULES, getModule } from './modules.js';

const RECENT_N = 5; // 参与近期趋势判断的记录数

const acc = (r) => (r.totalCount ? (r.totalCount - r.wrongCount) / r.totalCount : 0);
const avg = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);
const byDateAsc = (a, b) => new Date(a.date) - new Date(b.date);

/**
 * 取某模块的时间序列，用于折线图
 * @param {Array} records 全部记录
 * @param {string} moduleId 模块 id
 * @param {'accuracy'|'duration'} metric 指标
 * @returns {Array<{date:string,value:number}>}
 */
export function getModuleTrend(records, moduleId, metric = 'accuracy') {
  return records
    .filter((r) => r.moduleId === moduleId)
    .sort(byDateAsc)
    .map((r) => ({
      date: r.date,
      value: metric === 'accuracy' ? acc(r) : r.durationSec,
    }));
}

/** 依据指标拼装文字建议 */
function buildAdvice({ avgAccuracy, avgTimeRatio, trend }) {
  const parts = [];
  if (avgAccuracy < 0.8) parts.push('正确率偏低，注意准确性');
  if (avgTimeRatio > 1) parts.push('普遍超时，需提升速度');
  if (trend < 0) parts.push('近期有退步，建议加练');
  return parts.length ? parts.join('；') : '表现稳定，保持练习';
}

/**
 * 计算每个模块的评分与弱项排序（score 越低越弱，排在越前）
 * @returns {Array} 每项含 moduleId/name/sampleCount/avgAccuracy/avgTimeRatio/trend/score/advice
 */
export function getWeakModules(records) {
  return MODULES.map((m) => {
    const rs = records.filter((r) => r.moduleId === m.id).sort(byDateAsc);

    if (rs.length === 0) {
      return {
        moduleId: m.id,
        name: m.name,
        sampleCount: 0,
        avgAccuracy: null,
        avgTimeRatio: null,
        trend: 0,
        score: null,
        advice: '尚无记录，建议先练习几次',
      };
    }

    // 1) 平均正确率（权重最高）
    const avgAccuracy = avg(rs.map(acc));

    // 2) 平均用时 / 限时 比值（>1 说明普遍超时）
    const avgTimeRatio = avg(rs.map((r) => r.durationSec / m.limitSec));

    // 3) 近期趋势：最近 N 次相对更早的正确率变化（正=进步，负=退步）
    const recent = rs.slice(-RECENT_N);
    const earlier = rs.slice(0, -RECENT_N);
    const trend = earlier.length ? avg(recent.map(acc)) - avg(earlier.map(acc)) : 0;

    // 综合评分：正确率主导，超时与退步各扣分
    const score =
      avgAccuracy * 0.7 - Math.max(0, avgTimeRatio - 1) * 0.2 + trend * 0.1;

    return {
      moduleId: m.id,
      name: m.name,
      sampleCount: rs.length,
      avgAccuracy,
      avgTimeRatio,
      trend,
      score,
      advice: buildAdvice({ avgAccuracy, avgTimeRatio, trend }),
    };
  }).sort((a, b) => (a.score ?? Infinity) - (b.score ?? Infinity)); // 最弱在前；无记录沉底
}

/** 主页概览卡片数据 */
export function getRecentSummary(records) {
  const total = records.length;
  const last7 = records.filter(
    (r) => Date.now() - new Date(r.date).getTime() < 7 * 864e5
  ).length;
  const avgAccuracy = total ? avg(records.map(acc)) : 0;
  return { total, last7, avgAccuracy };
}

/** 最近 n 条记录（按时间倒序） */
export function getRecentRecords(records, n = 10) {
  return [...records].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, n);
}

/** 记录中出现过的集合编号，去重后按数值升序返回 */
export function getSetIds(records) {
  const set = new Set();
  for (const r of records) {
    if (r.setId) set.add(r.setId);
  }
  return [...set].sort((a, b) => Number(a) - Number(b));
}
