import type { Metadata, Viewport } from "next";
import "./globals.css";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111617",
};
export const metadata: Metadata = {
  title: "Dev's Weather | Radar Meteorológico de Pompeia-SP",
  description:
    "Monitoramento Meteorológico Regional de Pompeia-SP. Radar de chuva, previsão e acesso às imagens de satélite com fontes públicas.",
  manifest: `${base}/manifest.webmanifest`,
  icons: { icon: `${base}/icon.svg`, apple: `${base}/icon.svg` },
  openGraph: {
    title: "Dev's Weather",
    description: "Monitoramento Meteorológico Regional de Pompeia-SP",
    locale: "pt_BR",
    type: "website",
    siteName: "Dev's Weather",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
