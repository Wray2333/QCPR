// 速算练习模块定义 —— 全局唯一数据源。
// 所有下拉、图表、算法均引用此处，避免题量/限时硬编码散落各处。
//
// 注意：README 正文称"分为四部分"，但实际列出 6 个模块，本项目以 6 个模块为准。
export const MODULES = [
  { id: 'add_sub_2', name: '两位数加减', count: 20, limitSec: 120 },
  { id: 'mul_2', name: '两位数乘', count: 40, limitSec: 90 },
  { id: 'add_sub_3', name: '三位数加减', count: 20, limitSec: 180 },
  { id: 'div_2', name: '除两位', count: 20, limitSec: 60 },
  { id: 'div_3', name: '除三位', count: 20, limitSec: 240 },
  { id: 'div_4', name: '除四位', count: 20, limitSec: 240 },
];

export const MODULE_MAP = Object.fromEntries(MODULES.map((m) => [m.id, m]));

export const getModule = (id) => MODULE_MAP[id];
