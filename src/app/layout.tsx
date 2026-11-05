import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/navigation-progress";
import { PageTracker } from "@/components/analytics/page-tracker";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { PwaSplashScreen } from "@/components/pwa/pwa-splash-screen";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { AutoLogoutProvider } from "@/components/auth/auto-logout-provider";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a1f16" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1f16" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ngampus.site"),
  title: "ngampUS — Jadwal, tugas & organisasi kuliah dalam satu tempat",
  description: "ngampUS merapikan semuanya di satu tempat: jadwal kuliah, deadline, organisasi, sampai CV magang. Gratis selamanya untuk mahasiswa Indonesia.",
  applicationName: "ngampUS",
  authors: [{ name: "ngampUS Team", url: "https://ngampus.site" }],
  keywords: [
    "ngampus",
    "manajemen kuliah",
    "jadwal kuliah",
    "catatan mahasiswa",
    "organisasi kampus",
    "mahasiswa indonesia",
    "rekap ipk",
    "cv ats mahasiswa",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ngampUS",
  },
  openGraph: {
    title: "ngampUS — Jadwal, tugas & organisasi kuliah dalam satu tempat",
    description: "ngampUS merapikan semuanya di satu tempat: jadwal kuliah, deadline, organisasi, sampai CV magang.",
    url: "https://ngampus.site",
    siteName: "ngampUS",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "ngampUS Workspace Mahasiswa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ngampUS — Jadwal, tugas & organisasi kuliah dalam satu tempat",
    description: "ngampUS merapikan semuanya di satu tempat: jadwal kuliah, deadline, organisasi, sampai CV magang.",
    images: ["/icon-512.png"],
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ngampUS",
  operatingSystem: "Web, iOS, Android",
  applicationCategory: "EducationalApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "IDR",
  },
  description: "Platform manajemen perkuliahan, jadwal kelas, radar deadline tugas, dan organisasi bagi mahasiswa Indonesia.",
  url: "https://ngampus.site",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`h-full antialiased overflow-x-hidden ${bricolageGrotesque.variable} ${plusJakartaSans.variable} ${geistMono.variable}`}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden w-full font-sans">
        <OfflineIndicator />
        <PwaSplashScreen />
        <Suspense fallback={null}>
          <NavigationProgress />
          <PageTracker />
          <PwaRegister />
        </Suspense>
        <ThemeProvider>
          <ToastProvider>
            <AutoLogoutProvider>{children}</AutoLogoutProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
