# Famille Agent (iOS & Android)

Application mobile familiale avec agent IA pour organiser le quotidien :
- Emploi du temps de la famille (jour, semaine, mois)
- Rendez-vous personnels et familiaux, sports et récurrences
- Rappels de prises de médicaments et suivi de l'historique

## Architecture & Stack
- **Mobile** : React Native (Expo) + TypeScript (iOS & Android)
- **Données & Sync** : Base locale SQLite + Supabase (PostgreSQL & Edge Functions)
- **Rappels** : Notifications locales programmées pour les événements et traitements

## Fichiers du dépôt
- `supabase/schema.sql` : Schéma de base de données (foyer, membres, planning, médicaments)
- `supabase/functions/family-agent/index.ts` : Agent IA avec outils de planification
- `src/screens/DailyFamilyScreen.tsx` : Écran principal du jour (médicaments, agenda, commande IA)
# famille-agent-app
