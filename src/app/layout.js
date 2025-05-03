import "./globals.css";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-context";
import { ToastProvider } from "@/components/toast";
import Navbar from "@/components/navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Reed - Learn From Stories, Not Summaries",
  description: "Reed helps you learn through interactive storytelling",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="!scroll-smooth">
      <body className={poppins.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
              </div>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
