import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  titlePage = 'Médailles par pays';

  /** KPI pour le HeaderComponent */
  headerIndicators: { label: string; value: number }[] = [];

  totalCountries = 0;
  totalJOs = 0;

  pieChart!: Chart<"pie", number[], string>;

  private olympicUrl = './assets/mock/olympic.json';
  public error: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any[]>(this.olympicUrl).subscribe({
      next: data => {
        if (!data || data.length === 0) return;

        // Nombre total de JOs
        const allYears = data.flatMap(country => country.participations.map((p: any) => p.year));
        this.totalJOs = new Set(allYears).size;

        // Liste des pays et total
        const countries = data.map(country => country.country);
        this.totalCountries = countries.length;

        // Total des médailles par pays
        const medalsPerCountry = data.map(country =>
          country.participations.reduce((sum: number, p: any) => sum + p.medalsCount, 0)
        );

        // Mettre à jour le header
        this.headerIndicators = [
          { label: 'Pays', value: this.totalCountries },
          { label: 'JOs', value: this.totalJOs }
        ];

        // Construire le graphique
        this.buildPieChart(countries, medalsPerCountry);
      },
      error: err => {
        console.error('Erreur lors du chargement des données :', err);
        this.error = err.message;
      }
    });
  }

  buildPieChart(countries: string[], medals: number[]) {
    const pieChart = new Chart("DashboardPieChart", {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [{
          label: 'Médailles',
          data: medals,
          backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
          hoverOffset: 4
        }]
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (e.native) {
            const points = pieChart.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true);
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
