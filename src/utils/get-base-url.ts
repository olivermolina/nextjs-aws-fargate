export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // reference for railway.app
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
