/**
 * NotFoundComponent
 * ------------------------------------------------------------
 * Objectif :
 *  - Afficher un message clair lorsqu’une route n’existe pas
 *  - Proposer un lien de retour vers le dashboard
 */
import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  constructor() { }
}
