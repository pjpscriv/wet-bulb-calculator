export function convertToCelsius(fahrenheit: number, dp: number | null = null): number {
  let temp = (fahrenheit - 32) / 1.8;
  if (dp !== null)
    temp = Math.floor(temp * (10 ** dp)) / (10 ** dp);
  return temp;
}

export function convertToFahrenheit(celsius: number, dp: number | null = null): number {
  let temp = (celsius * 1.8) + 32;
  if (dp !== null)
      temp = Math.floor(temp * (10 ** dp)) / (10 ** dp);
  return temp;
}
