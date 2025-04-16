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
  const baseWidth = 8; // Reduced from 9.375
  const cardRef = useRef<HTMLDivElement>(null);
  const symbolRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [calculatedWidth, setCalculatedWidth] = useState(baseWidth);
  const [calculatedHeight, setCalculatedHeight] = useState("auto");

  const iconWidth = 3.125;
  const iconHeight = 3.125;
  const iconTopOffset = -1.875;

  const hasParameterIcons =
    showIcons && parameterIcons.some((icon) => icon && icon.trim() !== "");
  const hasReturnIcon = showIcons && returnIcon && returnIcon.trim() !== "";
  const hasAnyIcons = hasParameterIcons || hasReturnIcon;

  useEffect(() => {
    setCalculatedWidth(baseWidth);

    setTimeout(() => {
      if (cardRef.current) {
        // Calculate width
        const cardWidth = cardRef.current.scrollWidth / 16;
        const textWidth = Array.from(
          cardRef.current.querySelectorAll("p")
        ).reduce((maxWidth, p) => Math.max(maxWidth, p.scrollWidth / 16), 0);
        const newWidth = Math.max(cardWidth, textWidth) + 1.25;
        if (newWidth > baseWidth) {
          setCalculatedWidth(newWidth);
        }

        const symbolHeight = symbolRef.current?.offsetHeight || 0;
        const languagesHeight = languagesRef.current?.offsetHeight || 0;
        const svgHeight = svgRef.current?.offsetHeight || 0;

        const totalContentHeight =
          (symbolHeight + languagesHeight + svgHeight + 48) / 16;
        const iconPadding = hasAnyIcons ? 2 : 0;
        setCalculatedHeight(`${totalContentHeight + iconPadding}em`);
      }
    }, 0);
  }, [languages, showIcons, hasAnyIcons]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-2.7em",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}
        >
          {Array.from({ length: params?.length }).map((_, index) => (
            <div key={index} style={{ position: "relative" }}>
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
            height: calculatedHeight,
            minHeight: "14em",
            border: "0.2em solid red",
            backgroundColor: "#FBE3E3",
            borderRadius: "1.5em",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0.8em 0.5em 0.5em",
            zIndex: 1,
          }}
        >
          <div ref={symbolRef}>
            <PyTamaroSymbol />
          </div>
          <div
            ref={languagesRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "1.25em",
              width: "100%",
            }}
          >
            {languages.map((lang, index) => (
              <p
                key={index}
                style={{
                  fontWeight: index === 0 ? "bold" : "normal",
                  margin: 0,
                }}
              >
                {lang}
              </p>
            ))}
          </div>
          {svg !== undefined && (
            <div
              ref={svgRef}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                maxHeight: "50%",
                alignItems: "center",
              }}
            >
              <RenderSvg svg={svg} />
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            right: "-2.5em",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
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
