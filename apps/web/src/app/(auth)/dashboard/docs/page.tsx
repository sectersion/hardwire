import { redirect } from "next/navigation"
import { getFirstDocSlug } from "@/lib/docs"

export default function DocsIndexPage() {
  const firstSlug = getFirstDocSlug()
  if (firstSlug) {
    redirect(`/dashboard/docs/${firstSlug.join("/")}`)
  }
  return (
    <p style={{ color: "var(--muted)" }}>
      No docs have been added yet. Drop some .md files into content/docs.
    </p>
  )
}