import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private olympicUrl = './assets/mock/olympic.json';
  public pieChart!: Chart<"pie", number[], string>;
  public totalCountries: number = 0
  public totalJOs: number = 0
  public error!:string
  titlePage: string = "Medals per Country";

  constructor(private router: Router, private http:HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>(this.olympicUrl).subscribe({
      next: (data) => {
        //console.log('Liste des données :', data);

        if (!data || data.length === 0) return;

        // Nombre total de JOs
        const allYears = data.flatMap(country => country.participations.map((p: any) => p.year));
        this.totalJOs = new Set(allYears).size;

        // Liste des pays et total de pays
        const countries = data.map(country => country.country);
        this.totalCountries = countries.length;

        // Total des médailles par pays
        const medalsPerCountry = data.map(country =>
          country.participations.reduce((sum: number, p: any) => sum + p.medalsCount, 0)
        );



        // Construire le graphique
        this.buildPieChart(countries, medalsPerCountry);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données :', err);
        this.error = err.message;
      }
    });
  }

  buildPieChart(countries: string[], sumOfAllMedalsYears: number[]) {
    const pieChart = new Chart("DashboardPieChart", {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Medals',
          data: sumOfAllMedalsYears,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true)
            if (points.length) {
              const firstPoint = points[0];
              const countryName = pieChart.data.labels ? pieChart.data.labels[firstPoint.index] : '';
              this.router.navigate(['country', countryName]);
            }
          }
        }
      }
    });
    this.pieChart = pieChart;
  }
}

