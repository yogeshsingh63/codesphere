// Vite-compatible replacement for CRA's require() for static assets.
// Usage: asset("assets/img/logo.png") returns the resolved URL.

const modules = import.meta.glob('/src/assets/**/*', { eager: true, query: '?url', import: 'default' });

export default function asset(path) {
  // Normalize: "assets/img/logo.png" -> "/src/assets/img/logo.png"
  const key = path.startsWith('/src/') ? path : `/src/${path}`;
  if (modules[key]) {
    return modules[key];
  }
  console.warn(`[asset] Not found: ${key}`);
  return '';
}
