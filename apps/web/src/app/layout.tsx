import type { Metadata } from "next"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "Hardwire — From logic to silicon",
  description: "A high-intensity silicon YSWS that bridges the gap between abstract code and physical hardware.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
