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


  /**
    * Trie les pays selon le critère spécifié.
    * @param countries Liste des pays à trier
    * @param by 'alphabetical' pour tri alphabétique, 'totalMedals' pour tri par total de médailles
    * @returns Pays triés
    */
   sortCountries(countries: Country[], by: 'alphabetical' | 'totalMedals' = 'totalMedals'): Country[] {
     if (by === 'alphabetical') {
       return [...countries].sort((a, b) => a.country.localeCompare(b.country));
     } else {
       // Tri décroissant par total de médailles
       return [...countries].sort((a, b) =>
         this.getTotalMedals(b.participations) - this.getTotalMedals(a.participations)
       );
     }
   }
}
