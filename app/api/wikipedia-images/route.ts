import { NextResponse } from "next/server"

const WIKI_API = "https://en.wikipedia.org/w/api.php"

async function getPageImages(title: string): Promise<string[]> {
  const u = new URL(WIKI_API)
  u.searchParams.set("action", "query")
  u.searchParams.set("format", "json")
  u.searchParams.set("titles", title)
  u.searchParams.set("prop", "images")
  u.searchParams.set("origin", "*")
  const r = await fetch(u.toString(), { cache: "no-store" })
  if (!r.ok) return []
  const data = await r.json()
  const pages = data?.query?.pages || {}
  const files: string[] = []
  for (const key of Object.keys(pages)) {
    const page = pages[key]
    if (Array.isArray(page?.images)) {
      for (const img of page.images) if (img?.title) files.push(img.title as string)
    }
  }
  return files
}

async function getImageInfo(titles: string[]): Promise<string | null> {
  if (!titles.length) return null
  const u = new URL(WIKI_API)
  u.searchParams.set("action", "query")
  u.searchParams.set("format", "json")
  u.searchParams.set("prop", "imageinfo")
  u.searchParams.set("iiprop", "url")
  u.searchParams.set("iiurlwidth", "256")
  u.searchParams.set("titles", titles.join("|"))
  u.searchParams.set("origin", "*")
  const r = await fetch(u.toString(), { cache: "no-store" })
  if (!r.ok) return null
  const data = await r.json()
  const pages = data?.query?.pages || {}
  for (const key of Object.keys(pages)) {
    const ii = pages[key]?.imageinfo?.[0]
    const url: string | undefined = ii?.thumburl || ii?.url
    if (url && /(jpg|jpeg|png)$/i.test(url)) return url
  }
  return null
}

export async function POST(req: Request) {
  try {
    const { figure } = await req.json()
    if (!figure || typeof figure !== "string") return NextResponse.json({ url: null }, { status: 400 })
    const files = await getPageImages(figure)
    // Prefer portrait-like filenames
    const preferred = files.filter((f) => /portrait|\b[12]\d{3}\b|\.(jpg|jpeg|png)$/i.test(f))
    const url = await getImageInfo(preferred.length ? preferred : files)
    return NextResponse.json({ url: url || null })
  } catch (e) {
    return NextResponse.json({ url: null }, { status: 200 })
  }
}

