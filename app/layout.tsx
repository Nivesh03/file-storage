import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";
import { Toaster } from "sonner";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  icons: {icon: "logo.png"},
  title: "File Storage",
  description: "Fast and Secure Storage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased flex flex-col min-h-screen`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <Header/>
            <main className="flex-grow">{children}</main>
            <Footer/>
            <Toaster richColors />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
