import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSliderModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private url = 'https://iot-projekat-nqvg.onrender.com';

  arduinoKonekcija = false;

  ucitavanje = true;
  temperatura = 0;
  vlaznostZraka = 0;
  vlaznostTla = 0;

  pumpa = signal(false);

  automatskoUkljucivanje = false;
  sliderVrijednost: number = 50;

  private timerSub!: Subscription;

  ngOnInit() {
    this.getData();
    this.timerSub = interval(3000).subscribe(() => {
      this.getData();
    });
  }

  ngOnDestroy(): void {
    this.timerSub.unsubscribe();
  }

  getData() {
    this.http.get(`${this.url}/senzori`).subscribe((response: any) => {
      console.log(Date.now() / 1000 - response.aktivnostArduina);
      if (Date.now() / 1000 - response.aktivnostArduina > 10) {
        this.arduinoKonekcija = false;
      } else {
        this.arduinoKonekcija = true;
        this.temperatura = response.temperatura;
        this.vlaznostZraka = response.vlaga;
        this.vlaznostTla = response.vlaznostTlaProcenat;
        this.ucitavanje = false;
      }
      console.log(response.temperatura);
      console.log(response.vlaznostZraka);
      console.log(response.vlaznostTla);
    });
  }

  postPumpa() {
    this.http
      .post(`${this.url}/pumpa`, { pumpa: this.pumpa() ? 1 : 0 })
      .subscribe((res) => {
        console.log('Odgovor sa servera:', res);
      });
  }

  onClick() {
    this.pumpa.set(!this.pumpa());
    this.postPumpa();
  }

  onCheckboxChange() {
    this.automatskoUkljucivanje != this.automatskoUkljucivanje;
    this.onChange();
  }

  onChange() {
    const trenutnoStanje = this.pumpa();
    if (
      this.sliderVrijednost > this.vlaznostTla &&
      this.automatskoUkljucivanje
    ) {
      this.pumpa.set(true);
    } else {
      this.pumpa.set(false);
    }
    if (trenutnoStanje != this.pumpa()) {
      this.postPumpa();
    }
  }
}
