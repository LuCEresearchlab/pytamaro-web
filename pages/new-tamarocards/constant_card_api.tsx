/* eslint-disable react/jsx-curly-newline */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable no-plusplus */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable new-cap */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import React, { useRef, useState, useEffect } from "react";
import { Box, Grid, Typography, Container, Button } from "@mui/material";
import ConstantCard from "./constant-card";
import { Card } from "./types";
import PyTamaroSymbol from "./PyTamaro-symbol";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import FunctionCard from "./function-card";

const colorConstants = [
  "red",
  "green",
  "blue",
  "yellow",
  "magenta",
  "transparent",
  "black",
  "white",
  "cyan",
];

const colorFunctions = ["rgb_color", "hsv_color"];

const pinConstants = [
  "top_left",
  "top_center",
  "top_right",
  "center_left",
  "center",
  "center_right",
  "bottom_left",
  "bottom_center",
  "bottom_right",
];

const pinFunctions = ["pin", "compose"];

const A4_WIDTH = 1123;
const A4_HEIGHT = 794;

export default function ConstantCardApiSheet({
  cards,
  functionCards,
  showIcons,
  selectedLanguages,
}: {
  cards: Card[];
  functionCards: Card[];
  showIcons: boolean;
  selectedLanguages: string[];
}) {
  const colorsRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const [calculatingColors, setCalculatingColors] = useState(false);
  const [calculatingPins, setCalculatingPins] = useState(false);

  const colorCards = cards.filter((card) => {
    const constantName = card.localization.en?.toLowerCase();
    return colorConstants.some((color) =>
      constantName?.includes(color.toLowerCase())
    );
  });

  const pinCards = cards.filter((card) => {
    const constantName = card.localization.en?.toLowerCase();
    return pinConstants.some((pin) =>
      constantName?.includes(pin.toLowerCase())
    );
  });

  // Featured cards for function display - for right side of each sheet
  const colorFunctionCards = functionCards.filter((card) => {
    const functionName = card.localization.en;
    return colorFunctions.includes(functionName);
  });

  const pinFunctionCards = functionCards.filter((card) => {
    const functionName = card.localization.en;
    return pinFunctions.includes(functionName);
  });

  useEffect(() => {
    // Force a repaint to ensure the layout is stable
    if (colorsRef.current) {
      const width = colorsRef.current.offsetWidth;
      colorsRef.current.style.width = `${width}px`;
    }
    if (pinsRef.current) {
      const width = pinsRef.current.offsetWidth;
      pinsRef.current.style.width = `${width}px`;
    }
  }, []);

  const filterCardLanguages = (localization: { [lang: string]: string }) => {
    const filteredLanguages: string[] = [];

    selectedLanguages.forEach((languageCode) => {
      if (languageCode && localization[languageCode]) {
        filteredLanguages.push(localization[languageCode]);
      }
    });

    if (filteredLanguages.length === 0) {
      return Object.values(localization);
    }

    return filteredLanguages;
  };

  const handleDownloadSheet = async (
    sheetRef: React.RefObject<HTMLDivElement>,
    setCalculating: React.Dispatch<React.SetStateAction<boolean>>,
    filename: string
  ) => {
    if (!sheetRef.current) return;

    setCalculating(true);

    try {
      // Clone the sheet to avoid modifying the original DOM
      const clonedSheet = sheetRef.current.cloneNode(true) as HTMLElement;

      // Temporarily add to body with absolute positioning to avoid layout impact
      clonedSheet.style.position = "absolute";
      clonedSheet.style.left = "-9999px";
      document.body.appendChild(clonedSheet);

      // Create a landscape A4 PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: sheetRef.current.offsetWidth,
        windowHeight: sheetRef.current.offsetHeight,
      };

      const canvas = await html2canvas(clonedSheet, options);

      // Clean up the cloned element after capturing
      document.body.removeChild(clonedSheet);

      const imgData = canvas.toDataURL("image/png");

      const margins = 5;
      const contentWidth = pdfWidth - margins * 2;
      const contentHeight = pdfHeight - margins * 2;

      const canvasRatio = canvas.width / canvas.height;
      let finalWidth;
      let finalHeight;

      if (canvasRatio > contentWidth / contentHeight) {
        finalWidth = contentWidth;
        finalHeight = finalWidth / canvasRatio;
      } else {
        finalHeight = contentHeight;
        finalWidth = finalHeight * canvasRatio;
      }

      const xOffset = margins + (contentWidth - finalWidth) / 2;
      const yOffset = margins + (contentHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(filename);
    } finally {
      setCalculating(false);
    }
  };

  // Helper to render a sheet with consistent layout
  const renderSheet = (
    refObject: React.RefObject<HTMLDivElement>,
    title: string,
    gridCards: Card[],
    featuredCards: Card[]
  ) => (
    <Box
      ref={refObject}
      sx={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        border: "1px solid #ddd",
        mb: 4,
        mx: "auto",
        backgroundColor: "#fff",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        overflow: "hidden",
        padding: 3,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffcc",
          padding: "1.5em",
          borderRadius: "4px",
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Typography variant="h6">Library doc</Typography>
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PyTamaroSymbol />
          <Typography variant="h6" sx={{ ml: 1 }}>
            PyTamaro
          </Typography>
        </Box>
      </Box>

      {/* Main content - split into left grid and right featured cards */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "calc(100% - 80px)",
          overflow: "hidden",
        }}
      >
        {/* Left side: 3x3 grid */}
        <Box
          sx={{
            width: "50%",
            height: "100%",
            pr: 2,
            ml: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Grid
            container
            spacing={2} // Increased spacing between grid items
            sx={{
              aspectRatio: "1/1",
              maxHeight: "100%",
              maxWidth: "100%",
            }}
          >
            {gridCards.slice(0, 9).map((card, idx) => (
              <Grid
                item
                xs={4}
                key={idx}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  aspectRatio: "1/1",
                  padding: "0.2rem", // Reduced internal padding to allow more space for content
                }}
              >
                <Box
                  sx={{
                    transform: "scale(0.7)", // Reduced scale to prevent overlapping
                    transformOrigin: "center center",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ transform: "scale(0.7)" }}>
                    {" "}
                    {/* Reduced inner scale as well */}
                    <ConstantCard
                      languages={filterCardLanguages(card.localization)}
                      svg={card.icon}
                      showIcons={showIcons}
                    />
                  </div>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Right side: Two featured cards */}
        <Box
          sx={{
            width: "50%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            pl: 2,
          }}
        >
          {featuredCards.map((card, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "50%",
                padding: "1rem 0",
              }}
            >
              <Box
                sx={{
                  transform: "scale(0.95)",
                  transformOrigin: "center center",
                  width: "90%",
                  height: "90%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // Make sure arrows are above icons with z-index
                  "& .parameter-arrow, & svg[data-arrow='true']": {
                    position: "relative",
                    zIndex: 10,
                  },
                  // Make sure icons stay below arrows
                  "& .parameter-icon": {
                    position: "relative",
                    zIndex: 5,
                  },
                }}
              >
                <div style={{ transform: "scale(0.8)" }}>
                  <FunctionCard
                    params={
                      Array.isArray(card.parametersIcon)
                        ? card.parametersIcon.map(
                            (icon: string, i: number) => ({
                              name: `Param ${i + 1}`,
                              type: "Icon",
                            })
                          )
                        : []
                    }
                    svg={card.icon}
                    returnValue={{
                      type: card.localization.en?.includes("color")
                        ? "Color"
                        : "Pin",
                      description: card.localization.en || "",
                    }}
                    languages={filterCardLanguages(card.localization)}
                    parameterIcons={showIcons ? card.parametersIcon : undefined}
                    returnIcon={showIcons ? card.returnIcon : ""}
                    showIcons={showIcons}
                  />
                </div>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth={false}>
      {/* Colors Section */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() =>
            handleDownloadSheet(
              colorsRef,
              setCalculatingColors,
              "pytamaro-colors.pdf"
            )
          }
          disabled={calculatingColors}
          sx={{ mr: 2 }}
        >
          {calculatingColors ? "Generating..." : "Download Colors PDF"}
        </Button>
      </Box>

      {renderSheet(
        colorsRef,
        "Colors · Farben · Colori",
        colorCards,
        colorFunctionCards
      )}

      {/* Pins Section */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() =>
            handleDownloadSheet(
              pinsRef,
              setCalculatingPins,
              "pytamaro-pins.pdf"
            )
          }
          disabled={calculatingPins}
        >
          {calculatingPins ? "Generating..." : "Download Pins PDF"}
        </Button>
      </Box>

      {renderSheet(pinsRef, "Pins · Pins · Perni", pinCards, pinFunctionCards)}
    </Container>
  );
}
