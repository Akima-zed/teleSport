import {Participation} from './participation';

/**
 * Représente un pays participant aux Jeux Olympiques
 * et ses différentes participations.
 */
export interface Country {
  id: number;
  country: string;
  participations: Participation[];
}
