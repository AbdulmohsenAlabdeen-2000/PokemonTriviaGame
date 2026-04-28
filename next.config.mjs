/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Allow LAN devices to load `_next/static/*` chunks during development.
   *
   * Without this, Next.js dev mode returns 403 Forbidden on every JS chunk
   * for any origin that isn't `localhost`, which breaks React hydration on
   * the LAN IP — the page renders but no event handlers attach (buttons
   * appear dead, the JS pokeball cursor never mounts).
   *
   * The patterns below cover the common private LAN ranges plus Apple's
   * iPhone Personal Hotspot subnet so the app works on any phone/tablet
   * connected to the same network as this Mac.
   */
  allowedDevOrigins: [
    "172.20.10.*",        // iPhone Personal Hotspot (last octet)
    "192.168.*.*",        // home / office routers (any 192.168.x.y)
    "10.*.*.*",           // some LAN setups
    "*.local",            // mDNS / Bonjour
    "*"                   // belt & braces — dev only, never in production
  ]
};

export default nextConfig;
