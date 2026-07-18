import { useCallback, useEffect, useRef } from 'react';

const supported =
  typeof navigator !== 'undefined' && 'wakeLock' in navigator;

/**
 * 屏幕常亮（Wake Lock）。计时期间调用 request() 阻止手机自动息屏，
 * pause/结束时 release()。浏览器切后台会自动释放锁，回到前台若仍需常亮
 * 会自动重新申请。
 *
 * 前提：Wake Lock API 需 HTTPS（localhost 豁免）；不支持的浏览器静默降级。
 */
export function useWakeLock() {
  const sentinelRef = useRef(null);
  const wantedRef = useRef(false); // 当前是否希望保持常亮

  const request = useCallback(async () => {
    wantedRef.current = true;
    if (!supported || sentinelRef.current) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request('screen');
      // 系统主动释放（如切后台）时清空引用，便于回前台重申请
      sentinelRef.current.addEventListener('release', () => {
        sentinelRef.current = null;
      });
    } catch (e) {
      // 权限/可见性等原因失败：静默降级，不影响计时
      sentinelRef.current = null;
    }
  }, []);

  const release = useCallback(async () => {
    wantedRef.current = false;
    const s = sentinelRef.current;
    sentinelRef.current = null;
    if (s) {
      try {
        await s.release();
      } catch (e) {
        /* ignore */
      }
    }
  }, []);

  // 回到前台时，若仍希望常亮则重新申请（后台会被系统释放）
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && wantedRef.current) {
        request();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      // 卸载兜底释放
      const s = sentinelRef.current;
      sentinelRef.current = null;
      wantedRef.current = false;
      if (s) s.release().catch(() => {});
    };
  }, [request]);

  return { request, release, supported };
}
