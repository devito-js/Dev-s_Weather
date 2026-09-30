import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return {
    name: "Dev's Weather",
    short_name: "Dev's Weather",
    description: "Monitoramento Meteorológico Regional",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#111617",
    theme_color: "#111617",
    lang: "pt-BR",
    icons: [
      {
        src: `${base}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
