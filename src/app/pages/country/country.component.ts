import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { OlympicService } from '../../services/olympic.service';
import { Participation } from '../../models/participation';
import { Country } from '../../models/country';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, OnDestroy {


   /** Instance du graphique Chart.js */
  public lineChart!: Chart<"line", number[], number>;
   /** Nom du pays affiché */
  public countryName: string = '';
   /** Totaux affichés dans les KPI */
  public totalEntries = 0;
  public totalMedals = 0;
  public totalAthletes = 0;
   /** Message d’erreur éventuel */
  public errorMessage: string = '';

  /** Observable de destruction pour éviter les fuites mémoire */
  private destroy$ = new Subject<void>(); // Pour désinscrire proprement les observables

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit() {
    // Écoute les changements de route pour récupérer le nom du pays
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (param: ParamMap) => {
           const countryParam = params.get('countryName');
                if (countryParam) this.loadCountryData(countryParam);
              }else {
               this.errorMessage = 'Aucun pays sélectionné.';
              }
           },
           error: (err: any) => this.errorMessage = err.message
        });
  }

  private loadCountryData(name: string) {
    this.olympicService.getCountryByName(name)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (Country: Country | undefined) => {
          if (!Country) {
            this.errorMessage = `Le pays "${name}" est introuvable.`;
            return;
           }

        // Affectation des informations
        this.countryName = country.country;
        this.totalParticipations = country.participations.length;
        this.totalMedals = this.olympicService.computeTotalMedals(country.participations);
        this.totalAthletes = this.olympicService.computeTotalAthletes(country.participations);

          // données pour le graphique
          const years = Country.participations.map(p => p.year);
          const medals = Country.participations.map(p => p.medalsCount);
          this.buildChart(years, medals);
        },
        error: (err: any) => this.errorMessage = err.message
      });
  }

  private buildChart(years: number[], medals: number[]): void {
    if (this.lineChart) {
      // Si le graphique existe déjà, on le met à jour
      this.lineChart.data.labels = years;
      this.lineChart.data.datasets[0].data = medals;
      this.lineChart.update();
    } else {
      this.lineChart = new Chart("countryChart", {
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

/**
   * Redirige vers la page d’accueil (home)
   */
  public goBack(): void {
    this.router.navigate(['/']);
  }
}
