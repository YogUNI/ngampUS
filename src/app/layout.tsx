import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

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
    var isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

