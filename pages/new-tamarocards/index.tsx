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
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Paper,
  Typography,
} from "@mui/material";
import CardsJson from "./pytamaro-function-data.json";
import FunctionCard from "./function-card";
import { Card, Language } from "./types";
import LanguagePickerCard from "./language-picker-card";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CardsRenderer() {
  const cards = Object.values(CardsJson) as Card[];

  const [showIcons, setShowIcons] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  useEffect(() => {
    const languageCodes = new Set<string>();

    Object.values(CardsJson).forEach((card) => {
      if (card.localization) {
        Object.keys(card.localization).forEach((code) => {
          languageCodes.add(code);
        });
      }
    });

    const parsedLanguages = Array.from(languageCodes).map((code) => ({
      code,
      name: code.toUpperCase(),
      enabled: false, // No longer using enabled flag
    }));

    setLanguages(parsedLanguages);

    if (parsedLanguages.length > 0) {
      setSelectedLanguages([parsedLanguages[0].code]);
    }
  }, []);

  const handleLanguageSelect = (index: number, languageCode: string | null) => {
    const updatedSelectedLanguages = [...selectedLanguages];

    if (!languageCode) {
      if (
        updatedSelectedLanguages.length === 1 &&
        updatedSelectedLanguages[0] === updatedSelectedLanguages[index]
      ) {
        return;
      }

      if (index < updatedSelectedLanguages.length) {
        updatedSelectedLanguages.splice(index, 1);
      }
    }
    if (index < updatedSelectedLanguages.length) {
      updatedSelectedLanguages[index] = languageCode ?? "";
    } else {
      while (updatedSelectedLanguages.length < index) {
        updatedSelectedLanguages.push("");
      }
      if (languageCode !== null) {
        updatedSelectedLanguages.push(languageCode);
      }
    }

    const cleanedSelections = updatedSelectedLanguages.filter(
      (lang, i) => lang !== "" || i < updatedSelectedLanguages.length - 1
    );

    setSelectedLanguages(cleanedSelections);
  };

  const handleGenerateCards = () => {
    setShowCards(true);
  };

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

  // testing with PDF download
  const cardGridRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!cardGridRef.current) return;

    // Show loading indicator or message

    // First ensure the grid is visible and rendered with all cards
    // const cardCount = cards.length;
    // const rowsNeeded = Math.ceil(cardCount / numColumns);

    // Calculate the scale factor needed to fit all on A4
    // const targetHeight = 297; // A4 height in mm
    // const targetWidth = 210; // A4 width in mm

    // Create a portrait A4 PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Set up options to capture the full grid
    const options = {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      height: cardGridRef.current.scrollHeight,
      width: cardGridRef.current.scrollWidth,
    };

    try {
      const canvas = await html2canvas(cardGridRef.current, options);
      const imgData = canvas.toDataURL("image/png");

      // Calculate scale to fit all content on page
      const canvasRatio = canvas.width / canvas.height;
      let finalWidth;
      let finalHeight;

      // Determine which dimension is the limiting factor
      if (canvasRatio > pdfWidth / pdfHeight) {
        // Width limited
        finalWidth = pdfWidth - 20; // Add 10mm margin on each side
        finalHeight = finalWidth / canvasRatio;
      } else {
        // Height limited
        finalHeight = pdfHeight - 20; // Add 10mm margin on top and bottom
        finalWidth = finalHeight * canvasRatio;
      }

      // Center the image on the page
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(showIcons ? "function-cards.pdf" : "api-sheet.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
      // Show error message to user
    }
  };

  const organizeCards = () => {
    const sortedCards = [...cards].sort((a, b) => {
      // Sort logic: cards without icons first, then cards with icons
      const aHasIcons =
        a.parametersIcon?.some((icon) => icon && icon.trim() !== "") ||
        (a.returnIcon && a.returnIcon.trim() !== "");
      const bHasIcons =
        b.parametersIcon?.some((icon) => icon && icon.trim() !== "") ||
        (b.returnIcon && b.returnIcon.trim() !== "");

      if (!aHasIcons && bHasIcons) return -1;
      if (aHasIcons && !bHasIcons) return 1;
      return 0;
    });

    // Generate cards in a fixed 3-column layout optimized for A4
    return sortedCards.map((card, index) => (
      <Box
        key={`func-${index}`}
        sx={{
          width: "calc(33.33% - 3em)", // 3 columns with spacing for arrows
          display: "inline-block",
          padding: "0",
          margin: "8px",
          boxSizing: "border-box",
          verticalAlign: "top",
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
    ));
  };

  return (
    <Container maxWidth={showCards ? false : "lg"} sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        PyTamaro Card Generator
      </Typography>

      {!showCards ? (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Card Preferences
          </Typography>

          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <LanguagePickerCard
              languages={languages}
              selectedLanguages={selectedLanguages}
              onLanguageSelect={handleLanguageSelect}
            />
          </Box>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showIcons}
                  onChange={() => setShowIcons(!showIcons)}
                />
              }
              label="Show Parameter/Return Icons"
            />
          </FormControl>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGenerateCards}
              disabled={selectedLanguages.length === 0}
            >
              Generate Cards
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <Button variant="outlined" onClick={() => setShowCards(false)}>
              Back to Settings
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </Box>

          <Box
            ref={cardGridRef}
            sx={{
              width: "100%",
              maxWidth: "800px", // Optimized for A4 width
              backgroundColor: "#f5f5f5",
              padding: "12px",
              mx: "auto",
              boxSizing: "border-box",
              // Fixed aspect ratio close to A4 (210mm x 297mm)
              aspectRatio: "210/297",
              position: "relative",
              display: "block", // Switch from grid to block layout
            }}
          >
            {organizeCards()}
          </Box>
        </>
      )}
    </Container>
  );
}
