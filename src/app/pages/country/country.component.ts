/**
 * CountryComponent
 * ------------------------------------------------------------
 * Affiche le détail d’un pays :
 * - Nombre de participations, médailles et athlètes
 * - Graphique Chart.js des médailles par année
 * - Gestion des états : chargement, erreur, données prêtes
 * - Navigation retour vers le dashboard
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';

import { OlympicService } from '../../services/olympic.service';
import { Country } from '../../models/country';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, OnDestroy {

  /** Header réutilisable */
  headerTitle = '';
  headerIndicators: { label: string; value: number }[] = [];

  /** Données principales */
  countryName = '';
  totalParticipations = 0;
  totalMedals = 0;
  totalAthletes = 0;

  /** Graphique Chart.js */
  chartLabels: string[] = [];
    chartData: number[] = [];
    chartType: 'pie' | 'line' = 'line';

  /** États de chargement et d’erreur */
  isLoading = true;
  error = '';

  /** Gestion du cycle de vie RxJS */
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly olympicService: OlympicService
  ) {}

  // ------------------------------------------------------------
  // Lifecycle Hooks
  // ------------------------------------------------------------

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const countryParam = params.get('countryName');
        if (countryParam) {
          this.loadCountryData(countryParam);
        } else {
          this.error = 'Aucun pays sélectionné.';
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

  }

  // ------------------------------------------------------------
  // Data Loading
  // ------------------------------------------------------------

  /** Charge les données d’un pays depuis le service */
  private loadCountryData(name: string): void {
    this.isLoading = true;
    this.error = '';

    this.olympicService.getCountryByName(name)
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          this.handleError(err);
          return of(undefined);
        })
      )
      .subscribe(country => {
        this.isLoading = false;
        if (!country) return;

        this.updateMetrics(country);

      });
  }

  // ------------------------------------------------------------
  // Error Handling
  // ------------------------------------------------------------

  /** Gestion centralisée des erreurs */
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
  private updateMetrics(country: Country): void {
    this.countryName = country.country;
    this.totalParticipations = country.participations.length;
    this.totalMedals = this.olympicService.getTotalMedals(country.participations);
    this.totalAthletes = this.olympicService.getTotalAthletes(country.participations);

    this.headerTitle = this.countryName;
    this.headerIndicators = [
      { label: 'Entries', value: this.totalParticipations },
      { label: 'Medals', value: this.totalMedals },
      { label: 'Athletes', value: this.totalAthletes }
    ];
  // Chart data
      this.chartLabels = country.participations.map(p => p.year.toString());
      this.chartData = country.participations.map(p => p.medalsCount);
      this.chartType = 'line';
  }



  // ------------------------------------------------------------
  // Interactions
  // ------------------------------------------------------------

  /** Retour au dashboard */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /** Réessayer en cas d’erreur */
  reload(): void {
    this.ngOnInit();
  }
/** clic sur le chart */
  onChartClick(index: number): void {
    console.log(`Clicked year index: ${index}, year: ${this.chartLabels[index]}`);
  }
}
