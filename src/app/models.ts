export interface Participation {
  year: number;          // Année des Jeux
  medalsCount: number;   // Nombre de médailles
  athleteCount: number;  // Nombre d’athlètes
}

export interface Country {
  country: string;                 // Nom du pays
  participations: Participation[]; // Liste des participations
}
