import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  /** Titre principal de la page */
  @Input() title: string = '';

  /** Liste des KPI à afficher : { label, value } */
  @Input() indicators: { label: string; value: number }[] = [];
}
