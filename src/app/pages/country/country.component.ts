import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import Chart from 'chart.js/auto';
import { OlympicService } from '../../services/olympic.service';
import { Country, Participation } from '../../models';



@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, OnDestroy {

  //private olympicUrl = './assets/mock/olympic.json';  => geré par le service
  public lineChart!: Chart<"line", string[], number>; // instancie chart.js
  public titlePage: string = '';
  public totalEntries: number = 0;
  public totalMedals: number = 0;
  public totalAthletes: number = 0;
  public error!: string;
  // Stocke le nom du pays depuis la route pour réutilisation
  private countryName: string | null = null;


  constructor(private route: ActivatedRoute,
              private router: Router,
              private olympicService: OlympicService ) // inject le service
  {}

  ngOnInit() {
    // on écoute le changement pour récupérer les données
    this.route.paramMap.subscribe((param: ParamMap) => {
        // on stock le pays pour le réutiliser
          this.countryName = param.get('countryName');
          // condition :si existe on appel loadCountryData()
          if (this.countryName) {
            this.loadCountryData(this.countryName);
          }
      });
  }

   // récupère les donnes pays via le service
    private loadCountryData(name: string) {
      this.olympicService.getCountryByName(name).subscribe({  // demande les données au service
        (selectedCountry) => {
          if (!selectedCountry) return;

          this.titlePage = selectedCountry.country;

          // calcul via le service
          this.totalEntries = selectedCountry.participations.length;
          this.totalMedals = this.olympicService.getTotalMedals(selectedCountry.participations);
          this.totalAthletes = this.olympicService.getTotalAthletes(selectedCountry.participations);

          // prépare tableau chart
          const years = selectedCountry.participations.map(p => p.year.toString());
                  const medals = selectedCountry.participations.map(p => p.medalsCount);

          this.buildChart(years, medals);
        },
        (err: any) => {
          this.error = err.message;
        }
      });
    }

    // Construction du chart (reste ici, peut être factorisé plus tard)
     private buildChart(years: number[], medals: number[]) {
        if (this.lineChart) {
          // Si le chart existe déjà, on met à jour les données
          this.lineChart.data.labels = years;
          this.lineChart.data.datasets[0].data = medals;
          this.lineChart.update();
        } else {
          // Sinon, on crée le chart pour la première fois
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
            options: {
              aspectRatio: 2.5
            }
          });
        }
      }

      // on se désinscrit de l'observable
      ngOnDestroy() {
        if (this.routeSub) {
          this.routeSub.unsubscribe();
        }
      }
    }
