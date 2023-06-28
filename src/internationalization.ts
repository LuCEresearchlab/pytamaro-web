export default function getLanguageDisplayName(language : string) {
  if (Intl.DisplayNames) {
    const languageDisplayName = new Intl.DisplayNames([language], { type: 'language' }).of(language);
    return languageDisplayName
      ? (languageDisplayName.charAt(0).toUpperCase() + languageDisplayName.slice(1))
      : language.toUpperCase();
  }
  return language.toUpperCase();
}

export function format(n: number, singular: string, plural: string) {
  return (n === 1) ? `1 ${singular}` : `${n} ${plural}`;
}
