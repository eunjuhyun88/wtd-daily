try {
  const d = localStorage.getItem('wtd.density');
  if (d === 'compact' || d === 'comfortable') {
    document.documentElement.dataset.density = d;
  }
} catch {}
