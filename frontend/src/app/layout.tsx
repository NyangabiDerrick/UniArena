import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import AuthSessionProvider from "@/components/layout/SessionProvider"
import PolicyGate from "@/components/layout/PolicyGate"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UniArena",
  description: "University clubs, societies and sports platform"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthSessionProvider>
          <PolicyGate>{children}</PolicyGate>
        </AuthSessionProvider>
      </body>
    </html>
  )
}