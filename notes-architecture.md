# Olympic Games Starter – Note d'Architecture

## 1. Analyse du code existant et problèmes identifiés

### Observations globales
- L'application se lance avec `ng serve` et les pages fonctionnent.
- Les composants principaux (`HomeComponent`, `CountryComponent`) sont **trop lourds visuellement**, mélangeant logique métier et affichage.
- Les données sont statiques dans `assets/mock/olympic.json`, mais le code peut évoluer vers une API réelle.
- Architecture peu claire pour l'instant (services, modèles, composants réutilisables).

### Problèmes identifiés
1. **Structure**
  - Appels HTTP directs dans les composants (`this.http.get<any[]>(...)`) → devrait être centralisé dans un **service** (`OlympicService`) qui gère aussi les calculs métier.
2. **Duplication de code**
  - Calculs répétés dans `HomeComponent` et `CountryComponent` :
    ```ts
    this.totalMedals = medals.reduce((acc: any, item: any) => acc + parseInt(item), 0);
    ```
  - Devrait être factorisé dans le service.
3. **Typage**
  - Utilisation de `any` → risque d’erreurs. Exemple :
    ```ts
    const selectedCountry = data.find((i: any) => i.country === countryName);
    ```
  - Mieux : créer des interfaces `Country` et `Participation`.
4. **CSS**
  - Styles imbriqués dans plusieurs fichiers, manque de clarté.
  - Responsive partiel : pas de media queries pour mobile/tablette.
5. **Code superflu**
  - `console.log` oubliés dans les composants.

---

## 2. Priorités de refactorisation

1. Refactorer l’architecture pour séparer **logique métier** et **UI**.
2. Factoriser le code pour éviter les duplications.
3. Remplacer tous les `any` par des interfaces strictes (`Country`, `Participation`).
4. Nettoyer le code (console.log, élément inutilisés).
5. Refaire le CSS pour un rendu **responsive** (desktop, tablette, mobile).

---

## 3. Architecture cible / Arborescence

src/
├─ app/
│ ├─ components/ # Composants réutilisables
│ │ └─ header/ # Header avec KPI
│ ├─ models/ # Interfaces TypeScript (Country, Participation)
│ ├─ pages/ # Pages routées
│ │ ├─ home/ # Dashboard
│ │ ├─ country/ # Détail d'un pays
│ │ └─ not-found/ #page 404 
│ ├─ services/ 
│ │ └─ OlympicService.ts
│ ├─ app.component.ts
│ ├─ app.component.html
│ ├─ app.component.scss
│ ├─ app.component.spec.ts
│ ├─ app.module.ts
│ ├─ app-routing.module.ts
│ └─ app.module.ts
├─ assets/
│   ├─images/ # image de l'appli
│   └─ mock/olympic.json # Données mock
├─ styles.scss # Styles globaux
├─ index.html
├─ main.ts
├─ polyfills.ts
├─ test.ts # Configuration tests unitaires Karma/Jasmine

---

## 4. Chargement et gestion des erreurs

- **Loading State**
  - Ajouter une variable `loading: boolean` dans les composants.
  - Dans le template :
    ```html
    <app-spinner *ngIf="loading"></app-spinner>
    <div *ngIf="!loading && !errorMessage">Contenu</div>
    ```
    Cet état évite un effet “page vide” et améliore l’UX.
  
- **Gestion des erreurs**
  - Utiliser `catchError` dans les services ou observables.
  - Afficher un **message clair** + **bouton retour** vers la page précédente.
  - Exemple :
    ```ts
    catchError((err: unknown) => {
      this.errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      return of(undefined);
    })
    ```

---

## 5. Bonnes pratiques appliquées

- Typage strict (`noImplicitAny` activé, création d’interfaces TypeScript).
- Factorisation du code : calculs et appels HTTP centralisés dans `OlympicService`.
- Observables détruits avec `takeUntil` pour éviter les fuites mémoire.
- Navigation sécurisée via ActivatedRoute + contrôle d’ID invalide.
- Navigation sécurisée : gestion des IDs invalides.
- Composants < 300 lignes pour lisibilité.
- Responsive design Desktop / Tablette / Mobile.

---

## 6. Limitations actuelles

- Données mock uniquement → pas de backend réel.
- Graphiques et styles simples.
- Responsive partiel (nécessite ajustement CSS).
- Pas de tests unitaires.

## 7. Synthèse personnelle

Le projet fonctionne, mais reste à un stade prototype.
J’ai identifié les points clés pour le rendre maintenable, typé et scalable.
Ma priorité a été : une architecture claire, services bien isolés, et interface responsive propre.
Ces choix visent à professionnaliser le code tout en restant fidèle à l’objectif du projet.
