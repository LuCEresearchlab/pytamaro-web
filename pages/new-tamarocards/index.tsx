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
  Grid,
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
  const [calculatingPdf, setCalculatingPdf] = useState(false);

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

    setCalculatingPdf(true);

    try {
      // Create a portrait A4 PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate content width with margin
      const margins = 10; // 10mm margins
      const contentWidth = pdfWidth - margins * 2;
      const contentHeight = pdfHeight - margins * 2;

      // Set up options to capture the full grid
      const options = {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      };

      const canvas = await html2canvas(cardGridRef.current, options);
      const imgData = canvas.toDataURL("image/png");

      // Calculate scale to fit content on page
      const canvasRatio = canvas.width / canvas.height;
      let finalWidth;
      let finalHeight;

      // Determine which dimension is the limiting factor
      if (canvasRatio > contentWidth / contentHeight) {
        // Width limited
        finalWidth = contentWidth;
        finalHeight = finalWidth / canvasRatio;
      } else {
        // Height limited
        finalHeight = contentHeight;
        finalWidth = finalHeight * canvasRatio;
      }

      // Center the image on the page
      const xOffset = margins + (contentWidth - finalWidth) / 2;
      const yOffset = margins + (contentHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(
        showIcons ? "function-cards.pdf" : "pytamaro-reference-sheet.pdf"
      );
    } finally {
      setCalculatingPdf(false);
    }
  };

  const organizeCards = () => {
    const sortedCards = [...cards].sort((a, b) => {
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

    return (
      <Grid container spacing={0}>
        {sortedCards.map((card, index) => (
          <Grid item xs={12 / 5} key={`func-${index}`}>
            <Box
              sx={{
                border: "1px dotted #666",
                borderRadius: "0px", // Remove border radius for flush edges
                padding: "4px", // Minimal padding
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
                m: 0, // No margin
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
    );
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
              disabled={calculatingPdf}
            >
              {calculatingPdf ? "Generating..." : "Download PDF"}
            </Button>
          </Box>

          <Box
            ref={cardGridRef}
            sx={{
              width: "100%",
              maxWidth: showIcons ? "1800px" : "1600px",
              backgroundColor: "#ffffff",
              padding: "8px", // Reduced outer padding
              mx: "auto",
              boxSizing: "border-box",
              position: "relative",
              display: "block",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            {organizeCards()}
          </Box>
        </>
      )}
    </Container>
  );
}
