export type TempUnit = "celsius" | "fahrenheit";
export type HumidUnit = "relativeHumidity";
export type Situation = 'safe' | 'dangerous' | 'fatal' | 'cold';
export type WetBulbForm = {
  temperature: number,
  tempUnits: TempUnit,
  humidity: number,
  humidUnits: HumidUnit
}
export type Temp = {
  temp: number,
  unit: TempUnit
}
export type Background = {
  gradient: string,
  endColor: string
}
