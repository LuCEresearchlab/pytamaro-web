/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */

import { useEffect, useRef, useState } from "react";
import Arrow from "./arrow";
import PyTamaroSymbol from "./PyTamaro-symbol";
import RenderSvg from "./render-svg";

interface BasicCardProps {
  params: { name: string; type: string }[];
  svg: string;
  returnValue: { type: string; description: string };
  languages: string[];
  parameterIcons?: string[];
  returnIcon?: string;
  showIcons?: boolean;
}

export default function FunctionCard({
  params,
  svg,
  returnValue,
  languages,
  returnIcon = "",
  parameterIcons = [],
  showIcons = true,
}: BasicCardProps) {
  const baseHeight = 18.75; // Base height in em (300px ÷ 16)
  const iconSpaceHeight = 3.75; // Extra space for icons in em (60px ÷ 16)
  const baseWidth = 9.375; // Base width in em (150px ÷ 16)
  const cardRef = useRef<HTMLDivElement>(null);
  const [calculatedWidth, setCalculatedWidth] = useState(baseWidth);

  // Define consistent icon dimensions in em
  const iconWidth = 3.125; // 50px ÷ 16
  const iconHeight = 3.125; // 50px ÷ 16
  const iconTopOffset = -1.875; // -30px ÷ 16

  // Check if there are any icons to display
  const hasParameterIcons =
    showIcons && parameterIcons.some((icon) => icon && icon.trim() !== "");
  const hasReturnIcon = showIcons && returnIcon && returnIcon.trim() !== "";
  const hasAnyIcons = hasParameterIcons || hasReturnIcon;

  // Calculate dynamic height based on presence of icons
  const totalHeight = hasAnyIcons
    ? `${baseHeight}em`
    : `${baseHeight - iconSpaceHeight}em`;

  // Calculate card width when languages or icon visibility changes
  useEffect(() => {
    // Start with base width to reset any previously calculated width
    setCalculatedWidth(baseWidth);

    // Wait for next render to measure accurate width after reset
    setTimeout(() => {
      if (cardRef.current) {
        const cardWidth = cardRef.current.scrollWidth / 16; // Convert to em
        const textWidth = Array.from(
          cardRef.current.querySelectorAll("p")
        ).reduce((maxWidth, p) => Math.max(maxWidth, p.scrollWidth / 16), 0); // Convert to em
        const newWidth = Math.max(cardWidth, textWidth) + 1.25; // Add some padding (20px ÷ 16)
        if (newWidth > baseWidth) {
          setCalculatedWidth(newWidth);
        }
      }
    }, 0);
  }, [languages, showIcons]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignContent: "right",
            justifyContent: "space-evenly",
            position: "relative",
          }}
        >
          {/* arrows to the left of the card */}
          {Array.from({ length: params?.length }).map((_, index) => (
            <div
              key={index}
              style={{ position: "relative", marginBottom: "0.625em" }} // 10px ÷ 16
            >
              {showIcons &&
                parameterIcons &&
                parameterIcons[index] &&
                parameterIcons[index].trim() !== "" && (
                  <div
                    style={{
                      position: "absolute",
                      top: `${iconTopOffset}em`,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: `${iconWidth}em`,
                      height: `${iconHeight}em`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <RenderSvg svg={parameterIcons[index]} />
                  </div>
                )}
              <Arrow />
            </div>
          ))}
        </div>
        <div
          ref={cardRef}
          style={{
            width: `${calculatedWidth}em`,
            height: totalHeight,
            border: "0.3125em solid red", // 5px ÷ 16
            backgroundColor: "#FBE3E3",
            borderRadius: "1.875em", // 30px ÷ 16
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
              gap: "0",
              height: "50%",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "1.25em", // 20px ÷ 16
            }}
          >
            {/* Maps list of languages to card */}
            {languages.map((lang, index) => (
              <p
                key={index}
                style={{
                  fontWeight: index === 0 ? "bold" : "normal",
                  margin: "0.125em 0", // 2px ÷ 16
                }}
              >
                {lang}
              </p>
            ))}
          </div>
          {svg !== undefined && <RenderSvg svg={svg} />}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Output arrows to the right of the card */}
          {Array.from({ length: returnValue ? 1 : 0 }).map((_, index) => (
            <div key={index} style={{ position: "relative" }}>
              {showIcons && returnIcon && returnIcon.trim() !== "" && (
                <div
                  style={{
                    position: "absolute",
                    top: `${iconTopOffset}em`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: `${iconWidth}em`,
                    height: `${iconHeight}em`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <RenderSvg svg={returnIcon} />
                </div>
              )}
              <Arrow />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
