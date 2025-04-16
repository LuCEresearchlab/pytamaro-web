/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useEffect, useState } from "react";

export default function RenderSvg({ svg }: { svg: string }) {
  const [clientSvg, setClientSvg] = useState<string | null>(null);

  useEffect(() => {
    setClientSvg(svg);
  }, [svg]);

  if (!clientSvg) return null;

  return (
    <div
      style={{
        width: "60%",
        height: "60%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      dangerouslySetInnerHTML={{ __html: clientSvg }}
    />
  );
}
