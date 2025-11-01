/**
 * HomeComponent
 * ------------------------------------------------------------
 * Rôle :
 *  - Afficher le tableau de bord principal (Chart.js)
 *  - Consommer les données via OlympicService
 *  - Gérer états de chargement / erreur / tri
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import Chart from 'chart.js/auto';

import { Country } from '../../models/country';
import { OlympicService } from '../../services/olympic.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  /** En-tête de la page */
  titlePage = 'Médailles par pays';
  headerIndicators: { label: string; value: number }[] = [];

  /** Données principales */
  countries: Country[] = [];
  totalCountries = 0;
  totalJOs = 0;

  /** États UI */
  isLoading = true;
  error = '';

  /** Paramètres */
  sortBy: 'alphabetical' | 'totalMedals' = 'totalMedals';

  /** Graphique Chart.js */
  private pieChart?: Chart<'pie', number[], string>;

  /** Gestion du cycle de vie RxJS */
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly router: Router,
    private readonly olympicService: OlympicService
  ) {}

  // ------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pieChart?.destroy();
  }

  // ------------------------------------------------------------
  // Data Loading
  // ------------------------------------------------------------

  private loadData(): void {
      this.isLoading = true;
      this.error = '';
      this.olympicService.getCountries()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: data => {
            this.isLoading = false;
            if (!data.length) {
              this.error = 'Aucune donnée disponible.';
              return;
            }
            this.updateMetrics(data);
            this.renderChart(data);
          },
          error: err => { this.isLoading = false; this.error = err.message; }
        });
    }

  // ------------------------------------------------------------
  // Data Processing
  // ------------------------------------------------------------

  private updateMetrics(data: Country[]): void {
    this.totalJOs = this.olympicService.getTotalJOs(data);
    this.countries = this.olympicService.sortCountries(data, this.sortBy);
    this.totalCountries = this.countries.length;

    this.headerIndicators = [
      { label: 'Pays', value: this.totalCountries },
      { label: 'JOs', value: this.totalJOs }
    ];
  }

  // ------------------------------------------------------------
  // Chart Rendering
  // ------------------------------------------------------------

  private renderChart(data: Country[]): void {
    const labels = [...this.countries.map(c => c.country), 'pays test '];
    const medals = [
      ...this.countries.map(c => this.olympicService.getTotalMedals(c.participations)),
      50
    ];

    setTimeout(() => {
      this.pieChart?.destroy();

      this.pieChart = new Chart('DashboardPieChart', {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Médailles',
            data: medals,
            backgroundColor: [
              '#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'
            ],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          aspectRatio: window.innerWidth <= 767 ? 1 : 2.5,
          plugins: { legend: { position: 'bottom' } },
          onClick: (event) => this.onChartClick(event)
        }
      });
    });
  }


  // ------------------------------------------------------------
  // Interactions
  // ------------------------------------------------------------

  private onChartClick(event: any): void {
    if (!this.pieChart) return;

    const points = this.pieChart.getElementsAtEventForMode(
      event.native!,
      'point',
      { intersect: true },
      true
    );

    if (points.length) {
      const index = points[0].index;
      const countryName = this.pieChart.data.labels?.[index];

      const exists = this.countries.some(c => c.country === countryName);
      this.router.navigate([exists ? 'country' : '**', countryName]);
    }
  }

  onSortChange(): void {
    this.loadData();
  }

  reload(): void {
    this.loadData();
  }
}
