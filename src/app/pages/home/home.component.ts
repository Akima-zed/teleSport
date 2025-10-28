import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { Country } from '../../models/country';
import { OlympicService } from '../../services/olympic.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  /** Données pour le header */
  titlePage = 'Médailles par pays';
  headerIndicators: { label: string; value: number }[] = [];

  /** Tri des pays : 'alphabetical' ou 'totalMedals' */
  sortBy: 'alphabetical' | 'totalMedals' = 'totalMedals';

  /** Liste des pays */
  countries: Country[] = [];

  /** Totaux */
  totalCountries = 0;
  totalJOs = 0;

  /** Graphique Chart.js */
  pieChart!: Chart<'pie', number[], string>;

  /** Loading et erreurs */
  isLoading = true;
  error = '';

  /** Destruction des observables */
  private destroy$ = new Subject<void>();

  private olympicUrl = './assets/mock/olympic.json';

  constructor(
    private router: Router,
    private http: HttpClient,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // Ajout d'une fonction reload pour bouton si nécessaire
  reload(): void {
    this.loadData();
  }

  /** Charge les données et construit le graphique */
  loadData(): void {
    this.isLoading = true;
    this.error = '';

    this.http.get<Country[]>(this.olympicUrl)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            this.error = err.message || `Erreur HTTP ${err.status}`;
          } else if (err instanceof Error) {
            this.error = err.message;
          } else {
            this.error = 'Erreur inconnue';
          }
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((data: Country[]) => {
        this.isLoading = false;

        if (!data || data.length === 0) {
          this.error = 'Aucune donnée disponible.';
          return;
        }

        // Nombre total de JOs
        const allYears = data.flatMap(c => c.participations.map(p => p.year));
        this.totalJOs = new Set(allYears).size;

        // Appliquer le tri selon sortBy
        this.countries = this.olympicService.sortCountries(data, this.sortBy);

        // Mise à jour des totaux
        this.totalCountries = this.countries.length;

        // Mettre à jour les KPIs du header
        this.headerIndicators = [
          { label: 'Pays', value: this.totalCountries },
          { label: 'JOs', value: this.totalJOs }
        ];

        // Préparer les données du graphique
        const countryNames = this.countries.map(c => c.country);
        const medalsPerCountry = this.countries.map(c =>
          this.olympicService.getTotalMedals(c.participations)
        );

        // Construire le graphique
        this.buildPieChart(countryNames, medalsPerCountry);
      });
  }

  /** Construire le graphique Pie */
  private buildPieChart(countries: string[], medals: number[]): void {
    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart('DashboardPieChart', {
      type: 'pie',
      data: {
        labels: countries,
        datasets: [
          {
            label: 'Médailles',
            data: medals,
            backgroundColor: ['#0b868f', '#adc3de', '#7a3c53', '#8f6263', 'orange', '#94819d'],
            hoverOffset: 4
          }
        ]
      },
      options: {
        aspectRatio: 2.5,
        onClick: (e) => {
          if (!e.native) return;
          const points = this.pieChart.getElementsAtEventForMode(
            e.native,
            'point',
            { intersect: true },
            true
          );
          if (points.length) {
            const index = points[0].index;
            const countryName = this.pieChart.data.labels ? this.pieChart.data.labels[index] : '';
            this.router.navigate(['country', countryName]);
          }
        },
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  /** Changement de tri depuis le select */
  onSortChange(): void {
    this.loadData();
  }

  /** Nettoyage */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
