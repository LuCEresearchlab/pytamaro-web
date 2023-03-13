export default function getLanguageDisplayName(language : string) {
  if (Intl.DisplayNames) {
    const languageDisplayName = new Intl.DisplayNames([language], { type: 'language' }).of(language);
    return languageDisplayName
      ? (languageDisplayName.charAt(0).toUpperCase() + languageDisplayName.slice(1))
      : language.toUpperCase();
  }
  return language.toUpperCase();
}
