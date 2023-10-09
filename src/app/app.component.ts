import { Component, OnInit, ViewChild } from '@angular/core';
import { filter, map, tap, pairwise, Observable, shareReplay } from 'rxjs';
import { NgForm } from '@angular/forms';
import { HumidUnit, Situation, TempUnit } from './app.types';
import { COLD_TEMP_BLURB, DANGEROUS_TEMP_BLURB, FATAL_TEMP_BLURB, SAFE_TEMP_BLURB } from './app.constants';

@Component({
  selector: 'wet-bulb',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // @ts-ignore
  @ViewChild('inputs',{static: true}) ngForm: NgForm;
  // @HostBinding('style.background') gradient: string = 'red'; //'linear-gradient(180deg, #191D47 0%, rgba(43.14, 174.28, 215.69, 0.84) 100%)';

  // Form values (Inputs)
  public temperature: number = 20;
  public humidity: number = 50;
  public tempUnits: TempUnit = "celsius";
  public humidUnits: HumidUnit = "relativeHumidity";

  // Outputs
  public wetBulbTemp$: Observable<number>;
  public blurb$: Observable<Array<string>>;
  public emoji$: Observable<string>;
  public $fatalOpacity: Observable<number>;
  public $dangerousOpacity: Observable<number>;

  // Config
  private dp: number = 1;

  public ngOnInit(): void {
    // @ts-ignore
    this.wetBulbTemp$ = this.ngForm.valueChanges.pipe(
      filter(v => !!v),
      pairwise(),
      // tap(v => console.log("Form change", v)),
      map(([f_old, f]: [any, any]) => this.wetBulbTemperature(f.temperature, f.humidity)),
      shareReplay()
    );

    this.$fatalOpacity = this.wetBulbTemp$.pipe(
      map(t => 0.2 * (t - 30)),
      map(v => v <= 0 ? 0 : v >= 1 ? 1 : v),
      shareReplay()
    )

    this.$dangerousOpacity = this.wetBulbTemp$.pipe(
      map(t => 0.1 * (t - 20)),
      map(v => v <= 0 ? 0 : v >= 1 ? 1 : v),
      shareReplay()
    )

    // TODO: Will need to incorporate temperature units in here
    let situation$: Observable<Situation> = this.wetBulbTemp$.pipe(
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

  // Assuming temp is Celsius atm
  private wetBulbTemperature(temp: number, humidity: number): number {

    const const1: number = 0.151977;
    const const2: number = 8.313659;
    const const3: number = 1.676331;
    const const4: number = 0.00391838;
    const const5: number = 0.023101;
    const const6: number = 4.686035;

    const part1: number = temp * Math.atan(const1 * ((humidity + const2) ** .5));
    const part2: number = Math.atan(temp + humidity) - Math.atan(humidity - const3);
    const part3: number = const4 * (humidity ** 1.5) * Math.atan(const5 * humidity);

    return Math.floor((part1 + part2 + part3 - const6) * (10**this.dp)) / (10**this.dp);
  }

  private wetBulbTempToSituation(temp: number): Situation {
    return temp < 30 ? ( temp > -10 ? 'safe' : 'cold') : (temp > 35 ? 'fatal' : 'dangerous')
  }
}
