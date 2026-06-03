export function mark(name: string): void {
  if (typeof performance === 'undefined') return;
  try { performance.mark(name); } catch { /* silent */ }
}
