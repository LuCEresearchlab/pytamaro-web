/* eslint-disable no-nested-ternary */
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
  // Adjust base width based on whether icons are shown
  const baseWidth = showIcons ? 7 : 5.5;
  const cardRef = useRef<HTMLDivElement>(null);
  const symbolRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [calculatedWidth, setCalculatedWidth] = useState(baseWidth);
  const [calculatedHeight, setCalculatedHeight] = useState("auto");

  const iconWidth = 2.5;
  const iconHeight = 2.5;
  const iconTopOffset = -1.5;

  const svgScale = showIcons ? 0.8 : 0.65; // Smaller SVG when no icons

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

          // Get the actual width of text content
          const width = span.getBoundingClientRect().width / 16;
          if (width > maxTextWidth) maxTextWidth = width;

          document.body.removeChild(span);
        });

        const svgElement = svgRef.current?.querySelector("svg");
        const svgWidth = svgElement ? (svgElement.clientWidth / 16) * 0.85 : 0;

        // Increased padding to ensure text fits completely
        const textPadding = showIcons ? 3 : 2.2;
        const extraPadding = languages.length > 1 ? 1.8 : 0.8;

        const contentWidth = Math.max(maxTextWidth, svgWidth);

        // Ensure the width is at least enough to fit the text content
        const newWidth = Math.max(
          baseWidth,
          contentWidth + textPadding + extraPadding
        );

        setCalculatedWidth(newWidth);

        // Calculate height based on content
        const symbolHeight = symbolRef.current?.offsetHeight || 0;
        const languagesHeight = languagesRef.current?.offsetHeight || 0;
        const svgHeight = svgRef.current?.offsetHeight || 0;

        const contentSpacing = showIcons
          ? languages.length > 1
            ? 24
            : 16
          : 12;
        const totalHeight =
          (symbolHeight + languagesHeight + svgHeight + contentSpacing) / 16;

        // Calculate minimum height based on number of parameters and return value
        const arrowCount = Math.max(params.length, returnValue ? 1 : 0);

        // Increase arrow spacing to ensure arrows don't overlap
        const arrowSpacing = showIcons ? 2.5 : 2; // Increased spacing for arrows

        // Set a higher minimum for arrow height calculation
        const minArrowHeight = Math.max(
          arrowCount * arrowSpacing,
          arrowCount + 2
        );

        // Set a higher minimum height to accommodate arrows
        // Ensure at least enough height for the arrows + spacing
        const baseMinHeight = showIcons ? 12 : 9; // Increased minimum height

        // Ensure minimum height accommodates all arrows with proper spacing
        const minHeight = Math.max(baseMinHeight, minArrowHeight);

        const iconSpace = hasAnyIcons ? 1 : 0;
        const finalHeight = Math.max(minHeight, totalHeight + iconSpace);

        setCalculatedHeight(`${finalHeight}em`);
      }
    }, 200);
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
        overflow: "visible",
        // Center the entire component
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          overflow: "visible",
          width: "100%",
          padding: "0",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-2.8em",
            top: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: params.length > 2 ? "space-around" : "space-evenly",
            zIndex: 2,
            width: "2.5em",
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
                      right: "1em",
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

        {/* Position arrows to the right of the card */}
        <div
          style={{
            position: "absolute",
            right: "-2.5em", // Fixed position outside the card
            top: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 2,
            width: "2.5em", // Width of arrow container
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

        {/* Main card - keeps its original width */}
        <div
          ref={cardRef}
          style={{
            width: `${calculatedWidth}em`,
            height: calculatedHeight,
            minHeight: `${Math.max(
              showIcons ? 14 : 10,
              (params.length + 1) * (showIcons ? 2.5 : 2)
            )}em`,
            border: "0.2em solid red",
            backgroundColor: "#FBE3E3",
            borderRadius: "1.5em",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: showIcons ? "0.6em 0.5em 1em" : "0.4em 0.4em 0.6em",
            zIndex: 1,
            overflow: "visible",
            boxSizing: "border-box",
            justifyContent: "flex-start",
            position: "relative",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
            minWidth: `${baseWidth}em`,
            // Remove any arrow-related positioning from the card itself
            margin: "0 auto",
          }}
        >
          {/* PyTamaro symbol at the top */}
          <div
            ref={symbolRef}
            style={{
              transform: `scale(${svgScale})`,
            }}
          >
            <PyTamaroSymbol />
          </div>

          <div style={{ flex: showIcons ? "1 0 auto" : "0.5 0 auto" }} />

          {/* Languages in the middle */}
          <div
            ref={languagesRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0",
              justifyContent: "center",
              textAlign: "center",
              fontSize: showIcons ? "1.25em" : "1em",
              width: "100%",
              padding: "0.25em 0",
              marginBottom: showIcons ? "0.4em" : "0.2em",
              overflow: "visible",
              flex: "0 0 auto",
            }}
          >
            {languages.map((lang, index) => (
              <p
                key={index}
                style={{
                  fontWeight: index === 0 ? "bold" : "normal",
                  margin: 0,
                  padding: "0 0.25em", // Add horizontal padding to ensure text doesn't touch edges
                  whiteSpace: "nowrap",
                  overflow: "visible", // Ensure text doesn't get clipped
                  width: "100%",
                  textAlign: "center",
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
                minHeight: showIcons ? "45%" : "35%",
                maxHeight: showIcons ? "60%" : "50%",
                position: "relative",
                marginTop: "auto",
                marginBottom: showIcons ? "0.8em" : "0.5em",
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
                  transform: `translate(-50%, -50%) scale(${
                    showIcons ? 1.1 : 0.9
                  })`,
                  paddingBottom: showIcons ? "0.8em" : "0.4em",
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
