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
  // Use dynamic width calculation based on content
  const baseWidth = 7;
  const cardRef = useRef<HTMLDivElement>(null);
  const symbolRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [calculatedWidth, setCalculatedWidth] = useState(baseWidth);
  const [calculatedHeight, setCalculatedHeight] = useState("auto");

  const arrowLeftPosition = "0"; // Changed to be at the immediate left of the card
  const arrowRightPosition = "0"; // Changed to be at the immediate right of the card

  const iconWidth = 2.5;
  const iconHeight = 2.5;
  const iconTopOffset = -1.5;

  const svgScale = 0.8;

  const hasParameterIcons =
    showIcons && parameterIcons.some((icon) => icon && icon.trim() !== "");
  const hasReturnIcon = showIcons && returnIcon && returnIcon.trim() !== "";
  const hasAnyIcons = hasParameterIcons || hasReturnIcon;

  useEffect(() => {
    setCalculatedWidth(baseWidth);

    setTimeout(() => {
      if (cardRef.current) {
        // Check all text elements for width
        const textElements = Array.from(cardRef.current.querySelectorAll("p"));
        let maxTextWidth = 0;

        textElements.forEach((p) => {
          // Create a temporary span to measure text width accurately
          const span = document.createElement("span");
          span.style.visibility = "hidden";
          span.style.position = "absolute";
          span.style.whiteSpace = "nowrap"; // Always measure as single line
          span.style.fontWeight = p.style.fontWeight || "normal";
          span.style.fontSize = p.style.fontSize || "inherit";
          span.innerText = p.innerText;
          document.body.appendChild(span);

          const width = span.offsetWidth / 16;
          if (width > maxTextWidth) maxTextWidth = width;

          document.body.removeChild(span);
        });

        const svgElement = svgRef.current?.querySelector("svg");
        const svgWidth = svgElement ? (svgElement.clientWidth / 16) * 0.85 : 0;

        const textPadding = 2.5; // Increased padding for full text display
        const extraPadding = languages.length > 1 ? 1.5 : 0.5;

        const contentWidth = Math.max(maxTextWidth, svgWidth);

        const newWidth = Math.max(
          baseWidth,
          contentWidth + textPadding + extraPadding
        );

        setCalculatedWidth(newWidth);

        // Calculate height based on content
        const symbolHeight = symbolRef.current?.offsetHeight || 0;
        const languagesHeight = languagesRef.current?.offsetHeight || 0;
        const svgHeight = svgRef.current?.offsetHeight || 0;

        const contentSpacing = languages.length > 1 ? 24 : 16;
        const totalHeight =
          (symbolHeight + languagesHeight + svgHeight + contentSpacing) / 16;

        // Calculate minimum height based on number of parameters and return value
        const arrowCount = Math.max(params.length, returnValue ? 1 : 0);
        const arrowSpacing = 2; // Space needed per arrow in em
        const minArrowHeight = arrowCount * arrowSpacing;

        // Set a higher minimum height to accommodate arrows
        const baseMinHeight = 12; // Increased from 9
        const minHeight = Math.max(baseMinHeight, minArrowHeight);

        const iconSpace = hasAnyIcons ? 1 : 0;
        const finalHeight = Math.max(minHeight, totalHeight + iconSpace);

        setCalculatedHeight(`${finalHeight}em`);
      }
    }, 100);
  }, [
    languages,
    showIcons,
    hasAnyIcons,
    baseWidth,
    params.length,
    returnValue,
  ]);

  return (
    <div
      style={{
        display: "block",
        width: "100%",
        position: "relative",
        boxSizing: "border-box",
        overflow: "visible", // Ensure any overflow is visible and not scrolled
        margin: "2em 0", // Add vertical margin to prevent cards from crowding
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          overflow: "visible", // Ensure container doesn't clip children
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: `${calculatedWidth}em`,
            height: calculatedHeight,
            minHeight: `${Math.max(12, params.length * 2)}em`,
            border: "0.2em solid red",
            backgroundColor: "#FBE3E3",
            borderRadius: "1.5em",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0.6em 0.5em 1em",
            zIndex: 1,
            overflow: "visible", // Ensure anything outside the card is visible
            boxSizing: "border-box",
            justifyContent: "flex-start",
            position: "relative",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
            minWidth: `${baseWidth}em`, // Ensure minimum width
          }}
        >
          {/* Arrow divs positioned absolutely relative to the card */}
          <div
            style={{
              position: "absolute",
              left: arrowLeftPosition,
              top: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              transform: "translateX(-100%)",
              // Add small offset to ensure arrow touches card border
              marginRight: "-1px",
              zIndex: 2, // Ensure arrows are above other elements
            }}
          >
            {Array.from({ length: params?.length }).map((_, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  transformOrigin: "right center",
                }}
              >
                {showIcons &&
                  parameterIcons &&
                  parameterIcons[index] &&
                  parameterIcons[index].trim() !== "" && (
                    <div
                      style={{
                        position: "absolute",
                        top: `${iconTopOffset}em`,
                        right: "1em", // Position icon to the left of the arrow
                        width: `${iconWidth}em`,
                        height: `${iconHeight}em`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#fff",
                        borderRadius: "50%",
                        border: "1px solid #ccc",
                        overflow: "hidden",
                        padding: "2px",
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          transform: `scale(${svgScale})`,
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <RenderSvg svg={parameterIcons[index]} />
                      </div>
                    </div>
                  )}
                <Arrow />
              </div>
            ))}
          </div>

          {/* Output arrows positioned at the right edge */}
          <div
            style={{
              position: "absolute",
              right: arrowRightPosition,
              top: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transform: "translateX(100%)",
              // Add small offset to ensure arrow touches card border
              marginLeft: "-1px",
              zIndex: 2, // Ensure arrows are above other elements
            }}
          >
            {Array.from({ length: returnValue ? 1 : 0 }).map((_, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  transformOrigin: "left center",
                }}
              >
                {showIcons && returnIcon && returnIcon.trim() !== "" && (
                  <div
                    style={{
                      position: "absolute",
                      top: `${iconTopOffset}em`,
                      left: "1em", // Position icon to the right of the arrow
                      width: `${iconWidth}em`,
                      height: `${iconHeight}em`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#fff",
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                      overflow: "hidden",
                      padding: "2px",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        transform: `scale(${svgScale})`,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <RenderSvg svg={returnIcon} />
                    </div>
                  </div>
                )}
                <Arrow />
              </div>
            ))}
          </div>

          {/* PyTamaro symbol at the top */}
          <div
            ref={symbolRef}
            style={{
              transform: `scale(${svgScale})`,
            }}
          >
            <PyTamaroSymbol />
          </div>

          <div style={{ flex: "1 0 auto" }} />

          {/* Languages in the middle */}
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
              padding: "0.25em 0",
              marginBottom: "0.4em", // Increased margin below languages
              overflow: "visible",
              flex: "0 0 auto", // Don't grow or shrink
            }}
          >
            {languages.map((lang, index) => (
              <p
                key={index}
                style={{
                  fontWeight: index === 0 ? "bold" : "normal",
                  margin: 0,
                  whiteSpace: "nowrap",
                  width: "100%",
                }}
              >
                {lang}
              </p>
            ))}
          </div>

          {/* Optional SVG icon at the bottom */}
          {svg !== undefined && (
            <div
              ref={svgRef}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                flex: "1 0 auto",
                minHeight: "45%", // Increased from 35%
                maxHeight: "60%", // Increased from 45%
                position: "relative",
                marginTop: "auto",
                marginBottom: "0.8em", // Increased from 0.5em
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) scale(1.1)",
                  paddingBottom: "0.8em", // Increased from 0.6em
                }}
              >
                <RenderSvg svg={svg} />
              </div>
            </div>
          )}

          {/* Add another spacer at the bottom for balance when no SVG */}
          {svg === undefined && <div style={{ flex: "1 0 auto" }} />}
        </div>
      </div>
    </div>
  );
}
