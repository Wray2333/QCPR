import { useState, useRef, useCallback, useEffect } from 'react';

const TICK_MS = 250;

/**
 * 基于时间戳校正的计时器。
 * 用 setInterval 驱动界面刷新（后台标签页只会被节流、不会完全暂停），
 * 但计时值始终以 Date.now() 差值实时计算 —— 即使刷新掉帧，读数依然准确。
 * 保存成绩时请用 getElapsedSec() 取精确值，不要依赖渲染用的 elapsedSec。
 */
export function useTimer() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0); // 本段开始时间戳
  const accRef = useRef(0); // 已累计毫秒（暂停前）
  const runningRef = useRef(false);
  const intervalRef = useRef(null);

  const compute = useCallback(
    () =>
      runningRef.current
        ? accRef.current + (Date.now() - startRef.current)
        : accRef.current,
    []
  );

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    startRef.current = Date.now();
    setRunning(true);
    setElapsedMs(compute());
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setElapsedMs(compute()), TICK_MS);
  }, [compute]);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    clearInterval(intervalRef.current);
    accRef.current += Date.now() - startRef.current;
    runningRef.current = false;
    setRunning(false);
    setElapsedMs(accRef.current);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    accRef.current = 0;
    startRef.current = 0;
    runningRef.current = false;
    setElapsedMs(0);
    setRunning(false);
  }, []);

  /** 取当前精确已用秒数（保存成绩用） */
  const getElapsedSec = useCallback(() => Math.floor(compute() / 1000), [compute]);

  /** 取当前精确已用毫秒数 */
  const getElapsedMs = useCallback(() => compute(), [compute]);

  /** 计时器快照（持久化用）：startedAt 为 null 表示处于暂停 */
  const snapshot = useCallback(
    () => ({
      accMs: accRef.current,
      startedAt: runningRef.current ? startRef.current : null,
    }),
    []
  );

  /** 从快照恢复；startedAt 非空则继续走表（期间流逝的时间照常计入） */
  const restore = useCallback(
    ({ accMs = 0, startedAt = null } = {}) => {
      clearInterval(intervalRef.current);
      accRef.current = accMs;
      runningRef.current = !!startedAt;
      startRef.current = startedAt || 0;
      setRunning(!!startedAt);
      setElapsedMs(compute());
      if (startedAt) {
        intervalRef.current = setInterval(() => setElapsedMs(compute()), TICK_MS);
      }
    },
    [compute]
  );

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return {
    elapsedSec: Math.floor(elapsedMs / 1000),
    running,
    start,
    pause,
    reset,
    getElapsedSec,
    getElapsedMs,
    snapshot,
    restore,
  };
}
