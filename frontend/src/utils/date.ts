import i18n from "../i18n";

export const formatDate = (dateString: string | Date): string => {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return i18n.t("invalidDate");
  }

  const currentLanguage = i18n.language || 'en';
  const locale = currentLanguage.startsWith('pt') ? 'pt-BR' : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};
