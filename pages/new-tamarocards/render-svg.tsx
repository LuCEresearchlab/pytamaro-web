/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useEffect, useState } from "react";

export default function RenderSvg({ svg }: { svg: string }) {
  const [svgUrl, setSvgUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if svg is already a URL
    if (svg && (svg.startsWith("/") || svg.startsWith("http"))) {
      setSvgUrl(svg);
    } else {
      setSvgUrl(null);
    }
  }, [svg]);

  if (!svgUrl) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={svgUrl}
        alt="Function icon"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
