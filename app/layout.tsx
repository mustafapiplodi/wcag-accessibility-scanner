import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "WCAG Accessibility Scanner | Free WCAG 2.2 Compliance Testing",
  description: "Scan your website for WCAG 2.2, ADA, and Section 508 compliance issues. Free accessibility testing with actionable remediation guidance.",
  keywords: ["accessibility scanner", "WCAG checker", "ADA compliance", "accessibility testing", "WCAG 2.2"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
