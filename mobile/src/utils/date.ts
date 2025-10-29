export const formatDate = (dateString: string | Date): string => {
  // Null, undefined, "" ...
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // 'pt-BR' locale =  dd/mm/yyyy
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
  }).format(date);
};
