import { Pipe, PipeTransform } from '@angular/core';
import { Temp } from './app.types';

@Pipe({
  name: 'temperature'
})
export class TemperaturePipe implements PipeTransform {

  // Config
  private dp: number = 1;

  transform(value: Temp | null): string {
    if (value === null)
      return '';
    let number = Math.floor(value.temp * (10 ** this.dp)) / (10 ** this.dp);
    let unit = value.unit === 'fahrenheit' ? '°F' : '°C';
    return `${number.toFixed(this.dp)}${unit}`;
  }
}
