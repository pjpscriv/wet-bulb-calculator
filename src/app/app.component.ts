import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { filter, map, tap, pairwise, Observable, shareReplay } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Background, HumidUnit, Situation, Temp, TempUnit, WetBulbForm } from './app.types';
import {
  COLD_TEMP_BLURB, DANGEROUS_GRAD_END, DANGEROUS_GRAD_START,
  DANGEROUS_TEMP_BLURB, FATAL_GRAD_END, FATAL_GRAD_START,
  FATAL_TEMP_BLURB, SAFE_GRAD_END,
  SAFE_GRAD_START,
  SAFE_TEMP_BLURB
} from './app.constants';
import { convertToCelsius, convertToFahrenheit } from './helpers';
import chroma, { InterpolationMode } from 'chroma-js';


@Component({
  selector: 'wet-bulb',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // @ts-ignore
  @ViewChild('inputs', {static: true}) ngForm: NgForm;
  @HostBinding('style.background') background: string = 'red';

  // Form values (Inputs)
  public temperature: number = 20;
  public humidity: number = 50;
  public tempUnits: TempUnit = "celsius";
  public humidUnits: HumidUnit = "relativeHumidity";

  // Input Settings
  public tempMin: number = 15;
  public tempMax: number = 60;
  public inputWidth: string = '1.2em';

  // Color scales
  private colorMode: InterpolationMode = 'hcl';
  private safeDangerousStartScale = chroma.scale([SAFE_GRAD_START, DANGEROUS_GRAD_START]).mode(this.colorMode);
  private safeDangerousEndScale = chroma.scale([SAFE_GRAD_END, DANGEROUS_GRAD_END]).mode(this.colorMode);
  private dangerousFatalStartScale = chroma.scale([DANGEROUS_GRAD_START, FATAL_GRAD_START]).mode(this.colorMode);
  private dangerousFatalEndScale = chroma.scale([DANGEROUS_GRAD_END, FATAL_GRAD_END]).mode(this.colorMode);

  // Outputs
  public wetBulbTemp$: Observable<Temp>;
  public blurb$: Observable<Array<string>>;
  public emoji$: Observable<string>;
  public gradient$: Observable<string>;

  public ngOnInit(): void {
    // @ts-ignore
    this.wetBulbTemp$ = this.ngForm.valueChanges.pipe(
      filter(v => !!v),
      pairwise(),
      // tap(v => console.log("Form change", v)),
      tap(([f_old, f_new]) => {
        if (this.isUnitChange(f_old, f_new)) {
          this.temperature = this.convertToUnit(f_new.temperature, f_new.tempUnits, 0);
          this.tempMin = this.convertToUnit(this.tempMin, f_new.tempUnits, 0);
          this.tempMax = this.convertToUnit(this.tempMax, f_new.tempUnits, 0);
          if (f_new.tempUnits === 'fahrenheit')
            this.inputWidth = '1.8em';
          else
            this.inputWidth = '1.2em';
        }
      }),
      map(([_, f_new]: [WetBulbForm, WetBulbForm]) => this.wetBulbTemperature(f_new)),
      shareReplay()
    );

    let temperature$: Observable<number> = this.wetBulbTemp$.pipe(
      map(t => t.unit === 'fahrenheit' ? convertToCelsius(t.temp) : t.temp),
      shareReplay()
    );

    this.gradient$ = temperature$.pipe(
      map(t => this.tempToBackground(t)),
      tap(b => this.background = b.endColor),
      map(b => b.gradient)
    );

    let situation$: Observable<Situation> = temperature$.pipe(
      map(this.wetBulbTempToSituation),
      shareReplay()
    );

    this.blurb$ = situation$.pipe(
      map(s => {
        if (s === 'fatal') {
          return FATAL_TEMP_BLURB;
        } else if (s === 'dangerous') {
          return DANGEROUS_TEMP_BLURB;
        } else if (s === 'safe') {
          return SAFE_TEMP_BLURB;
        } else {
          return COLD_TEMP_BLURB;
        }
      })
    );

    this.emoji$ = situation$.pipe(
      map(s => {
        if (s === 'fatal') {
          return '💀'
        } else if (s === 'dangerous') {
          return '🥵';
        } else if (s === 'safe') {
          return '😎';
        } else {
          return '🥶'
        }
      })
    );
  }

  private isUnitChange(oldVal: WetBulbForm, newVal: WetBulbForm): boolean {
    return (oldVal.tempUnits === 'celsius' && newVal.tempUnits === 'fahrenheit') ||
      (oldVal.tempUnits === 'fahrenheit' && newVal.tempUnits === 'celsius')
  }

  private convertToUnit(temp: number, unit: TempUnit, dp: number|null = null): number {
    if (unit === 'fahrenheit')
      return convertToFahrenheit(temp, dp);
    else if (unit === 'celsius')
      return convertToCelsius(temp, dp)
    else
      throw `Incorrect units: ${temp}, ${unit}`;
  }

  private wetBulbTemperature(newVal: WetBulbForm): Temp {

    let temp: number = newVal.temperature;
    const humidity: number = newVal.humidity;
    const tempUnit: TempUnit = newVal.tempUnits;

    if (tempUnit === 'fahrenheit')
      temp = convertToCelsius(temp)

    const const1: number = 0.151977;
    const const2: number = 8.313659;
    const const3: number = 1.676331;
    const const4: number = 0.00391838;
    const const5: number = 0.023101;
    const const6: number = 4.686035;

    const part1: number = temp * Math.atan(const1 * ((humidity + const2) ** .5));
    const part2: number = Math.atan(temp + humidity) - Math.atan(humidity - const3);
    const part3: number = const4 * (humidity ** 1.5) * Math.atan(const5 * humidity);

    let wetBulbTemp = part1 + part2 + part3 - const6;

    if (tempUnit === 'fahrenheit')
      wetBulbTemp = convertToFahrenheit(wetBulbTemp)

    return { temp: wetBulbTemp, unit: tempUnit };
  }

  private wetBulbTempToSituation(temp: number): Situation {
    return temp < 30 ? ( temp > -10 ? 'safe' : 'cold') : (temp > 35 ? 'fatal' : 'dangerous')
  }

  private tempToBackground(temp: number): Background {
    let start_color: string;
    let end_color: string;

    if (temp < 20) {
      start_color = SAFE_GRAD_START;
      end_color = SAFE_GRAD_END;

    } else if (temp < 30) {
      let progress =  0.1 * (temp - 20);
      start_color = this.safeDangerousStartScale(progress).hex();
      end_color = this.safeDangerousEndScale(progress).hex();

    } else if (temp < 35) {
      let progress =  0.2 * (temp - 30);
      start_color = this.dangerousFatalStartScale(progress).hex();
      end_color = this.dangerousFatalEndScale(progress).hex();

    } else {
      start_color = FATAL_GRAD_START;
      end_color = FATAL_GRAD_END;
    }

    return {
      gradient: `linear-gradient(180deg, ${start_color} 0%, ${end_color} 100%)`,
      endColor: end_color
    };
  }
}
