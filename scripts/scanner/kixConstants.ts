/**
 * Authoritative RM4SCC / PostNL KIX Character to DAFT 4-state bar mapping.
 * Each character consists of exactly 4 bars, with 2 top extensions (A or F)
 * and 2 bottom extensions (D or F).
 * T = Tracker (middle 1/3)
 * A = Ascender (top 2/3)
 * D = Descender (bottom 2/3)
 * F = Full (full height)
 */
export const CHAR_TO_DAFT: Record<string, string> = {
  '0': 'TTFF',
  '1': 'TDAF',
  '2': 'TDFA',
  '3': 'DTAF',
  '4': 'DTFA',
  '5': 'DDAA',
  '6': 'TADF',
  '7': 'TFTF',
  '8': 'TFDA',
  '9': 'DATF',
  'A': 'DADA',
  'B': 'DFTA',
  'C': 'TAFD',
  'D': 'TFAD',
  'E': 'TFFT',
  'F': 'DAAD',
  'G': 'DAFT',
  'H': 'DFAT',
  'I': 'ATDF',
  'J': 'ADTF',
  'K': 'ADDA',
  'L': 'FTTF',
  'M': 'FTDA',
  'N': 'FDTA',
  'O': 'ATFD',
  'P': 'ADAD',
  'Q': 'ADFT',
  'R': 'FTAD',
  'S': 'FTFT',
  'T': 'FDAT',
  'U': 'AADD',
  'V': 'AFTD',
  'W': 'AFDT',
  'X': 'FATD',
  'Y': 'FADT',
  'Z': 'FFTT',
};

// Reverse lookup table: DAFT pattern -> Character
export const DAFT_TO_CHAR: Record<string, string> = Object.entries(CHAR_TO_DAFT).reduce(
  (acc, [char, daft]) => {
    acc[daft] = char;
    return acc;
  },
  {} as Record<string, string>
);
