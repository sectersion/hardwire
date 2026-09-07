import { getDocsTree } from "@/lib/docs"
import { DocsMobileShell } from "@/components/docs-mobile-shell"
import { PageTransition } from "@/components/page-transition"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const { tree } = getDocsTree()

  return (
    <DocsMobileShell tree={tree}>
      <PageTransition>{children}</PageTransition>
    </DocsMobileShell>
  )
}