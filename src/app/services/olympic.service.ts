/**
 * OlympicService
 * ------------------------------------------------------------
 * Objectif :
 *  - Centraliser l'accès aux données des pays et participations
 *  - Fournir des méthodes pour filtrer, trier et calculer des statistiques
 *  - Gérer proprement les erreurs HTTP et métier
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
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
    return this.http.get<Country[]>(this.olympicUrl).pipe(
      catchError(err => this.handleError(err, 'Impossible de charger la liste des pays'))
    );
  }

  /** Récupère un pays par son nom */
  getCountryByName(name: string): Observable<Country | undefined> {
    return this.getCountries().pipe(
      map(countries => countries.find(c => c.country === name)),
      catchError(err => this.handleError(err, `Impossible de charger les données pour le pays "${name}"`))
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

  /** Calcule le nombre total d'éditions des JO représentées dans les données */
  getTotalJOs(countries: Country[]): number {
    const allYears = countries.flatMap(c => c.participations.map(p => p.year));
    return new Set(allYears).size;
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

  // ------------------------------------------------------------
  // Error Handling
  // ------------------------------------------------------------

  /**
   * Gestion centralisée des erreurs HTTP et métier
   * @param error Erreur reçue
   * @param userMessage Message clair pour l’utilisateur
   */
  private handleError(error: unknown, userMessage: string): Observable<never> {
    let message: string;

    if (error instanceof HttpErrorResponse) {
      message = error.message ? `${error.message} (status ${error.status})` : `Erreur HTTP ${error.status}`;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = 'Erreur inconnue';
    }

    return throwError(() => new Error(`${userMessage}: ${message}`));
  }
}
