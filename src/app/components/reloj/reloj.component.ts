import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reloj',
  templateUrl: './reloj.component.html',
  styleUrls: ['./reloj.component.css']
})
export class RelojComponent implements OnInit {
  constructor() { }

  hours: any;
  minutes: any;
  //seconds: string;
  private timerId: any;

  ngOnInit(): void {
    this.establecer_tmp();
    this.timerId = this.updateTime();
  }
  ngOnDestroy() {
    clearInterval(this.timerId);
  }
  private establecer_tmp() {
    const time = new Date(Date.now());
    this.hours = this.cero_izq(time.getHours());
    this.minutes = this.cero_izq(time.getMinutes());
    //this.seconds = this.leftPadZero(time.getSeconds());
  }
  private updateTime() {
    setInterval(() => {
      this.establecer_tmp();
    }, 1000);
  }
  private cero_izq(value: number) {
    return value < 10 ? `0${value}` : value.toString();
  }
}
