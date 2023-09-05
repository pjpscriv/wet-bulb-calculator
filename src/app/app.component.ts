import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  // @ts-ignore
  @ViewChild('inputs',{static: true}) ngForm: NgForm;

  title = 'wet-bulb'
  humidity = 15;

  constructor() {

  }


  humidity$ = new Subject();

  public ngOnInit(): void {
    this.humidity$.pipe(
      tap(v => console.log(`Humidity: ${v}`))
    )
  }

  public ngAfterViewInit(): void {
    // @ts-ignore
    this.ngForm.valueChanges.subscribe(form => {
      console.log(form);
      // this.updated = form;
    })
  }

}
