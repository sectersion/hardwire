import { notFound } from "next/navigation"
import { getDocBySlug } from "@/lib/docs"

export default async function DocPage(props: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await props.params
  const doc = getDocBySlug(slug)

  if (!doc) notFound()

  return (
    <article>
      <h1 className="font-display text-2xl font-bold mb-6">{doc.title}</h1>
      <div className="docs-content" dangerouslySetInnerHTML={{ __html: doc.html }} />
    </article>
  )
}