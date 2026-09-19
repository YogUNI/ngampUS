import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ngampUS | Your campus command center",
  description: "Bantu mahasiswa menjaga ritme kuliah, tugas, organisasi, dan ambisi dalam satu sistem yang tenang.",
  icons: {
    icon: "/logo_ngampUS.png",
    shortcut: "/logo_ngampUS.png",
    apple: "/logo_ngampUS.png",
  },
};

const themeInitScript = `
(function() {
  try {
    var storedTheme = localStorage.getItem('ngampus-theme');
    var isPublicPage = window.location.pathname === "/" || window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/register") || window.location.pathname.startsWith("/forgot-password") || window.location.pathname.startsWith("/reset-password");
    var isDark = !isPublicPage && (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches));
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className="h-full antialiased overflow-x-hidden"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden w-full">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

