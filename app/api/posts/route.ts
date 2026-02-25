import fs from "fs/promises"
import path from "path"
import { NextResponse } from "next/server"

export async function GET() {
  const postsDir = path.join(process.cwd(), "posts")
  let files: string[] = []
  try {
    files = await fs.readdir(postsDir)
  } catch (e) {
    return NextResponse.json([])
  }

  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(postsDir, file), "utf8")
        const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/) as RegExpMatchArray | null
        let meta: Record<string, string> = {}
        let body = raw
        if (fmMatch) {
          const fm = fmMatch[1]
          fm.split("\n").forEach((line) => {
            const idx = line.indexOf(":")
            if (idx > -1) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
          })
          body = raw.slice(fmMatch[0].length)
        }

        return {
          slug: file.replace(/\.md$/i, ""),
          title: meta.title || "",
          excerpt: meta.excerpt || "",
          date: meta.date || "",
          readTime: meta.readTime || "",
          content: body.trim(),
        }
      }),
  )

  return NextResponse.json(posts)
}
