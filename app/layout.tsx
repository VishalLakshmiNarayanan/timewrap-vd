import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chronos Guru - Learn from History",
  description: "Chat with historical figures and learn about their era",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <div className="min-h-screen w-full relative bg-[#fff7ed]">
          <div
            aria-hidden
            className="absolute inset-0 z-0 parallax-bg"
          />
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `linear-gradient(180deg,
                rgba(255,247,237,1) 0%,
                rgba(255,237,213,0.8) 25%,
                rgba(254,215,170,0.6) 50%,
                rgba(251,146,60,0.4) 75%,
                rgba(249,115,22,0.3) 100%
              ),
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.6) 0%, transparent 40%),
              radial-gradient(circle at 80% 20%, rgba(254,215,170,0.5) 0%, transparent 50%),
              radial-gradient(circle at 60% 60%, rgba(252,165,165,0.3) 0%, transparent 45%)`,
            }}
          />
          <div className="relative z-10">
            {children}
            <footer className="text-center text-xs text-amber-800 py-6 border-t border-amber-200 bg-transparent">
              Powered by Claude AI
              Educational purposes only. Historical responses are AI-generated simulations.
            </footer>
            <Analytics />
          </div>
        </div>
      </body>
    </html>
  )
}
