export const environment = {
  production: true,
  // Same-origin: nginx en este pod proxy_pass /api/* a scoring-api en cluster
  // (intranet directa al API; coherente con catalog y supplier).
  apiBaseUrl: '',
};
