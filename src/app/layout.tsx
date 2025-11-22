import { Roboto, Roboto_Condensed } from "next/font/google";
import type { Metadata } from "next";
import "../styles/_app.sass";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-roboto",
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
});

export const metadata: Metadata = {
  title: "Zyad Yasser | Portfolio",
  description: "A full stack software engineer specialized in web development",
  viewport: "initial-scale=1.0, width=device-width",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoCondensed.variable}`}>
      <head>
        <link href="/static/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/static/css/general.css" rel="stylesheet" />
        <link href="/static/css/lineicons.min.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}