import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bread&Light",
    short_name: "Bread&Light",
    description: "Learn languages through Scripture.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F1",
    theme_color: "#FAF7F1",
    icons: [
      { src: "/icons/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
