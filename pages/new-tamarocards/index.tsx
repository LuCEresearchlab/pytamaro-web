/* eslint-disable arrow-parens */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */
import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CardsJson from "./pytamaro-function-data.json";
import FunctionCard from "./function-card";
import ValueCard from "./value-card";
import ConstantCard from "./constant-card";

interface Card {
  localization: { [lang: string]: string };
  icon: string;
  parametersIcon?: string[];
  returnIcon?: string;
}

interface Language {
  code: string;
  name: string;
  enabled: boolean;
}

export default function CardsRenderer() {
  const cards = Object.values(CardsJson) as Card[];

  // State for form values
  const [showIcons, setShowIcons] = useState(true);
  const [showCards, setShowCards] = useState(false);

  // Language order and selection state
  const [languages, setLanguages] = useState<Language[]>([
    { code: "en", name: "English", enabled: true },
    { code: "it", name: "Italian", enabled: false },
    { code: "fr", name: "French", enabled: false },
    { code: "de", name: "German", enabled: false },
  ]);

  // Toggle language selection
  const toggleLanguage = (index: number) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index].enabled = !updatedLanguages[index].enabled;
    setLanguages(updatedLanguages);
  };

  // Move language up in order
  const moveLanguageUp = (index: number) => {
    if (index === 0) return;
    const updatedLanguages = [...languages];
    const temp = updatedLanguages[index];
    updatedLanguages[index] = updatedLanguages[index - 1];
    updatedLanguages[index - 1] = temp;
    setLanguages(updatedLanguages);
  };

  // Move language down in order
  const moveLanguageDown = (index: number) => {
    if (index === languages.length - 1) return;
    const updatedLanguages = [...languages];
    const temp = updatedLanguages[index];
    updatedLanguages[index] = updatedLanguages[index + 1];
    updatedLanguages[index + 1] = temp;
    setLanguages(updatedLanguages);
  };

  // Generate cards based on selections
  const handleGenerateCards = () => {
    setShowCards(true);
  };

  // Filter and order card languages based on selection
  const filterCardLanguages = (localization: { [lang: string]: string }) => {
    const filteredLanguages: string[] = [];
    const enabledLanguages = languages.filter((lang) => lang.enabled);

    // Use user-defined order from the languages array
    enabledLanguages.forEach((lang) => {
      if (localization[lang.code]) {
        filteredLanguages.push(localization[lang.code]);
      }
    });

    // Default to all languages if none selected
    if (filteredLanguages.length === 0) {
      return Object.values(localization);
    }

    return filteredLanguages;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Card Preferences
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select and Order Languages:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Check the languages you want to include and use the arrows to
              change their order
            </Typography>

            <List
              sx={{
                bgcolor: "background.paper",
                border: "1px solid #eee",
                borderRadius: 1,
              }}
            >
              {languages.map((language, index) => (
                <ListItem key={language.code} dense>
                  <ListItemIcon>
                    <DragIndicatorIcon color="action" />
                  </ListItemIcon>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={language.enabled}
                      onChange={() => toggleLanguage(index)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={language.name} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="move up"
                      onClick={() => moveLanguageUp(index)}
                      disabled={index === 0}
                      size="small"
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="move down"
                      onClick={() => moveLanguageDown(index)}
                      disabled={index === languages.length - 1}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <ArrowDownwardIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={showIcons}
                  onChange={() => setShowIcons(!showIcons)}
                />
              }
              label="Show Parameter/Return Icons"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            {cards.map((card, index) => (
              <div key={index}>
                <FunctionCard
                  type="function"
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
              </div>
            ))}
          </Box>
          <ValueCard value={250} />
          <ValueCard value={50} />
          <ValueCard value={0} />
          <ConstantCard />
        </>
      )}
    </Container>
  );
}

// Localization from https://github.com/LuCEresearchlab/pytamaro/blob/main/pytamaro/localization.py
// Card images from https://pytamaro.si.usi.ch/tamarocards
