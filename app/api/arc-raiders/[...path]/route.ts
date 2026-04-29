/**
 * MetaForge ARC Raiders API proxy.
 *
 * MetaForge doesn't send CORS headers, so direct browser fetches fail with
 * "TypeError: Failed to fetch". This catch-all Next.js Route Handler runs
 * server-side, fetches the upstream data, and forwards it back with the
 * right content-type — no CORS issues for the client.
 *
 * Mapping:  /api/arc-raiders/items   →   https://metaforge.app/api/arc-raiders/items
 *           /api/arc-raiders/arcs    →   https://metaforge.app/api/arc-raiders/arcs
 *           /api/arc-raiders/traders →   https://metaforge.app/api/arc-raiders/traders
 *           …
 *
 * Cached for 5 minutes so we don't hammer MetaForge during fast reloads.
 */

import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;
  const upstream = `https://metaforge.app/api/arc-raiders/${path.join("/")}`;
  try {
    const r = await fetch(upstream, {
      // 5 minute cache — data changes rarely
      next: { revalidate: 300 }
    });
    if (!r.ok) {
      return NextResponse.json(
        { error: `Upstream ${r.status}`, upstream },
        { status: r.status }
      );
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: String(err), upstream },
      { status: 502 }
    );
  }
}
