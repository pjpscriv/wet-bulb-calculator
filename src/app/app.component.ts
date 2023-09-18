import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { map, Observable, tap, filter } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Situation, TempUnit } from './app.types';
import { COLD_TEMP_BLURB, DANGEROUS_TEMP_BLURB, FATAL_TEMP_BLURB, SAFE_TEMP_BLURB } from './app.constants';

@Component({
  selector: 'wet-bulb',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  // @ts-ignore
  @ViewChild('inputs',{static: true}) ngForm: NgForm;
  @HostBinding('style.background') gradient: string = 'linear-gradient(180deg, #191D47 0%, rgba(43.14, 174.28, 215.69, 0.84) 100%)';

  // Form values (Inputs)
  public temperature: number = 10;
  public humidity: number = 50;
  public tempUnits: TempUnit = "celsius";

  // Outputs
  public wetBulbTemp$: Observable<number>;
  public blurb$: Observable<Array<string>>;
  public emoji$: Observable<string>;

  // Config
  private dp: number = 0;

  public ngOnInit(): void {
    // @ts-ignore
    this.wetBulbTemp$ = this.ngForm.valueChanges.pipe(
      filter(v => !!v),
      map((f:any) => this.wetBulbTemperature(f.temperature, f.humidity))
    );

    // TODO: Will need to incorporate temperature units in here
    let situation$: Observable<Situation> = this.wetBulbTemp$.pipe(
      map(this.wetBulbTempToSituation),
      tap(s => {
        if (s === 'fatal') {
          this.gradient = 'linear-gradient(180deg, #FF5252 0%, #9747FF 100%)';
        } else if (s === 'dangerous') {
          this.gradient = 'linear-gradient(180deg, #FFBA52 0%, #FF5252 100%)';
        } else {
          this.gradient = 'linear-gradient(180deg, #191D47 0%, rgba(43.14, 174.28, 215.69, 0.84) 100%)';
        }
      })
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
    )

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

  // Assuming temp is Celsius atm
  private wetBulbTemperature(temp: number, humidity: number): number {

    const const1: number = 0.151977;
    const const2: number = 8.313659;
    const const3: number = 1.676331;
    const const4: number = 0.00391838;
    const const5: number = 0.023101;
    const const6: number = 4.686035;

    const part1: number = temp * const1 * ((humidity + const2) ** .5)
    const part2: number = Math.atan(temp + humidity) - Math.atan(humidity - const3);
    const part3: number = const4 * (humidity ** 1.5) * Math.atan(const5 * humidity);

    return Math.floor((part1 + part2 + part3 - const6) * (10**this.dp)) / (10**this.dp);
  }

  private wetBulbTempToSituation(temp: number): Situation {
    return temp < 30 ? ( temp > -10 ? 'safe' : 'cold') : (temp > 35 ? 'fatal' : 'dangerous')
  }

}
