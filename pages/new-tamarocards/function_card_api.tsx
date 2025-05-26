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
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useEffect, useRef, useState } from "react";
import FunctionCard from "./function-card";
import PyTamaroSymbol from "./PyTamaro-symbol";
import { Card } from "./types";
import { useTranslation } from "next-i18next";

interface DocumentationSheet {
  titleKey: string;
  elementsKeys: string[];
}

const sheet1: DocumentationSheet = {
  titleKey: "primitives",
  elementsKeys: [
    "rectangle",
    "ellipse",
    "circular_sector",
    "triangle",
    "text",
    "empty_graphic",
  ],
};

const sheet2: DocumentationSheet = {
  titleKey: "combinators",
  elementsKeys: ["above", "beside", "overlay", "rotate"],
};

const A4_WIDTH = 1123;
const A4_HEIGHT = 794;

export default function FunctionCardApiSheet({
  cards,
  showIcons,
  selectedLanguages,
}: {
  cards: Card[];
  showIcons: boolean;
  selectedLanguages: string[];
}) {
  const { t } = useTranslation("tamarocards");
  const primitivesRef = useRef<HTMLDivElement>(null);
  const combinatorsRef = useRef<HTMLDivElement>(null);
  const [calculatingPrimitives, setCalculatingPrimitives] = useState(false);
  const [calculatingCombinators, setCalculatingCombinators] = useState(false);

  const primitivesCards = cards.filter((card) => {
    const functionName = card.localization.en;
    return sheet1.elementsKeys.includes(functionName);
  });

  const combinatorsCards = cards.filter((card) => {
    const functionName = card.localization.en;
    return sheet2.elementsKeys.includes(functionName);
  });

  const getTranslatedTitles = (titleKey: string) => {
    const titles: string[] = [];
    selectedLanguages.forEach((lang) => {
      const titlePath = `titles.${titleKey}`;
      const translatedTitle = t(titlePath, { lng: lang });

      if (translatedTitle && !titles.includes(translatedTitle)) {
        titles.push(translatedTitle);
      }
    });

    if (titles.length === 0) {
      titles.push(titleKey.charAt(0).toUpperCase() + titleKey.slice(1));
    }

    return titles.join(" · ");
  };

  // Use effect to stabilize layout after component mounts
  useEffect(() => {
    // Force a repaint to ensure the layout is stable
    if (primitivesRef.current) {
      const width = primitivesRef.current.offsetWidth;
      primitivesRef.current.style.width = `${width}px`;
    }
    if (combinatorsRef.current) {
      const width = combinatorsRef.current.offsetWidth;
      combinatorsRef.current.style.width = `${width}px`;
    }
  }, []);

  const filterCardLanguages = (localization: { [lang: string]: string }) => {
    const filteredLanguages: string[] = [];

    selectedLanguages.forEach((languageCode) => {
      if (languageCode) {
        const englishName = localization.en;
        if (englishName) {
          const translatedName = t(`function_cards.${englishName}`, {
            lng: languageCode,
          });

          if (
            translatedName &&
            translatedName !== `function_cards.${englishName}`
          ) {
            filteredLanguages.push(translatedName);
          } else if (localization[languageCode]) {
            filteredLanguages.push(localization[languageCode]);
          }
        }
      }
    });

    // If no translations were found, return the English name
    if (filteredLanguages.length === 0 && localization.en) {
      return [localization.en];
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

  return (
    <Container maxWidth={false}>
      {/* Primitives Section - A4 Landscape Sheet */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() =>
            handleDownloadSheet(
              primitivesRef,
              setCalculatingPrimitives,
              "pytamaro-primitives.pdf"
            )
          }
          disabled={calculatingPrimitives}
          sx={{ mr: 2 }}
        >
          {calculatingPrimitives ? "Generating..." : "Download Primitives PDF"}
        </Button>
      </Box>

      <Box
        ref={primitivesRef}
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
            {getTranslatedTitles(sheet1.titleKey)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PyTamaroSymbol />
            <Typography variant="h6" sx={{ ml: 1 }}>
              PyTamaro
            </Typography>
          </Box>
        </Box>
        <Grid
          container
          spacing={1} // Further reduced spacing
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 80px)", // Reserve space for header
            overflow: "hidden", // Add this to prevent container overflow
          }}
        >
          {primitivesCards.map((card, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "scale(0.75)",
                transformOrigin: "center center", // Add this for stable scaling
                height: "33%", // Set fixed height to prevent reflow
              }}
            >
              <Box
                sx={{
                  "& .parameter-arrow, & svg[data-arrow='true']": {
                    position: "relative",
                    zIndex: 10,
                  },
                  "& .parameter-icon": {
                    position: "relative",
                    zIndex: 5,
                  },
                }}
              >
                <FunctionCard
                  params={
                    Array.isArray(card.parametersIcon)
                      ? card.parametersIcon.map((icon: string, i: number) => ({
                          name: `Param ${i + 1}`,
                          type: "Icon",
                        }))
                      : []
                  }
                  svg={card.icon}
                  returnValue={{
                    type: "Icon",
                    description: card.returnIcon || "",
                  }}
                  languages={filterCardLanguages(card.localization)}
                  parameterIcons={showIcons ? card.parametersIcon : undefined}
                  returnIcon={showIcons ? card.returnIcon : ""}
                  showIcons={showIcons}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() =>
            handleDownloadSheet(
              combinatorsRef,
              setCalculatingCombinators,
              "pytamaro-combinators.pdf"
            )
          }
          disabled={calculatingCombinators}
        >
          {calculatingCombinators
            ? "Generating..."
            : "Download Combinators PDF"}
        </Button>
      </Box>

      <Box
        ref={combinatorsRef}
        sx={{
          width: A4_WIDTH,
          height: A4_HEIGHT,
          border: "1px solid #ddd",
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
            {getTranslatedTitles(sheet2.titleKey)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PyTamaroSymbol />
            <Typography variant="h6" sx={{ ml: 1 }}>
              PyTamaro
            </Typography>
          </Box>
        </Box>
        <Grid
          container
          spacing={1}
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 80px)",
            overflow: "hidden",
          }}
        >
          {combinatorsCards.map((card, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "scale(0.8)",
                transformOrigin: "center center",
                height: "50%",
              }}
            >
              <Box
                sx={{
                  "& .parameter-arrow, & svg[data-arrow='true']": {
                    position: "relative",
                    zIndex: 10,
                  },
                  "& .parameter-icon": {
                    position: "relative",
                    zIndex: 5,
                  },
                }}
              >
                <FunctionCard
                  params={
                    Array.isArray(card.parametersIcon)
                      ? card.parametersIcon.map((icon: string, i: number) => ({
                          name: `Param ${i + 1}`,
                          type: "Icon",
                        }))
                      : []
                  }
                  svg={card.icon}
                  returnValue={{
                    type: "Icon",
                    description: card.returnIcon || "",
                  }}
                  languages={filterCardLanguages(card.localization)}
                  parameterIcons={showIcons ? card.parametersIcon : undefined}
                  returnIcon={showIcons ? card.returnIcon : ""}
                  showIcons={showIcons}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
