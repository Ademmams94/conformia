# Extension ConformIA — Détection Shadow AI

Extension Chrome (Manifest V3) qui détecte la visite de domaines d'outils IA
connus et remonte au backend **uniquement** le domaine + un horodatage + un
identifiant anonyme hashé. Elle ne capture aucun contenu de page et ne bloque
rien (spec §6.1 / §8).

## Développement

Depuis la racine du projet :

```bash
npm run build:extension     # compile extension/src → extension/dist
npm run dev:extension       # recompile en continu (watch)
```

## Charger l'extension dans Chrome

1. Ouvrir `chrome://extensions`.
2. Activer le **Mode développeur** (en haut à droite).
3. **Charger l'extension non empaquetée** → sélectionner le dossier `extension/`.
4. Ouvrir les **options** de l'extension et coller le **jeton d'ingestion**
   (visible dans le dashboard ConformIA, section « Connecter l'extension »).
   En local, laisser l'URL du backend sur `http://localhost:3000`.

## Fonctionnement

- `src/ai-domains.ts` — liste curatée des domaines IA détectés.
- `src/background.ts` — service worker : écoute `chrome.webNavigation.onCompleted`,
  et à la visite d'un domaine IA connu, envoie l'événement à
  `POST /api/extension/events` (throttle : 1 événement max par domaine / 2 min).
- `src/options.ts` + `options.html` — configuration du jeton et de l'URL backend.

## Garde-fous

- Aucune capture du contenu des pages : seul le `hostname` est lu.
- Identifiant salarié = UUID aléatoire par installation, hashé en SHA-256
  côté client avant tout envoi.
- Aucune action de blocage.

## Production

Avant un déploiement réel, ajouter l'URL du backend de production dans
`host_permissions` du `manifest.json` (à la place ou en plus de
`http://localhost:3000/*`).
