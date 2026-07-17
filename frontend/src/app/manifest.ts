import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mindware Affiliate",
    short_name: "Mindware Affiliate",
    description:
      "Software de gestão de parceiros e afiliados focado no aumento de vendas e comissões recorrentes.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/mindware.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
