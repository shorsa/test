export const toIsoDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseIsoDateString = (value: string): Date | null => {
  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!yearRaw || !monthRaw || !dayRaw) {
    return null;
  }
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  if (
    parsed.getFullYear() !== year
    || parsed.getMonth() !== month - 1
    || parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const addDaysToIsoDate = (value: string, days: number): string => {
  const date = parseIsoDateString(value);
  if (!date) {
    return toIsoDateString(new Date());
  }
  const updated = new Date(date);
  updated.setDate(updated.getDate() + days);
  return toIsoDateString(updated);
};

export const getTodayIsoDate = (): string => toIsoDateString(new Date());

export const isIsoDateInRange = (
  value: string,
  rangeStart?: string,
  rangeEnd?: string,
): boolean => {
  const date = parseIsoDateString(value);
  if (!date) {
    return false;
  }

  let startDate = rangeStart ? parseIsoDateString(rangeStart) : null;
  let endDate = rangeEnd ? parseIsoDateString(rangeEnd) : null;

  if (startDate && endDate && startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  if (startDate && date < startDate) {
    return false;
  }
  if (endDate && date > endDate) {
    return false;
  }

  return true;
};
