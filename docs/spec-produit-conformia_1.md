# ConformIA — Kit de Conformité AI Act pour TPE/PME françaises
### Document de spécification produit v1.0 — à destination de Claude Code / Cowork pour exécution

> **Nom "ConformIA" = placeholder.** Pas encore validé, pas de dépôt de marque, pas de vérification de dispo de domaine. À trancher avant tout lancement public.

---

## 0. Comment utiliser ce document

Ce doc est écrit pour être donné tel quel à Claude Code ou Cowork comme brief de départ. Il contient :
- Le "pourquoi" (marché, cible, positionnement) — sections 1 à 5
- Le "quoi" (périmètre du MVP) — section 6
- Le "comment" technique (stack, données, archi) — section 7
- Les garde-fous non négociables — section 8
- Le plan d'exécution semaine par semaine — section 9
- Le business (pricing, GTM, métriques) — sections 10 à 12

Les points marqués **🔴 DÉCISION REQUISE** sont des choix qu'Adem doit trancher avant ou pendant le build — Claude Code ne doit pas les deviner à sa place.

---

## 1. Pitch en une phrase

Un outil d'auto-diagnostic qui permet à une PME de cartographier automatiquement les outils IA utilisés dans son organisation (déclarés et "Shadow AI") et de générer sa documentation de conformité AI Act de base — en 20 minutes, pas en 3 semaines de conseil juridique.

## 2. Contexte & urgence marché

- L'AI Act (Règlement UE 2024/1689) devient pleinement applicable pour les systèmes à haut risque et les obligations de transparence le **2 août 2026**. On est le 4 juillet 2026 : il reste environ 4 semaines. C'est le moteur de la fenêtre d'opportunité — après cette date, l'urgence perçue par les dirigeants redescend probablement.
- La majorité des PME françaises n'ont pas commencé leur mise en conformité, et beaucoup ignorent qu'elles sont déjà concernées : utiliser un simple logiciel RH ou CRM avec une brique IA suffit à qualifier l'entreprise de "déployeur" au sens du règlement.
- Sanctions théoriques : jusqu'à 35M€/7% du CA mondial pour les pratiques interdites, 15M€/3% pour non-conformité haut risque, 7,5M€/1% pour informations inexactes aux autorités. En pratique, les PME bénéficient d'une application proportionnée — mais pas d'une dispense.
- Le "Shadow AI" (usages non déclarés d'outils IA par les salariés — copier-coller de données dans ChatGPT, extensions IA installées sans validation IT) est explicitement traité comme un risque organisationnel à documenter au même titre que les outils officiels.
- Concurrence identifiée : Leto, Complyla, AiActo, Fragments Studio, Crescendo Avocats (cabinet d'avocats). Tous positionnés conseil/accompagnement à plusieurs milliers d'euros, ou SaaS généraliste RGPD+AI Act sans focus PME low-cost self-service. **Le vide identifié : un outil simple, pas cher, auto-service, qui fait 80% du chemin sans juriste dédié.**

## 3. Cible précise (ICP)

- **Taille :** 10 à 100 salariés (en dessous, pas de budget ; au-dessus, elles ont déjà un DPO/juriste et achètent du conseil).
- **Profil :** PME françaises sans DPO dédié, qui utilisent au moins 2-3 outils SaaS avec composante IA (CRM, ATS/recrutement, support client, outil marketing) et/ou dont les salariés utilisent ChatGPT/Claude au quotidien sans cadre défini.
- **Secteurs à haut risque prioritaires** (recrutement automatisé, scoring, évaluation salariés = Annexe III haut risque) : cabinets de recrutement, agences RH, fintechs/organismes de crédit, assurances. Ce sont ceux qui ont l'urgence la plus concrète — à cibler en premier pour les pilotes.
- **Qui signe :** le dirigeant ou le DAF/RH — pas un développeur. Le produit doit être vendable et utilisable par quelqu'un qui ne sait pas ce qu'est un LLM.

## 4. Problème détaillé (jobs-to-be-done)

Le dirigeant de PME doit répondre à 3 questions avant le 2 août 2026, et n'a ni le temps ni les compétences pour y répondre seul :
1. **"Quels outils IA utilise-t-on réellement dans ma boîte ?"** (y compris ce que les salariés utilisent sans le déclarer)
2. **"Lesquels sont à risque au sens du règlement, et pourquoi ?"**
3. **"Qu'est-ce que je dois produire comme documentation pour ne pas être en faute ?"**

## 5. Positionnement & différenciation

| | Cabinets de conseil / avocats | Leto / Complyla / AiActo | ConformIA |
|---|---|---|---|
| Prix | 3 000 - 15 000 € | Abonnement SaaS, tarif entreprise non public | 49-99 €/mois, auto-service |
| Détection Shadow AI | Manuelle (questionnaire) | Non identifiée dans leur offre | **Automatique via extension navigateur** |
| Autonomie client | Faible (dépend du cabinet) | Moyenne | Élevée (auto-diagnostic) |
| Profondeur juridique | Élevée | Élevée | **Volontairement limitée — voir section 8** |

**Positionnement : "le premier pas avant d'appeler un avocat, pas un remplacement de l'avocat."** On vend la cartographie et le dégrossissage, pas le blindage juridique final.

## 6. Périmètre du MVP

### 6.1 Dans le scope (V1)

| Fonctionnalité | Description |
|---|---|
| Extension Chrome de détection | Détecte la visite de domaines IA connus (liste curatée : chat.openai.com, claude.ai, gemini.google.com, perplexity.ai, etc.) et remonte domaine + timestamp + poste anonymisé au backend |
| Dashboard admin | Vue consolidée des outils IA détectés dans l'organisation, avec fréquence d'usage et nombre d'utilisateurs |
| Moteur de classification par règles | Classe chaque outil détecté + chaque outil déclaré manuellement selon une grille basée sur l'Annexe III (interdit / haut risque / risque limité / risque minimal), avec justification textuelle |
| Questionnaire de déclaration manuelle | Pour les outils IA intégrés à des logiciels métiers (CRM, ATS) que l'extension ne peut pas détecter par simple navigation |
| Génération de documents | Export PDF : registre de cartographie des systèmes IA + template d'AIPD pré-rempli (Article croisé RGPD) |
| Onboarding self-service | Signup → installation extension → invitation employés → premier rapport en moins de 20 minutes |

### 6.2 Hors scope (explicitement, pour ne pas dériver)

- Pas de conseil juridique personnalisé ni de validation par un juriste dans le produit lui-même (voir section 8)
- Pas de blocage actif des outils IA détectés (uniquement de la visibilité, pas de la police) — un outil qui bloque des sites crée de la friction RH et des problèmes de déploiement IT
- Pas de gestion de la conformité RGPD complète (on croise avec elle mais on ne la remplace pas)
- Pas de multi-langue en V1 (français uniquement)
- Pas d'app mobile

## 7. Architecture technique proposée

### 7.1 Stack recommandé

Stack choisi sur des critères purement techniques — adéquation au produit, standards actuels du marché, scalabilité, maintenabilité — indépendamment de toute courbe d'apprentissage :

- **Frontend / Dashboard : Next.js (React) + TypeScript + Tailwind.** Standard de facto pour ce type de SaaS B2B en 2026 — App Router, Server Components, écosystème et documentation les plus larges du marché, déploiement natif sur Vercel.
- **Backend / DB : Supabase (Postgres + Auth + Storage).** Postgres avec Row-Level Security est la solution la plus robuste pour garantir une isolation stricte des données entre PME clientes — non négociable sur un produit qui traite des données de conformité sensibles. Auth multi-organisation native, scalable sans réécriture jusqu'à plusieurs milliers de comptes.
- **Extension Chrome : Manifest V3, TypeScript, API `chrome.webNavigation`** pour la détection de domaines (pas besoin de `webRequest`, plus invasif, pour la V1). Manifest V3 n'est plus une option depuis la dépréciation de V2 par Chrome — c'est la norme imposée, pas un choix.
- **Classification IA : moteur hybride règles-fixes (Annexe III) + API Claude en fallback** pour les outils non répertoriés dans la liste curatée. Choix d'ingénierie : une classification à portée réglementaire doit rester auditable et reproductible (règles fixes sur les cas connus), tout en couvrant les cas non prévus via un LLM avec traçabilité de la décision.
- **Génération PDF : rendu HTML → PDF via Puppeteer/Playwright headless.** Contrôle total du rendu, plus robuste en production que les librairies de génération PDF pure JS pour des documents structurés.
- **Paiement : Stripe.** Standard incontesté pour la facturation SaaS B2B.
- **Hébergement : Vercel (frontend) + Supabase Cloud (backend).** Intégration native avec Next.js, CI/CD géré, scalabilité sans intervention manuelle.
- **Email transactionnel : Resend.** API moderne, bonne délivrabilité, conçue pour ce type d'usage (invitations, rapports générés, alertes).

### 7.2 Modèle de données (simplifié)

```
companies (id, name, siret, sector, employee_count, contact_email, created_at)
users (id, company_id, email, role[admin|employee], created_at)
detected_tools (id, company_id, domain, tool_name, first_seen, last_seen, distinct_users_count)
declared_tools (id, company_id, tool_name, description, declared_by_user_id, created_at)
risk_classifications (id, tool_id, tool_source[detected|declared], risk_level[prohibited|high|limited|minimal],
                       annexe_iii_category, rationale, needs_legal_review boolean)
compliance_documents (id, company_id, type[cartographie|aipd_template|registre], generated_at, file_url)
extension_events (id, company_id, user_id_hash, domain, timestamp) -- log brut, anonymisé, purge à 90 jours
```

### 7.3 Sécurité & vie privée — point d'attention spécifique

Ironie du produit : un outil de conformité IA qui violerait lui-même le RGPD ou le droit du travail serait un échec total de crédibilité. Règles à respecter dès la conception :
- L'extension ne doit **jamais** capturer le contenu des pages visitées, uniquement le domaine et l'horodatage
- Les identifiants employés doivent être hashés côté client avant envoi au backend
- Durée de rétention des logs bruts limitée et documentée (90 jours proposé, à valider)
- Chiffrement au repos et en transit sur toute donnée liée à l'organisation cliente

## 8. Garde-fous légaux — non négociable

Deux risques juridiques distincts à ne pas confondre :

**A. Risque "on donne un mauvais conseil juridique"**
Le produit classe des outils IA par niveau de risque réglementaire — c'est, de fait, une activité d'analyse juridique. Sans validation par un professionnel du droit, une classification erronée transmise à un client qui s'y fie peut engager la responsabilité de l'éditeur.
- **🔴 DÉCISION REQUISE avant toute vente : sécuriser un partenaire juridique** (avocat, juriste freelance spécialisé RGPD/AI Act, ou étudiant en droit numérique avancé du réseau d'Adem) pour relire la grille de classification et les templates générés.
- En attendant ce partenaire : le produit doit afficher un disclaimer clair sur chaque document généré ("outil d'auto-diagnostic, ne remplace pas un avis juridique") et ne jamais se positionner comme "conforme garanti".

**B. Risque "l'outil de surveillance des salariés est lui-même illégal"**
Le droit du travail français encadre strictement la surveillance des salariés : information préalable obligatoire des employés, et pour les entreprises au-dessus du seuil, consultation du CSE avant déploiement d'un outil de suivi de l'activité numérique.
- L'extension doit être présentée aux salariés de manière transparente (pas d'installation silencieuse), avec une note d'information type fournie dans le produit.
- **🔴 DÉCISION REQUISE :** faire valider ce point spécifiquement par le partenaire juridique — c'est un angle mort qu'un outil de conformité IA "classique" pourrait ne pas avoir anticipé, et c'est exactement le genre de trou dans la raquette qui peut couler un produit avant son lancement.

## 9. Plan d'exécution — 5 semaines

| Semaine | Objectif | Livrable concret |
|---|---|---|
| **S1** | Fondations + partenaire juridique | Repo scaffoldé (Next.js + Supabase), schéma DB en place. **En parallèle : contacter 2-3 pistes pour le partenariat juridique — condition bloquante avant toute vente, pas avant tout dev.** |
| **S2** | Extension + détection | Extension Chrome fonctionnelle en local, détection de domaines, remontée d'événements au backend |
| **S3** | Dashboard + classification | Dashboard admin affichant les outils détectés, moteur de classification par règles Annexe III |
| **S4** | Génération de documents + questionnaire manuel | Export PDF cartographie + template AIPD, questionnaire de déclaration manuelle des outils intégrés |
| **S5** | Pilotes + itération | Déploiement chez 3-5 PME du réseau d'Adem (gratuit ou très réduit), collecte de retours, corrections |

**Definition of Done du MVP :** un dirigeant de PME peut, seul, s'inscrire, installer l'extension pour son équipe, et obtenir un rapport de cartographie + classification exportable en PDF en moins de 24h, sans intervention humaine côté ConformIA.

## 10. Pricing

**🔴 DÉCISION REQUISE — à valider après retours pilotes, proposition de départ :**

| Tier | Prix | Contenu |
|---|---|---|
| Starter | 49 €/mois | Jusqu'à 20 salariés, cartographie + classification, export PDF basique |
| Pro | 99 €/mois | Jusqu'à 100 salariés, mises à jour réglementaires, support prioritaire |
| Pilotes (S5) | Gratuit ou 1 mois offert | En échange de retours structurés et d'un témoignage utilisable |

## 11. Go-to-market

Canal principal : le réseau direct d'Adem + son aisance sur les réseaux sociaux (voir CONTEXT.md).
- **Phase pilote (S5) :** 3-5 PME accessibles via contacts personnels — priorité aux secteurs à risque élevé (recrutement, RH, fintech) identifiés en section 3
- **Contenu :** documenter la construction en public (LinkedIn) — "je construis un outil de conformité AI Act avant la deadline du 2 août" est un narratif à forte actualité, qui positionne Adem comme légitime sur le sujet avant même d'avoir des clients payants
- **Post-pilote :** démarchage direct des secteurs à haut risque, argument de vente = urgence réglementaire + prix très inférieur au conseil classique

## 12. Métriques de validation (kill criteria)

- **J+30 (fin S5+quelques jours) :** au moins 1 PME pilote a généré un rapport complet et donné un retour utilisable. Sinon → le produit a un problème d'usage, pas seulement de vente : creuser pourquoi avant de continuer.
- **J+45 :** au moins 1 conversion pilote → payant, ou au moins 3 prospects chauds identifiés hors réseau direct. Sinon → réévaluer si le pricing, le positionnement ou le canal d'acquisition sont en cause.
- Si à J+60 aucune traction commerciale réelle (0 client payant, pipeline froid) → ne pas s'acharner, c'est le signal de pivoter ou d'arrêter, pas de "pousser plus fort".

## 13. Risques & mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Pas de partenaire juridique trouvé à temps | Bloquant pour la vente | Commencer la recherche dès S1, en parallèle du dev — ne pas attendre S5 |
| Concurrents (Leto, Complyla) baissent leurs prix ou sortent une offre PME low-cost | Perte de l'avantage prix | Différenciation sur la détection Shadow AI automatique, pas juste sur le prix |
| Adoption lente — les PME sous-estiment encore le sujet | Cycle de vente plus long que prévu | Cibler en priorité les secteurs à obligation haut risque (recrutement, crédit) où l'urgence est concrète, pas théorique |
| Extension perçue comme intrusive par les salariés | Rejet en interne, mauvaise pub | Transparence obligatoire (voir section 8B), positionnement "visibilité pour l'entreprise", pas "flicage des salariés" |
| Deadline du 2 août 2026 passée sans traction | Perte du momentum réglementaire qui justifie l'urgence | La cartographie IA reste un besoin permanent au-delà de la deadline (nouveaux outils, mises à jour réglementaires) — le pitch doit survivre à la date, pas en dépendre à 100% |

## 14. Actions immédiates (checklist)

- [ ] Trancher le nom définitif du produit et vérifier la disponibilité du domaine
- [ ] Lister 2-3 pistes concrètes pour le partenariat juridique (réseau perso, étudiants en droit, avocats spécialisés RGPD contactables)
- [ ] Lister 5-8 PME du réseau personnel correspondant à l'ICP (section 3) pour les pilotes S5
- [ ] Donner ce document à Claude Code pour scaffolder le repo (section 7)
- [ ] Publier le premier post LinkedIn "build in public" annonçant le projet

---

## Sources / repères réglementaires (pour vérification, à jour au 4 juillet 2026)

- Calendrier et obligations AI Act : digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- AI Act et PME françaises, obligations concrètes : crescendo-avocats.com/2026/05/10/ai-act-tpe-pme-conformite-2026
- Shadow AI et cartographie des usages : mdp-data.com/ai-act-obligations-et-mise-en-conformite-des-organisations
- Benchmark d'accompagnement PME (audit express 5 jours, mission complète 4-8 semaines) : complyla.com/blog/conformite-eu-ai-act-pme.html
- Risques de sécurité des navigateurs agentiques (contexte, pour la veille produit) : futura-sciences.com — article sur HoloTab (H Company)

*Document à considérer comme vivant — à mettre à jour au fil des retours pilotes et de l'évolution réglementaire (des guidelines complémentaires de l'AI Office sont prévues au T2 2026).*
