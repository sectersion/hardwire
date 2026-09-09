import type { Metadata } from "next"
import { Unbounded, DM_Sans, Ubuntu_Mono } from "next/font/google"
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

const ubuntuMono = Ubuntu_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ubuntu-sans-mono",
})

export const metadata: Metadata = {
  title: "Hardwire — From logic to silicon",
  description: "A high-intensity silicon YSWS that bridges the gap between abstract code and physical hardware.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`min-h-screen antialiased ${unbounded.variable} ${dmSans.variable} ${ubuntuMono.variable}`}>
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