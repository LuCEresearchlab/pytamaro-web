export type Language = {
  code: string;
  name: string;
  enabled: boolean;
};

export type Card = {
  localization: { [lang: string]: string };
  icon: string;
  parametersIcon?: string[];
  returnIcon?: string;
};
