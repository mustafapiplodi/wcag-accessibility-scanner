"use client"

import { Toaster as HotToaster } from "react-hot-toast"
import { useTheme } from "next-themes"

export function Toast() {
  const { theme } = useTheme()

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: theme === "dark" ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)",
          color: theme === "dark" ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)",
          border: `1px solid ${theme === "dark" ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)"}`,
        },
        success: {
          iconTheme: {
            primary: "hsl(142.1 76.2% 36.3%)",
            secondary: "hsl(0 0% 100%)",
          },
        },
        error: {
          iconTheme: {
            primary: "hsl(0 84.2% 60.2%)",
            secondary: "hsl(0 0% 100%)",
          },
        },
      }}
    />
  )
}
