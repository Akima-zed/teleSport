import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Country, Participation } from './models/country.model';

@Injectable({
  providedIn: 'root'
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';

  constructor(private http: HttpClient) {}


  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.olympicUrl);
  }

  getCountryByName(name: string): Observable<Country | undefined> {
    return this.getCountries().pipe(
      map(countries => countries.find(c => c.country === name))
    );
  }


  getTotalMedals(participations: Participation[]): number {
    return participations.reduce((total, participation) => total + participation.medalsCount, 0);
   }

  getTotalAthletes(participations: Participation[]): number {
    return participations.reduce((total, participation) => total + participation.athleteCount, 0);
  }
}
