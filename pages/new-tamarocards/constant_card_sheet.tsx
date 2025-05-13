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
import { useRef, useState } from "react";
import { Box, Grid, Button } from "@mui/material";
import ConstantCard from "./constant-card";
import { Card } from "./types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ConstantCardSheet({
  cards,
  showIcons,
  selectedLanguages,
}: {
  cards: Card[];
  showIcons: boolean;
  selectedLanguages: string[];
}) {
  const cardGridRef = useRef<HTMLDivElement>(null);
  const [calculatingPdf, setCalculatingPdf] = useState(false);

  const sortedCards = [...cards].sort((a, b) => {
    const aHasIcons = a.icon && a.icon.trim() !== "";
    const bHasIcons = b.icon && b.icon.trim() !== "";

    if (!aHasIcons && bHasIcons) return -1;
    if (aHasIcons && !bHasIcons) return 1;
    return 0;
  });

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

  const handleDownloadPDF = async () => {
    if (!cardGridRef.current) return;

    setCalculatingPdf(true);

    try {
      // Create a landscape A4 PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Improved options for capturing the full card grid
      const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: cardGridRef.current.scrollWidth,
        windowHeight: cardGridRef.current.scrollHeight,
      };

      const canvas = await html2canvas(cardGridRef.current, options);
      const imgData = canvas.toDataURL("image/png");

      // Calculate scale to fit content on landscape page
      const canvasRatio = canvas.width / canvas.height;

      // For landscape, we have more width than height
      const margins = 5;
      const contentWidth = pdfWidth - margins * 2;
      const contentHeight = pdfHeight - margins * 2;

      // Determine if width or height is the limiting factor
      let finalWidth;
      let finalHeight;

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

      // Add multiple pages if needed
      if (canvasRatio < 1 && finalHeight === contentHeight) {
        // Very tall content that might need multiple pages
        const totalPages = Math.ceil(
          canvas.height / (canvas.width / contentWidth)
        );

        // For each additional page (only if needed)
        for (let page = 1; page < totalPages; page++) {
          pdf.addPage("landscape"); // Ensure landscape orientation

          // Calculate vertical position for this segment
          pdf.addImage(
            imgData,
            "PNG",
            xOffset,
            yOffset - page * contentHeight,
            finalWidth,
            finalHeight
          );
        }
      }

      pdf.save("constant-cards.pdf");
    } finally {
      setCalculatingPdf(false);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleDownloadPDF}
          disabled={calculatingPdf}
        >
          {calculatingPdf ? "Generating PDF..." : "Download Constant Cards PDF"}
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
        <Grid container spacing={0}>
          {sortedCards.map((card, index) => (
            <Grid item xs={12 / 5} key={`const-${index}`}>
              <Box
                sx={{
                  border: "1px dotted #666",
                  borderRadius: "0px",
                  padding: "4px",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxSizing: "border-box",
                  m: 0,
                }}
              >
                <ConstantCard
                  languages={filterCardLanguages(card.localization)}
                  svg={card.icon}
                  showIcons={showIcons}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
