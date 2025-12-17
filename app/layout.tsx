import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { SiteProvider } from "../context/SiteContext";
import HeaderNav from "@/components/HeaderNav";

import { ThemeProvider } from "next-themes";
import React from "react";
import { ProductProvider } from "@/context/ProductContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

export const gtSans = localFont({
  src: [
    {
      path: "./fonts/GTAmerica/GT-America-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GTAmerica/GT-America-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/GTAmerica/GT-America-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gtSans",
  display: "swap",
});

// GT America Mono
export const gtMono = localFont({
  src: [
    {
      path: "./fonts/GTAmerica/GT-America-Mono-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GTAmerica/GT-America-Mono-Medium.woff",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-gtMono",
  display: "swap",
});

export const gtCompressed = localFont({
  src: "./fonts/GTAmerica/GT-America-Compressed-Black.woff",
  variable: "--font-gtCompressed",
  display: "swap",
});

export const CLTSerifDensed = localFont({
  src: "./fonts/CLT/Aujournuit-Densed.woff2",
  variable: "--font-CLTSerifDensed",
  display: "swap",
});

export const CLTSerifRegular = localFont({
  src: "./fonts/CLT/Aujournuit-Regular.woff2",
  variable: "--font-CLTSerifRegular",
  display: "swap",
});

export const CLTSerifWide = localFont({
  src: "./fonts/CLT/Aujournuit-Wide.woff2",
  variable: "--font-CLTSerifWide",
  display: "swap",
});

export const gtSectraBook = localFont({
  src: "./fonts/GTSectra/GT-Sectra-Book.woff",
  variable: "--font-gtSectraBook",
  display: "swap",
});

export const gtSectraDisplay = localFont({
  src: "./fonts/GTSectra/GT-Sectra-Display-Regular.woff",
  variable: "--font-gtSectraDisplay",
  display: "swap",
});

export const gtSectraDisplayItalic = localFont({
  src: "./fonts/GTSectra/GT-Sectra-Display-Regular-Italic.woff",
  variable: "--font-gtSectraDisplayItalic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JOJO",
  description: "studio of vintage couture",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${gtCompressed.variable} ${gtSans.variable} ${gtMono.variable} ${CLTSerifDensed.variable} ${CLTSerifRegular.variable} ${CLTSerifWide.variable} ${gtSectraDisplay.variable} ${gtSectraDisplayItalic.variable} ${gtSectraBook.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <ProductProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <SiteProvider>
                  <HeaderNav />

                  {children}
                  {modal}
                </SiteProvider>
              </ThemeProvider>
            </ProductProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
