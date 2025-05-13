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
  showIcons = false,
}: BasicCardProps) {
  const baseWidth = showIcons ? 7 : 5.5;
  const cardRef = useRef<HTMLDivElement>(null);
  const symbolRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [calculatedWidth, setCalculatedWidth] = useState(baseWidth);
  const [calculatedHeight, setCalculatedHeight] = useState("auto");

  const iconWidth = 2.5;
  const iconHeight = 2.5;

  const hasParameterIcons =
    showIcons && parameterIcons.some((icon) => icon && icon.trim() !== "");
  const hasReturnIcon = showIcons && returnIcon && returnIcon.trim() !== "";
  const hasAnyIcons = hasParameterIcons || hasReturnIcon;

  useEffect(() => {
    setCalculatedWidth(baseWidth);

    setTimeout(() => {
      if (cardRef.current) {
        const textElements = Array.from(cardRef.current.querySelectorAll("p"));
        let maxTextWidth = 0;

        textElements.forEach((p) => {
          const span = document.createElement("span");
          span.style.visibility = "hidden";
          span.style.position = "absolute";
          span.style.whiteSpace = "nowrap";
          span.style.fontWeight = p.style.fontWeight || "normal";
          span.style.fontSize = p.style.fontSize || "inherit";
          span.innerText = p.innerText;
          document.body.appendChild(span);

          const width = span.getBoundingClientRect().width / 16;
          if (width > maxTextWidth) maxTextWidth = width;

          document.body.removeChild(span);
        });

        const svgElement = svgRef.current?.querySelector("svg");
        const svgWidth = svgElement ? (svgElement.clientWidth / 16) * 0.85 : 0;

        const textPadding = showIcons ? 3 : 2.2;
        const extraPadding = languages.length > 1 ? 1.8 : 0.8;

        const contentWidth = Math.max(maxTextWidth, svgWidth);

        const newWidth = Math.max(
          baseWidth,
          contentWidth + textPadding + extraPadding
        );

        setCalculatedWidth(newWidth);

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

        const arrowCount = Math.max(params.length, returnValue ? 1 : 0);

        const arrowSpacing = showIcons ? 2.5 : 2;

        const minArrowHeight = Math.max(
          arrowCount * arrowSpacing,
          arrowCount + 2
        );

        const baseMinHeight = showIcons ? 12 : 9;

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
        display: "inline-block",
        position: "relative",
        boxSizing: "border-box",
        overflow: "visible",
        margin: "0 auto",
        borderRadius: "2em",
        padding: "0.5em",
        width: "100%",
        height: "100%",
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
          height: "100%",
        }}
      >
        {/* Main card */}
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
            margin: "0",
          }}
        >
          {/* PyTamaro symbol at the top */}
          <div
            ref={symbolRef}
            style={{
              transform: `scale(0.8)`,
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
                  padding: "0 0.25em",
                  whiteSpace: "nowrap",
                  overflow: "visible",
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
                  transform: `translate(-50%, -50%) scale(1.1)`,
                  paddingBottom: showIcons ? "0.8em" : "0.4em",
                }}
              >
                <RenderSvg
                  svg={svg}
                  padding="0.5em"
                  maxWidth="90%"
                  maxHeight="90%"
                />
              </div>
            </div>
          )}

          {/* Add another spacer at the bottom for balance when no SVG */}
          {svg === undefined && <div style={{ flex: "1 0 auto" }} />}

          {/* Left-side arrows positioned absolutely */}
          <div
            style={{
              position: "absolute",
              left: "-3em",
              top: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: params.length === 1 ? "center" : "space-around",
              zIndex: 2,
              height: "100%",
            }}
          >
            {Array.from({ length: params?.length }).map((_, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  transformOrigin: "right center",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showIcons &&
                  parameterIcons &&
                  parameterIcons[index] &&
                  parameterIcons[index].trim() !== "" && (
                    <div
                      style={{
                        position: "absolute",
                        top: `-1.5em`,
                        width: `${iconWidth}em`,
                        height: `${iconHeight}em`,
                        right: "0.5em",
                        alignSelf: "center",
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <RenderSvg
                          svg={parameterIcons[index]}
                          maxWidth="90%"
                          maxHeight="90%"
                        />
                      </div>
                    </div>
                  )}
                <div
                  style={{
                    zIndex: 1,
                  }}
                >
                  <Arrow />
                </div>
              </div>
            ))}
          </div>

          {/* Right-side arrow positioned absolutely */}
          <div
            style={{
              position: "absolute",
              right: "-3em",
              top: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              zIndex: 2,
              height: "100%",
            }}
          >
            {Array.from({ length: returnValue ? 1 : 0 }).map((_, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  transformOrigin: "left center",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showIcons && returnIcon && returnIcon.trim() !== "" && (
                  <div
                    style={{
                      position: "absolute",
                      top: `-1.5em`,
                      width: `${iconWidth}em`,
                      height: `${iconHeight}em`,
                      right: "0",
                      alignSelf: "center",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <RenderSvg
                        svg={returnIcon}
                        maxWidth="90%"
                        maxHeight="90%"
                      />
                    </div>
                  </div>
                )}
                <div
                  style={{
                    zIndex: 1,
                  }}
                >
                  <Arrow />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
