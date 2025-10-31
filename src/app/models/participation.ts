
/**
 * Représente la participation d’un pays à une édition des Jeux Olympiques.
 */

export interface Participation {
  id: number;
  year: number;
  city: string;
  medalsCount: number;
  athleteCount: number;
}
