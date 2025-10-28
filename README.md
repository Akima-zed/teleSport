# OlympicGamesStarter

Projet Angular pour visualiser les médailles olympiques par pays.

Ce projet est un starter utilisant **Angular 18** et des données mock JSON pour afficher :

- Un dashboard avec les médailles par pays (graphique camembert)
- Une page de détail par pays avec les participations et l’évolution des médailles
- Un header réutilisable avec KPI

---

## Prérequis

- Node.js ≥ 18
- NPM ≥ 8

---

## Installation

1. Cloner le projet
2. Installer les dépendances :

- npm install

## Lancer le serveur de développement

- ng serve

- Puis ouvrir http://localhost:4200/ dans votre navigateur.
- L’application se recharge automatiquement lors de modifications du code source.

## Fonctionnalités

- Dashboard avec graphique camembert des médailles par pays
- Page Country Detail avec graphique en ligne par année
- Tri par nom ou par total de médailles
- Header réutilisable avec KPI (Pays, Médailles, JOs)
- Responsive : Desktop / Tablette / Mobile
- Gestion des erreurs (message + bouton retour)
- Chargement avec spinner ou skeleton


## Bonnes pratiques appliquées

- Typage strict (pas de any)
- Observables détruits avec takeUntil
- Gestion des erreurs avec catchError
- Code factorisé et lisible
- Fichiers < 300 lignes
- ActivatedRoute pour récupérer l’ID pays
- Navigation sécurisée pour ID invalide


## Limitations connues

- Données mock uniquement, pas de backend réel
- Responsive partiel
- Pas de tests unitaires
- Graphiques et styles simples
