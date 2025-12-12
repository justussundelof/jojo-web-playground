import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { SiteProvider } from "./context/SiteContext";
import HeaderNav from "@/components/HeaderNav";

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

export const metadata: Metadata = {
  title: "JOJO",
  description: "studio of vintage couture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${gtCompressed.variable} ${gtSans.variable} ${gtMono.variable} ${CLTSerifDensed.variable} ${CLTSerifRegular.variable} ${CLTSerifWide.variable} antialiased`}
      >
        <SiteProvider>
          <HeaderNav />
          {children}
        </SiteProvider>
      </body>
    </html>
  );
}
