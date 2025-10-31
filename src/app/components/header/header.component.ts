/**
 * HeaderComponent
 * ------------------------------------------------------------
 * Composant réutilisable pour l'affichage du titre et des KPI.
 *
 * Inputs :
 * - title : titre principal de la page
 * - indicators : liste d'indicateurs { label, value } affichés en header
 *
 * Responsabilité :
 * - Présenter un titre clair
 * - Afficher les KPIs de manière responsive
 */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  /** Titre principal de la page */
  @Input() title: string = '';

  /** Liste des KPI à afficher */
  @Input() indicators: { label: string; value: number }[] = [];
}
