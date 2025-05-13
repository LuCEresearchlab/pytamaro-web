/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useEffect, useRef, useState } from "react";
import PyTamaroSymbol from "./PyTamaro-symbol";
import RenderSvg from "./render-svg";

export default function ConstantCard({
  languages,
  svg,
  showIcons = false,
}: {
  languages: string[];
  svg: string;
  showIcons?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [calculatedWidth, setCalculatedWidth] = useState(12.5);
  const baseWidth = 12.5;

  useEffect(() => {
    setCalculatedWidth(baseWidth);

    // Calculate proper width after component renders
    setTimeout(() => {
      if (cardRef.current) {
        // Create a hidden span to measure text width
        const span = document.createElement("span");
        span.style.visibility = "hidden";
        span.style.position = "absolute";
        span.style.whiteSpace = "nowrap";
        span.style.fontWeight = "bold";
        span.style.fontSize = "1.5em";
        document.body.appendChild(span);

        // Find the maximum text width from all languages
        let maxTextWidth = 0;
        languages.forEach((lang) => {
          span.innerText = lang;
          const width = span.getBoundingClientRect().width / 16;
          if (width > maxTextWidth) {
            maxTextWidth = width;
          }
        });

        document.body.removeChild(span);

        // Add padding for aesthetics
        const padding = 3;
        const newWidth = Math.max(baseWidth, maxTextWidth + padding);

        setCalculatedWidth(newWidth);
      }
    }, 100);
  }, [languages]); // Add languages as dependency to recalculate when it changes

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: "2em",
      }}
    >
      <div
        ref={cardRef}
        style={{
          position: "relative",
          width: `${calculatedWidth}em`,
          height: "12.5em",
          backgroundColor: "#E6F5FD",
          border: "0.4em solid #118BCA",
          borderRadius: "0.4em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          color: "black",
          minWidth: `${baseWidth}em`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "0.5em",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "0.5em",
          }}
        >
          <PyTamaroSymbol />
        </div>
        <span
          style={{
            fontSize: "1.5em",
            zIndex: 1,
            whiteSpace: "nowrap",
            padding: "0 1em",
            gap: "0",
          }}
        >
          {languages.map((lang, index) => (
            <p
              key={index}
              style={{
                fontWeight: index === 0 ? "bold" : "normal",
                margin: 0,
                marginTop: index === 0 ? "1em" : "0",
                whiteSpace: "nowrap",
                overflow: "visible",
                width: "100%",
                textAlign: "center",
              }}
            >
              {lang}
            </p>
          ))}
        </span>
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-1.35em",
            width: "2.25em",
            height: "2.25em",
            backgroundColor: "#E6F5FD",
            borderTop: "0.4em solid #118BCA",
            borderRight: "0.4em solid #118BCA",
            transform: "translateY(-50%) rotate(45deg)",
          }}
        />
      </div>
      {showIcons && (
        <div
          style={{
            width: "3em",
            height: "3em",
          }}
        >
          <RenderSvg svg={svg} padding="0" maxWidth="90%" maxHeight="90%" />
        </div>
      )}
    </div>
  );
}
