/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */

import { useEffect, useRef, useState } from "react";
import Arrow from "./arrow";
import PyTamaroSymbol from "./PyTamaro-symbol";

interface BasicCardProps {
  type: string;
  params: { name: string; type: string }[];
  svg: string;
  returnValue: { type: string; description: string };
  languages: string[];
}

export default function FunctionCard({
  type,
  params,
  svg,
  returnValue,
  languages,
}: BasicCardProps) {
  const totalHeight = "300px";
  const baseWidth = 150;
  const cardRef = useRef<HTMLDivElement>(null);
  const [calculatedWidth, setCalculatedWidth] = useState(baseWidth);

  useEffect(() => {
    if (cardRef.current) {
      const cardWidth = cardRef.current.scrollWidth;
      const textWidth = Array.from(
        cardRef.current.querySelectorAll("p")
      ).reduce((maxWidth, p) => Math.max(maxWidth, p.scrollWidth), 0);
      const newWidth = Math.max(cardWidth, textWidth) + 20; // Add some padding
      if (newWidth > baseWidth) {
        setCalculatedWidth(newWidth);
      }
    }
  }, [languages]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "right",
            justifyContent: "space-evenly",
          }}
        >
          {/* arrows to the left of the card */}
          {Array.from({ length: params?.length }).map((_, index) => (
            <Arrow key={index} />
          ))}
        </div>
        <div
          ref={cardRef}
          style={{
            width: `${calculatedWidth}px`,
            height: totalHeight,
            border: "5px solid red",
            backgroundColor: "#FBE3E3",
            borderRadius: "30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* PyTamaro svg symbol */}
          <PyTamaroSymbol />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0px",
              height: "50%",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "20px",
            }}
          >
            {/* Maps list of languages to card */}
            {languages.map((lang, index) => (
              <p
                key={index}
                style={{
                  fontWeight: index === 0 ? "bold" : "normal",
                  margin: "2px 0",
                }}
              >
                {lang}
              </p>
            ))}
          </div>
          <RenderSvg svg={svg} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Output arrows to the right of the card */}
          {Array.from({ length: returnValue ? 1 : 0 }).map((_, index) => (
            <Arrow key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
