/* eslint-disable operator-linebreak */
/* eslint-disable react/jsx-curly-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable react/no-array-index-key */
/* eslint-disable object-curly-newline */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/quotes */

import { useRef } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import PyTamaroSymbol from "./PyTamaro-symbol";
import { Language } from "./types";

interface LanguagePickerCardProps {
  languages: Language[];
  selectedLanguages: string[];
  onLanguageSelect: (index: number, languageCode: string | null) => void;
}

export default function LanguagePickerCard({
  languages,
  selectedLanguages,
  onLanguageSelect,
}: LanguagePickerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Helper to check if a language is already selected in another slot
  const isLanguageSelected = (languageCode: string) =>
    selectedLanguages.includes(languageCode);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          ref={cardRef}
          style={{
            width: "19em",
            border: "5px solid red",
            backgroundColor: "#FBE3E3",
            borderRadius: "30px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "15px",
            overflow: "hidden",
          }}
        >
          {/* PyTamaro svg symbol */}
          <div>
            <PyTamaroSymbol />
          </div>

          <Typography variant="h6" align="center" sx={{ mb: 1 }}>
            Select Languages
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 2 }}
          >
            Choose up to 4 languages for your cards
          </Typography>

          <Box
            sx={{
              width: "100%",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              p: 1,
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <FormControl
                key={index}
                fullWidth
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: 1,
                }}
              >
                <InputLabel id={`language-select-${index}-label`}>
                  {`Language ${index + 1}`}
                </InputLabel>
                <Select
                  labelId={`language-select-${index}-label`}
                  id={`language-select-${index}`}
                  value={selectedLanguages[index] || ""}
                  label={`Language ${index + 1}`}
                  onChange={(e) =>
                    onLanguageSelect(index, e.target.value || null)
                  }
                  sx={{
                    fontWeight: index === 0 ? "bold" : "normal",
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 0, 0, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 0, 0, 0.5)",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {languages.map((lang) => (
                    <MenuItem
                      key={lang.code}
                      value={lang.code}
                      disabled={
                        isLanguageSelected(lang.code) &&
                        selectedLanguages[index] !== lang.code
                      }
                    >
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Box>

          <Typography
            variant="caption"
            align="center"
            sx={{ mt: 1, fontStyle: "italic" }}
          >
            These languages will appear in the generated cards
          </Typography>
        </div>
      </div>
    </div>
  );
}
