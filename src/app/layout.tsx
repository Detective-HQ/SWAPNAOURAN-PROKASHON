import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Swapno Uran Prakashan | Bauhaus Bookstore',
  description: 'A premium destination for physical and digital books with a bold modernist aesthetic.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent selection:text-accent-foreground">{children}</body>
    </html>
  );
}