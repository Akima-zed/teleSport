import {Participation} from './participation';

export interface Country {
  country: string;                 // Nom du pays
  participations: Participation[]; // Liste des participations
}
