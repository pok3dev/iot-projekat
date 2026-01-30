import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSliderModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);

  arduinoKonekcija = false;
  temperatura = 23;
  vlaznostZraka = 56;
  vlaznostTla = 41;

  pumpa = signal(false);

  automatskoUkljucivanje = false;
  sliderVrijednost: number = 50;

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.http
      .get('http://localhost:3000/senzori')
      .subscribe((response: any) => {
        this.temperatura = response.temperatura;
        this.vlaznostZraka = response.vlaga;
        this.vlaznostTla = response.vlaznostTlaProcenat;
        console.log(response.temperatura);
        console.log(response.vlaznostZraka);
        console.log(response.vlaznostTla);
      });
  }

  onClick() {
    this.pumpa.set(!this.pumpa());
  }

  onChange(e: Event) {
    if (
      this.sliderVrijednost < this.vlaznostTla &&
      this.automatskoUkljucivanje
    ) {
      this.pumpa.set(true);
    } else {
      this.pumpa.set(false);
    }
  }
}
