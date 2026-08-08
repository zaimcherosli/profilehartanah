export async function onRequest(context) {
  // Rewrite /property-detail/:slug transparently to serve property-detail.html
  const url = new URL(context.request.url);
  const assetUrl = new URL('/property-detail.html', url.origin);
  return context.env.ASSETS.fetch(assetUrl);
}
