import type { Metadata } from "next"
import { Unbounded, DM_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { GlossaryPanel } from "@/components/glossary-panel"
import { GlossaryProvider } from "@/components/glossary-provider"
import "@/styles/globals.css"

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-unbounded",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Hardwire — From logic to silicon",
  description: "Design a chip. We manufacture it in a real fab and ship it back to you. A Hack Club YSWS, no hardware experience required.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`min-h-screen antialiased ${unbounded.variable} ${dmSans.variable}`}>
        <ThemeProvider>
          <GlossaryProvider>
            {children}
            <GlossaryPanel />
          </GlossaryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}