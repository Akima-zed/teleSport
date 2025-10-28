import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import Chart from 'chart.js/auto';
import { OlympicService } from '../../services/olympic.service';
import { Country } from '../../models/country';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, OnDestroy {

  /** Données pour le header réutilisable */
  headerTitle: string = '';
  headerIndicators: { label: string; value: number }[] = [];

  /** Instance du graphique Chart.js */
  public lineChart!: Chart<"line", number[], number>;

  /** Nom du pays affiché */
  public countryName: string = '';

  /** Totaux affichés dans les KPI */
  public totalParticipations = 0;
  public totalMedals = 0;
  public totalAthletes = 0;

  /** Message d’erreur éventuel */
  public errorMessage: string = '';

  /** Observable de destruction pour éviter les fuites mémoire */
  private destroy$ = new Subject<void>();



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (params: ParamMap) => {
          const countryParam = params.get('countryName');
          if (countryParam) {
            this.loadCountryData(countryParam);
          } else {
            this.errorMessage = 'Aucun pays sélectionné.';
          }
        },
        error: (err: any) => this.errorMessage = err.message
      });
  }

  /**
   * Charge les données du pays depuis le service
   */
  private loadCountryData(name: string): void {
    this.olympicService.getCountryByName(name)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (country: Country | undefined) => {
          if (!country) {
            this.errorMessage = `Le pays "${name}" est introuvable.`;
            return;
          }

          // Affectation des données
          this.countryName = country.country;
          this.totalParticipations = country.participations.length;
          this.totalMedals = this.olympicService.getTotalMedals(country.participations);
          this.totalAthletes = this.olympicService.getTotalAthletes(country.participations);


          // Mettre à jour le header réutilisable
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
        },
        error: (err: any) => this.errorMessage = err.message
      });
  }

  /**
   * Crée ou met à jour le graphique
   */
  private buildChart(years: number[], medals: number[]): void {
    if (this.lineChart) {
      this.lineChart.data.labels = years;
      this.lineChart.data.datasets[0].data = medals;
      this.lineChart.update();
    } else {
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
              fill: false,
            }
          ]
        },
        options: {
          responsive: true,
          aspectRatio: 2.5,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { title: { display: true, text: 'Année' } },
            y: { title: { display: true, text: 'Médailles' }, beginAtZero: true }
          }
        }
      });
    }
  }

  /**
   * Nettoyage des abonnements à la destruction du composant
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Retour à la page d’accueil
   */
  public goBack(): void {
    this.router.navigate(['/']);
  }
}
