import type { Metadata } from "next";
import "@workspace/ui/globals.css";
import { Outfit } from "next/font/google";
import { Providers } from "@/providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Mindware Affiliate | Software de gestão de parceiros e afiliados",
    template: "%s | Mindware Affiliate",
  },

  description:
    "Mindware Affiliate é um software de gestão de parceiros e afiliados focado no aumento de vendas e comissões recorrentes.",

  applicationName: "Mindware Affiliate",

  keywords: [
    "Mindware Affiliate",
    "software de parceiros",
    "software de afiliados",
    "renda e comissão",
    "marketing de afiliados",
    "software para pessoas singulares",
  ],

  authors: [
    {
      name: "Mindware",
      url: "https://mindware.ao",
    },
  ],

  creator: "Mindware",
  publisher: "Mindware",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/mindware.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/mindware.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    title: "Mindware Affiliate | Software de gestão de parceiros e afiliados",
    description:
      "Mindware Affiliate é um software de gestão de parceiros e afiliados focado no aumento de vendas e comissões recorrentes.",
    url: "https://affiliate.mindware.ao",
    siteName: "Mindware Affiliate",
    images: [
      {
        url: "/mindgware.png",
        width: 1200,
        height: 630,
        alt: "Mindware Affiliate: Software de gestão de parceiros e afiliados",
      },
    ],
    locale: "pt_AO",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Mindware Affiliate | Software de gestão de parceiros e afiliados",
    description:
      "Mindware Affiliate é um software de gestão de parceiros e afiliados focado no aumento de vendas e comissões recorrentes.",
    images: ["/mindware.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  category: "Software",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
