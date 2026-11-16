// ====================================================================
// AIRWIN CARGO - SUBDOMAIN & ROUTING MIDDLEWARE
// ====================================================================

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // 1. Handle admin subdomain: admin.airwincargo.com
  if (hostname === 'admin.airwincargo.com' || hostname.startsWith('admin.')) {
    // When visiting root '/' or '/index.html' on admin subdomain, serve the admin console
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const adminUrl = new URL('/admin', context.request.url);
      return context.env.ASSETS ? context.env.ASSETS.fetch(adminUrl) : Response.redirect(adminUrl.toString(), 302);
    }
  }

  return context.next();
}
