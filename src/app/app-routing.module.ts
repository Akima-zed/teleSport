import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CountryComponent } from "./pages/country/country.component";

/**
 * AppRoutingModule
 * --------------------------------------------------
 * Définit les routes principales de l’application et
 * configure le router Angular.
 */

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path : 'country/:countryName',
    component : CountryComponent
  },

  {
    path : 'not-found',
    component : NotFoundComponent
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
