import {Participation} from './participation';

export interface Country {
  id: number;
  country: string;
  participations: Participation[];
}
