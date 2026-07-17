import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bread&Light",
    short_name: "Bread&Light",
    description: "Learn languages through Scripture.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EB",
    theme_color: "#F7F3EB",
    icons: [
      { src: "/icons/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
