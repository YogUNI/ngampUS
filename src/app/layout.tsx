import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/navigation-progress";
import { PageTracker } from "@/components/analytics/page-tracker";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { PwaSplashScreen } from "@/components/pwa/pwa-splash-screen";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f6849" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1f16" },
  ],
};

export const metadata: Metadata = {
  title: "ngampUS | Your campus command center",
  description: "Bantu mahasiswa menjaga ritme kuliah, tugas, organisasi, dan ambisi dalam satu sistem yang tenang.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ngampUS",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon-192.png" },
    ],
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
        <meta name="application-name" content="ngampUS" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ngampUS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden w-full">
        <PwaSplashScreen />
        <Suspense fallback={null}>
          <NavigationProgress />
          <PageTracker />
          <PwaRegister />
        </Suspense>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

