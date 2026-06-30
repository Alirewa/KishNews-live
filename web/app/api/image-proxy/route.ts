import { NextRequest, NextResponse } from "next/server";

// Article images come from third-party news domains, which would taint the
// html2canvas-exported canvas (CORS). This re-streams the image from our own
// origin with permissive CORS headers so it can be used as a safe bgImg.
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "invalid protocol" }, { status: 400 });
  }

  const upstream = await fetch(target.toString(), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KishEaseImageProxy/1.0)" },
  });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
