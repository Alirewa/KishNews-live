import type { Metadata } from "next";
import { pelak, pelakFA } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kish Ease",
  description: "آخرین اخبار کیش و ابزار ساخت پست/استوری اینستاگرام",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${pelak.variable} ${pelakFA.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
