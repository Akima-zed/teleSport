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

  public lineChart!: Chart<"line", number[], number>; // Chart : labels = number[]
  public titlePage: string = '';
  public totalEntries: number = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;
  private countryName: string | null = null;

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
          this.countryName = param.get('countryName');
          if (this.countryName) {
            this.loadCountryData(this.countryName);
          }
        },
        error: (err: any) => {
          this.error = err.message;
        }
      });
  }

  private loadCountryData(name: string) {
    this.olympicService.getCountryByName(name)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (selectedCountry: Country | undefined) => {
          if (!selectedCountry) return;

          this.titlePage = selectedCountry.country;
          this.totalEntries = selectedCountry.participations.length;
          this.totalMedals = this.olympicService.getTotalMedals(selectedCountry.participations);
          this.totalAthletes = this.olympicService.getTotalAthletes(selectedCountry.participations);

          const years = selectedCountry.participations.map(p => p.year); // number[]
          const medals = selectedCountry.participations.map(p => p.medalsCount); // number[]
          this.buildChart(years, medals);
        },
        error: (err: any) => {
          this.error = err.message;
        }
      });
  }

  private buildChart(years: number[], medals: number[]) {
    if (this.lineChart) {
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
              label: "Medals",
              data: medals,
              backgroundColor: '#0b868f'
            },
          ]
        },
        options: { aspectRatio: 2.5 }
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();    // déclenche la désinscription
    this.destroy$.complete();
  }
}
