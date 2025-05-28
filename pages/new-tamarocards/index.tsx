/* eslint-disable no-console */
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
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  Paper,
  Switch,
  Typography,
} from "@mui/material";
import { Card, Language } from "./types";
import FunctionCardSheet from "./function_card_sheet";
import ConstantCardSheet from "./constant_card_sheet";
import LanguagePickerCard from "./language-picker-card";
import FunctionCardApiSheet from "./function_card_api";
import ConstantCardApiSheet from "./constant_card_api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import fs from "fs";
import path from "path";

export default function CardsRenderer({
  functionCards,
  constantCards,
  availableLanguages,
}: {
  functionCards: Card[];
  constantCards: Card[];
  availableLanguages: string[];
}) {
  const [showIcons, setShowIcons] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);

  useEffect(() => {
    const parsedLanguages = availableLanguages.map((code) => ({
      code,
      name: code.toUpperCase(),
      enabled: code === "en",
    }));

    setLanguages(parsedLanguages);

    if (availableLanguages.includes("en")) {
      setSelectedLanguages(["en"]);
    } else if (parsedLanguages.length > 0) {
      // Fallback if English is not available
      setSelectedLanguages([parsedLanguages[0].code]);
    }
  }, [availableLanguages]);

  const handleLanguageSelect = (index: number, languageCode: string | null) => {
    const updatedSelectedLanguages = [...selectedLanguages];

    if (index === 0 && !languageCode) {
      return;
    }

    if (!languageCode) {
      if (index < updatedSelectedLanguages.length) {
        updatedSelectedLanguages.splice(index, 1);
      }
    } else if (index < updatedSelectedLanguages.length) {
      updatedSelectedLanguages[index] = languageCode;
    } else {
      while (updatedSelectedLanguages.length < index) {
        updatedSelectedLanguages.push("");
      }
      updatedSelectedLanguages.push(languageCode);
    }

    const cleanedSelections = updatedSelectedLanguages.filter(
      (lang, i) => lang !== "" || i < updatedSelectedLanguages.length - 1
    );

    setSelectedLanguages(cleanedSelections);
  };

  const handleGenerateCards = () => {
    setShowCards(true);
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body1">Cuttable Sheets</Typography>
              <Switch
                checked={showIcons}
                onChange={() => setShowIcons(!showIcons)}
              />
              <Typography variant="body1">API Sheets</Typography>
            </Box>
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
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 4 }}>
            <Button variant="outlined" onClick={() => setShowCards(false)}>
              Back to Settings
            </Button>
          </Box>

          {showIcons ? (
            <>
              {/* Function API Sheets */}
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ mt: 4, mb: 2 }}
              >
                Function API Sheets
              </Typography>
              <FunctionCardApiSheet
                cards={functionCards}
                showIcons={showIcons}
                selectedLanguages={selectedLanguages}
              />

              {/* Constant API Sheets */}
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ mt: 6, mb: 2 }}
              >
                Constant API Sheets
              </Typography>
              <ConstantCardApiSheet
                cards={constantCards}
                functionCards={functionCards}
                showIcons={showIcons}
                selectedLanguages={selectedLanguages}
              />
            </>
          ) : (
            <>
              {/* Regular function cards */}
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ mt: 4, mb: 2 }}
              >
                Function Cards
              </Typography>
              <FunctionCardSheet
                cards={functionCards}
                showIcons={showIcons}
                selectedLanguages={selectedLanguages}
              />

              {/* Regular constant cards */}
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ mt: 6, mb: 2 }}
              >
                Constant Cards
              </Typography>
              <ConstantCardSheet
                cards={constantCards}
                showIcons={showIcons}
                selectedLanguages={selectedLanguages}
              />
            </>
          )}
        </>
      )}
    </Container>
  );
}

export async function getStaticProps() {
  const localesPath = path.join(process.cwd(), "public/locales");
  const functionSvgsPath = path.join(process.cwd(), "public/function_svgs");
  const constantSvgsPath = path.join(process.cwd(), "public/constant_svgs");
  const availableLanguages: string[] = [];
  const functionCards: Card[] = [];
  const constantCards: Card[] = [];

  const allFunctionNames = new Set<string>();
  const allConstantNames = new Set<string>();

  try {
    const languageFolders = fs.readdirSync(localesPath);

    languageFolders.forEach((folder) => {
      const tamaroCardsPath = path.join(
        localesPath,
        folder,
        "tamarocards.json"
      );
      if (fs.existsSync(tamaroCardsPath)) {
        availableLanguages.push(folder);
        if (folder === "en") {
          try {
            const translationContent = fs.readFileSync(tamaroCardsPath, "utf8");
            const translations = JSON.parse(translationContent);
            if (translations.function_cards) {
              Object.keys(translations.function_cards).forEach((key) => {
                allFunctionNames.add(key);
              });
            }
            if (translations.constant_cards) {
              Object.keys(translations.constant_cards).forEach((key) => {
                allConstantNames.add(key);
              });
            }
          } catch (e) {
            console.error(`Error parsing tamarocards JSON for ${folder}:`, e);
          }
        }
      }
    });
    if (availableLanguages.includes("en")) {
      const englishIndex = availableLanguages.indexOf("en");
      availableLanguages.splice(englishIndex, 1);
      availableLanguages.unshift("en");
    }
    const processedFunctions = new Map<string, boolean>();
    if (fs.existsSync(functionSvgsPath)) {
      const functionFolders = fs.readdirSync(functionSvgsPath);
      functionFolders.forEach((functionName) => {
        const functionPath = path.join(functionSvgsPath, functionName);
        if (!fs.statSync(functionPath).isDirectory()) return;
        processedFunctions.set(functionName, true);
        const localization: Record<string, string> = { en: functionName };
        const svgFiles = fs.readdirSync(functionPath);
        const iconFile = svgFiles.find((f) => f === `${functionName}_icon.svg`);
        const icon = iconFile
          ? `/function_svgs/${functionName}/${iconFile}`
          : "";

        const returnIconFile = svgFiles.find((f) => f.includes("_out.svg"));
        const returnIcon = returnIconFile
          ? `/function_svgs/${functionName}/${returnIconFile}`
          : "";

        const parameterFiles = svgFiles
          .filter((f) => f.includes("_in_"))
          .sort((a, b) => {
            const numA = parseInt(a.match(/_in_(\d+)\.svg/)?.[1] || "0", 10);
            const numB = parseInt(b.match(/_in_(\d+)\.svg/)?.[1] || "0", 10);
            return numA - numB;
          });

        const parameterIcons = parameterFiles.map(
          (file) => `/function_svgs/${functionName}/${file}`
        );

        functionCards.push({
          localization,
          icon,
          returnIcon,
          parametersIcon: parameterIcons,
        });
      });
    }

    allFunctionNames.forEach((functionName) => {
      if (processedFunctions.has(functionName)) return;

      const localization: Record<string, string> = { en: functionName };

      functionCards.push({
        localization,
        icon: "",
        returnIcon: "",
        parametersIcon: [],
      });
    });

    const processedConstants = new Map<string, boolean>();
    if (fs.existsSync(constantSvgsPath)) {
      const constantSvgFiles = fs.readdirSync(constantSvgsPath);

      constantSvgFiles.forEach((svgFile) => {
        if (!svgFile.endsWith(".svg")) return;

        const constantName = svgFile.replace(".svg", "");
        processedConstants.set(constantName, true);

        const localization: Record<string, string> = { en: constantName };
        const icon = `/constant_svgs/${svgFile}`;

        constantCards.push({
          localization,
          icon,
          parametersIcon: [],
        });
      });
    }

    allConstantNames.forEach((constantName) => {
      if (processedConstants.has(constantName)) return;

      const localization: Record<string, string> = { en: constantName };

      constantCards.push({
        localization,
        icon: "",
        parametersIcon: [],
      });
    });
  } catch (error) {
    console.error("Error processing card data:", error);
  }

  return {
    props: {
      functionCards,
      constantCards,
      availableLanguages,
      ...(await serverSideTranslations(
        "en",
        ["tamarocards"],
        null,
        availableLanguages
      )),
    },
  };
}
