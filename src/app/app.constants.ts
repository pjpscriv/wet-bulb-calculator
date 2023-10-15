// Colors
export const SAFE_GRAD_START = '#191D47';
export const SAFE_GRAD_END = '#4DBBDE';
export const DANGEROUS_GRAD_START = '#FFBA52';
export const DANGEROUS_GRAD_END = '#FF5252';
export const FATAL_GRAD_START = '#FF5252';
export const FATAL_GRAD_END = '#9747FF';

// Blurbs
export const SAFE_TEMP_BLURB: Array<string> = [
  "The wet-bulb temperature is within the safe range.",
  "Your powers of evaporative cooling will still be working perfectly."
];
export const DANGEROUS_TEMP_BLURB: Array<string> = [
  "Wet-bulb temperatures above 30 °C (86 °F) pose potential fatal danger to humans outside.",
  "It's also very uncomfortable. In these conditions, you should avoid direct sunlight and drink lots of water."
];
export const FATAL_TEMP_BLURB: Array<string> = [
  "Theoretically, humans cannot survive for very long when the wet-bulb temperature exceeds 35 °C (95 °F).",
  "If that's what you're experiencing, go to a place with air conditioning and drink lots of water as soon as possible."
]
export const COLD_TEMP_BLURB: Array<string> = [
  ...SAFE_TEMP_BLURB,
  "Though you might be getting a bit chilly."
];
