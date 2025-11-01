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
import { ChartComponent } from '../../components/chart/chart.component';

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

  // Chart Inputs
  chartLabels: string[] = [];
  chartData: number[] = [];
  chartOptions = {
    responsive: true,
    aspectRatio: window.innerWidth <= 767 ? 1 : 2.5,
    plugins: { legend: { position: 'bottom' } }
  };
  chartType: 'pie' | 'line' = 'pie';

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

          },
          error: err => {
            this.isLoading = false;
            this.error = err.message; }
        });
    }

  // ------------------------------------------------------------
  // Data Processing
  // ------------------------------------------------------------


  private updateMetrics(data: Country[]): void {
    this.countries = this.olympicService.sortCountries(data, this.sortBy);
    this.totalJOs = this.olympicService.getTotalJOs(this.countries);
    this.totalCountries = this.countries.length;

    // Header
    this.headerIndicators = [
      { label: 'Pays', value: this.totalCountries },
      { label: 'JOs', value: this.totalJOs }
    ];

    // Chart
    this.chartLabels = this.countries.map(c => c.country);
    this.chartData = this.countries.map(c => this.olympicService.getTotalMedals(c.participations));
  }




  // ------------------------------------------------------------
  // Interactions
  // ------------------------------------------------------------

  /** Callback du clic sur ChartComponent */
    onChartClick(index: number): void {
      const countryName = this.chartLabels[index];
      const exists = this.countries.some(c => c.country === countryName);
      this.router.navigate([exists ? 'country' : '**', countryName]);
    }

  onSortChange(): void {
    this.loadData();
  }

  reload(): void {
    this.loadData();
  }
}
