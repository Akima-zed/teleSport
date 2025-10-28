import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Participation } from '../models/participation';
import { Country} from '../models/country';

@Injectable({
  providedIn: 'root'
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';

  constructor(private http: HttpClient) {}


  /**
   *Je récupère toute la liste des pays
   */
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.olympicUrl);
  }


  /**
   *Je récupère un pays par son nom
   */
  getCountryByName(name: string): Observable<Country | undefined> {
    return this.getCountries().pipe(
      map(countries => countries.find(c => c.country === name))
    );
  }

  /**
  * Calcule le total des médailles pour un pays donné.
  */
  getTotalMedals(participations: Participation[]): number {
    return participations.reduce((total, p) => total + p.medalsCount, 0);
  }

  /**
  * Calcule le total des athlètes pour un pays donné.
  */
  getTotalAthletes(participations: Participation[]): number {
    return participations.reduce((total, p) => total + p.athleteCount, 0);
  }
}
