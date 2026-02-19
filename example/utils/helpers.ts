import { CURRENCY_SYMBOL } from "@constants/constants";

interface DateFormatOptions {
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
}

const DEFAULT_DATE_FORMAT: DateFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

/**
 * @description Formats the date from ISO string to the default format
 * @param {string} isoString - The ISO string
 * @returns {string} The formatted date
 */
function formatDate(isoString?: string): string {
  if (!isoString || typeof isoString !== "string") {
    return "";
  }

  try {
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-GB", DEFAULT_DATE_FORMAT);
  } catch (error) {
    if (__DEV__) {
      console.log("Error formatting date:", error, "Input:", isoString);
    }
    return "";
  }
}

/**
 * @description Strips the HTML from the string
 * @param {string} htmlString - The HTML string
 * @returns {string} The stripped HTML
 */
function stripHtml(htmlString?: string): string {
  try {
    if (typeof htmlString !== "string" || !htmlString.length) {
      return "";
    }

    // Remove HTML tags and decode basic HTML entities
    const withoutTags = htmlString.replace(/<[^>]*>/g, "");
    const decoded = withoutTags
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ");

    return decoded.trim();
  } catch (error) {
    if (__DEV__) {
      console.log("Error stripping HTML:", error, "Input:", htmlString);
    }
    return "";
  }
}

/**
 * @description Parses the HTML to bold
 * @param {string} htmlString - The HTML string
 * @returns {Array<{text: string, isBold: boolean}>} The parsed HTML
 */
function parseHtmlToBold(
  htmlString?: string
): { text: string; isBold: boolean }[] {
  try {
    if (typeof htmlString !== "string" || !htmlString.length) {
      return [];
    }

    const result: { text: string; isBold: boolean }[] = [];
    let currentIndex = 0;

    // Find all <b> and </b> tags
    const boldRegex = /<b>(.*?)<\/b>/gi;
    let match;

    while ((match = boldRegex.exec(htmlString)) !== null) {
      // Add text before the bold tag
      if (match.index > currentIndex) {
        const beforeText = htmlString.slice(currentIndex, match.index);
        const cleanBeforeText = stripHtml(beforeText);
        if (cleanBeforeText) {
          result.push({ text: cleanBeforeText, isBold: false });
        }
      }

      // Add the bold text
      const boldText = stripHtml(match[1]);
      if (boldText) {
        result.push({ text: boldText, isBold: true });
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text after the last bold tag
    if (currentIndex < htmlString.length) {
      const remainingText = htmlString.slice(currentIndex);
      const cleanRemainingText = stripHtml(remainingText);
      if (cleanRemainingText) {
        result.push({ text: cleanRemainingText, isBold: false });
      }
    }

    // If no bold tags found, return the entire text as non-bold
    if (result.length === 0) {
      const cleanText = stripHtml(htmlString);
      if (cleanText) {
        result.push({ text: cleanText, isBold: false });
      }
    }

    return result;
  } catch (error) {
    if (__DEV__) {
      console.log("Error parsing HTML to bold:", error, "Input:", htmlString);
    }
    return [];
  }
}

/**
 * @description Parses the month limit message
 * @param {string} message - The message
 * @returns {string} The parsed month limit message
 */
const parseMonthLimitMessage = (message: string) => {
  if (message.startsWith("MonthLimit;")) {
    const parts = message.split(";");
    const spent =
      parts.find((part) => part.startsWith("spent:"))?.split(":")[1] || "0";
    const limit =
      parts.find((part) => part.startsWith("limit:"))?.split(":")[1] || "500";

    if (spent === "0") {
      return `You can spend up to ${CURRENCY_SYMBOL}${limit} this month.`;
    }

    return `You've reached your monthly spending limit. Spent: ${CURRENCY_SYMBOL}${spent} of ${CURRENCY_SYMBOL}${limit}`;
  }
  return message;
};

/**
 * @description Formats the number with spaces
 * @param {number | string} number - The number
 * @returns {string} The formatted number
 */
function formatNumberWithSpaces(number: number | string): string {
  try {
    const numString = typeof number === "string" ? number : number.toString();

    // Handle empty or invalid input
    if (!numString || numString === "0") {
      return "0";
    }

    // Split by decimal point if exists
    const parts = numString.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add commas every 3 digits from right to left (UK format)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Return with decimal part if it exists
    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  } catch (error) {
    if (__DEV__) {
      console.log(
        "Error formatting number with spaces:",
        error,
        "Input:",
        number
      );
    }
    return "0";
  }
}

/**
 * @description Removes the numbers from the text
 * @param {string} text - The text
 * @returns {string} The text without numbers
 */
const removeNumbers = (text: string): string => text.replace(/\d/g, "");

/**
 * @description Removes the zeros only from the text
 * @param {string} text - The text
 * @returns {string} The text without zeros only
 */
const removeZerosOnly = (text: string): string => {
  if (/^[0\s]*$/.test(text)) {
    return "";
  }
  return text;
};

export {
  formatDate,
  formatNumberWithSpaces,
  parseHtmlToBold,
  parseMonthLimitMessage,
  removeNumbers,
  removeZerosOnly,
  stripHtml
};

