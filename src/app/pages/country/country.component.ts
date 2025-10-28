import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import Chart from 'chart.js/auto';
import { OlympicService } from '../../services/olympic.service';
import { Country } from '../../models/country';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, OnDestroy {
  /** Données pour le header réutilisable */
  headerTitle = '';
  headerIndicators: { label: string; value: number }[] = [];

  /** Totaux et données */
  countryName = '';
  totalParticipations = 0;
  totalMedals = 0;
  totalAthletes = 0;

  /** Graphique Chart.js */
  lineChart!: Chart<'line', number[], number>;

  /** Loading et erreurs */
  isLoading = true;
  errorMessage = '';

  /** Observable de destruction */
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const countryParam = params.get('countryName');
        if (countryParam) {
          this.loadCountryData(countryParam);
        } else {
          this.errorMessage = 'Aucun pays sélectionné.';
          this.isLoading = false;
        }
      });
  }

  /** Charge les données du pays depuis le service */
  private loadCountryData(name: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.olympicService.getCountryByName(name)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            this.errorMessage = err.message || `Erreur HTTP ${err.status}`;
          } else if (err instanceof Error) {
            this.errorMessage = err.message;
          } else {
            this.errorMessage = 'Erreur inconnue';
          }
          this.isLoading = false;
          return of(undefined);
        })
      )
      .subscribe(country => {
        this.isLoading = false;
        if (!country) return;

        // Affectation des données
        this.countryName = country.country;
        this.totalParticipations = country.participations.length;
        this.totalMedals = this.olympicService.getTotalMedals(country.participations);
        this.totalAthletes = this.olympicService.getTotalAthletes(country.participations);

        // Header réutilisable
        this.headerTitle = this.countryName;
        this.headerIndicators = [
          { label: 'Entries', value: this.totalParticipations },
          { label: 'Medals', value: this.totalMedals },
          { label: 'Athletes', value: this.totalAthletes }
        ];

        // Données pour le graphique
        const years = country.participations.map(p => p.year);
        const medals = country.participations.map(p => p.medalsCount);

        this.buildChart(years, medals);
      });
  }

  /** Crée ou met à jour le graphique */
  private buildChart(years: number[], medals: number[]): void {
    if (this.lineChart) {
      this.lineChart.data.labels = years;
      this.lineChart.data.datasets[0].data = medals;
      this.lineChart.update();
      return;
    }

    this.lineChart = new Chart('countryChart', {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Nombre de médailles',
            data: medals,
            backgroundColor: '#0b868f',
            borderColor: '#0b868f',
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        aspectRatio: 2.5,
        plugins: { legend: { display: false } },
        scales: {
          x: { title: { display: true, text: 'Année' } },
          y: { title: { display: true, text: 'Médailles' }, beginAtZero: true }
        }
      }
    });
  }

  /** Retour au dashboard */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /** Nettoyage des abonnements */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
