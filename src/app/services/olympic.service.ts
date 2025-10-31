/**
 * OlympicService
 * ------------------------------------------------------------
 * Objectif :
 *  - Centraliser l'accès aux données des pays et participations
 *  - Fournir des méthodes pour filtrer, trier et calculer des statistiques
 *
 * Technologies utilisées :
 *  - Angular HttpClient pour charger le mock JSON
 *  - RxJS pour la gestion des flux asynchrones
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Participation } from '../models/participation';
import { Country } from '../models/country';

@Injectable({
  providedIn: 'root'
})
export class OlympicService {

  /** URL du mock JSON */
  private readonly olympicUrl = './assets/mock/olympic.json';

  constructor(private readonly http: HttpClient) { }

  // ------------------------------------------------------------
  // Data Access
  // ------------------------------------------------------------

  /** Récupère la liste complète des pays */
  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.olympicUrl);
  }

  /** Récupère un pays par son nom */
  getCountryByName(name: string): Observable<Country | undefined> {
    return this.getCountries().pipe(
      map(countries => countries.find(c => c.country === name))
    );
  }

  // ------------------------------------------------------------
  // Data Processing
  // ------------------------------------------------------------

  /** Calcule le total des médailles pour un pays donné */
  getTotalMedals(participations: Participation[]): number {
    return participations.reduce((total, p) => total + p.medalsCount, 0);
  }

  /** Calcule le total des athlètes pour un pays donné */
  getTotalAthletes(participations: Participation[]): number {
    return participations.reduce((total, p) => total + p.athleteCount, 0);
  }

  // ------------------------------------------------------------
  // Sorting
  // ------------------------------------------------------------

  /**
   * Trie les pays selon le critère spécifié
   * @param countries Liste des pays à trier
   * @param by 'alphabetical' pour tri alphabétique, 'totalMedals' pour tri par total de médailles
   * @returns Pays triés
   */
  sortCountries(
    countries: Country[],
    by: 'alphabetical' | 'totalMedals' = 'totalMedals'
  ): Country[] {
    if (by === 'alphabetical') {
      return [...countries].sort((a, b) => a.country.localeCompare(b.country));
    } else {
      return [...countries].sort(
        (a, b) => this.getTotalMedals(b.participations) - this.getTotalMedals(a.participations)
      );
    }
  }
}
