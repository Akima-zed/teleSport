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

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.olympicUrl);
  }

  getCountryByName(name: string): Observable<Country | undefined> {
    return this.getCountries().pipe(
      map(countries => countries.find(c => c.country === name))
    );
  }

  getTotalMedals(participations: Participation[]): number {
    return participations.reduce((total, p) => total + p.medalsCount, 0);
  }

  getTotalAthletes(participations: Participation[]): number {
    return participations.reduce((total, p) => total + p.athleteCount, 0);
  }
}
