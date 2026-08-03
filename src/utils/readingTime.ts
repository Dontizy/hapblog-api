import readingTime from "reading-time";

export const getReadingTime = (html: string): string => {
  const plainText = html.replace(/<[^>]+>/g, "").trim();

  return readingTime(plainText).text;
};
