/**
 * HomeComponent
 * ------------------------------------------------------------
 * Affiche le tableau de bord principal :
 * - Graphique Chart.js du total de médailles par pays
 * - Tri dynamique (alphabétique / total médailles)
 * - Gestion des états de chargement et d’erreur
 * - Redirection vers la page détail au clic sur un pays
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  /** Titre et indicateurs du header */
  titlePage = 'Médailles par pays';
  headerIndicators: { label: string; value: number }[] = [];

  /** Données principales */
  countries: Country[] = [];
  totalCountries = 0;
  totalJOs = 0;

  /** États de chargement et d’erreur */
  isLoading = true;
  error = '';

  /** Paramètre de tri */
  sortBy: 'alphabetical' | 'totalMedals' = 'totalMedals';

  /** Graphique Chart.js */
  private pieChart?: Chart<'pie', number[], string>;

  /** Gestion du cycle de vie RxJS */
  private readonly destroy$ = new Subject<void>();

  /** Données mockées locales */
  private readonly olympicUrl = './assets/mock/olympic.json';

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly olympicService: OlympicService
  ) {}

  // ------------------------------------------------------------
  // Lifecycle Hooks
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

  /**
   * Charge les données depuis le mock JSON,
   * met à jour les totaux et construit le graphique.
   */
  private loadData(): void {
    this.isLoading = true;
    this.error = '';

    this.http.get<Country[]>(this.olympicUrl)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: unknown) => {
          this.handleError(err);
          return of([]);
        })
      )
      .subscribe((data) => {
        this.isLoading = false;

        if (!data.length) {
          this.error = 'Aucune donnée disponible.';
          return;
        }

        this.updateMetrics(data);
        this.renderChart(data);
      });
  }

  // ------------------------------------------------------------
  // Error Handling
  // ------------------------------------------------------------

  /** Gère les erreurs HTTP / réseau de façon centralisée */
  private handleError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      this.error = err.message || `Erreur HTTP ${err.status}`;
    } else if (err instanceof Error) {
      this.error = err.message;
    } else {
      this.error = 'Erreur inconnue';
    }
    this.isLoading = false;
  }

  // ------------------------------------------------------------
  // Data Processing
  // ------------------------------------------------------------

  /** Met à jour les totaux et le header */
  private updateMetrics(data: Country[]): void {
    const allYears = data.flatMap(c => c.participations.map(p => p.year));
    this.totalJOs = new Set(allYears).size;

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

  /** Construit le graphique principal */
  private renderChart(data: Country[]): void {
    const labels = this.countries.map(c => c.country);
    const medals = this.countries.map(c =>
      this.olympicService.getTotalMedals(c.participations)
    );

    // Utiliser setTimeout pour s'assurer que le canvas est présent dans le DOM
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
          aspectRatio: 2.5,
          plugins: { legend: { position: 'bottom' } },
          onClick: (event) => this.onChartClick(event)
        }
      });
    });
  }

  // ------------------------------------------------------------
  // Interactions
  // ------------------------------------------------------------

  /** Gère le clic sur une portion du graphique */
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
      if (countryName) this.router.navigate(['country', countryName]);
    }
  }

  /** Rafraîchit les données après un changement de tri */
  onSortChange(): void {
    this.loadData();
  }

  /** Recharge les données après une erreur */
  reload(): void {
    this.loadData();
  }
}
