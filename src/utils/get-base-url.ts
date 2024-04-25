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

  if (process.env.NODE_ENV === 'production') {
    return 'https://admin.lunahealth.app';
  }

  const hostname = process.env.HOSTNAME ?? "localhost";
  const port = process.env.PORT ?? 3000;

  // assume localhost
  return `http://${hostname}:${port}`;
}
