import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Component Visual Editor",
  description: "A web-based visual editor for React components with live preview and style editing",
  keywords: ["react", "component", "editor", "visual", "css", "styling"],
  authors: [{ name: "Frontend Engineering Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}