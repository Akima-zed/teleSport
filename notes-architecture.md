## Étape 1 – Analyse du code existant

### Jʼai observé le fonctionnement de lʼapp globale
- L'app se lance avec `ng serve` et les pages fonctionnent.
- Les composants principaux (`HomeComponent`, `CountryComponent`) sont "trop lourds visuellement", mélangent logique métier et affichage.
- Données statiques dans `assets/mock/olympic.json`, mais code prêt pour une API réelle.
- pas d'architecture claire pour l'app ( service, model .... ) 


### problèmes identifiés

- structure => Pas de services → HTTP direct dans composants | `CountryComponent` : `this.http.get<any[]>(this.olympicUrl).subscribe(...)`
Devrait être dans un **service** pour centraliser les appels et les calculs
- Duplication de code => les calculs sont répété dans les deux component 'country ' et 'home' 
  -     this.totalMedals = medals.reduce((accumulator: any, item: any) => accumulator + parseInt(item), 0);
  -     const sumOfAllMedalsYears = medals.map((i) => i.reduce((acc: any, i: any) => acc + i, 0));
- le css est imbriqué dans les different fichier, pas clair et pas responsive ( manque media queries)
- typage ,utilisation de  `any` partout | `const selectedCountry = data.find((i: any) => i.country === countryName)`
`any` signifie “je ne sais pas ce que c’est” i = quoi ? . Risque d’erreurs. Mieux : créer des interfaces `Country` et `Participation`. |
- quelques console.log on été oublié 

### Priorisé les problèmes , dans l'ordre :

- refaire l'architecture et créer des services pour séparer les logiques métier ( le mettre dans app)
- factoriser pour ne plus avoir de redondance de code 
- refaire les typage 'any' pour 
- enlever le superflu comme les console.log 
- mettre le css propre pour s'adapter à tous les écrans

###  lʼarborescence :

Les différents dossiers 

- pages => Contient les pages principales (Home, Country, NotFound) = vitrine
- Composants = blocs réutilisables (carte, graphique…).
- Services = logique métier et accès aux données.
- models =>  Contient les interfaces TypeScript (Country, Participation).
- app-routing.module.ts => Navigations entre les pages 
- app.module.ts => imports global de l'application Angular, déclare tout les components ( httpclient, formsModule...)
- assets => images, fichier mock utiliser 
- styles.scss => style commun a toutes l'application 
- index.html => 
- main.ts => Lance l’application Angular et initialise le module racine (AppModule).
- polyfills.ts => Compatibilité navigateurs pour que Angular fonctionne sur différents navigateurs.
- test.ts → Configuration des tests unitaires pour Karma/Jasmine global.

