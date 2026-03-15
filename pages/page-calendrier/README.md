# Calendrier - Structure Modulaire

## Vue d'ensemble

Le calendrier a été refactorisé en une structure modulaire pour améliorer la maintenabilité et la lisibilité du code.

## Architecture des fichiers

### 1. **page-calendrier.js** (Component principal)
- Classe : `PageCalendrier extends HTMLElement`
- Rôle : Gestion du composant web personnalisé
- Responsabilités :
  - Cycle de vie du composant (constructor, connectedCallback)
  - Gestion de la navigation (prev, next, today)
  - Changement de vue (mois, semaine, jour)
  - Orchestration des modules

### 2. **calendar-utils.js** (Utilitaires)
- Classe : `CalendarUtils` (méthodes statiques)
- Rôle : Gestion des dates et formatage
- Méthodes principales :
  - `getToday()` - Date d'aujourd'hui normalisée
  - `normalizeDate(date)` - Normaliser une date (00:00:00)
  - `dateToString(date)` - Format YYYY-MM-DD
  - `isSameDay(date1, date2)` - Comparaison de jours
  - `formatTime(time)` - Format HH:mm (français)
  - `getHourFromTime(time)` - Extraire l'heure
  - `hourToString(hour)` - Format d'heure français

### 3. **calendar-events.js** (Gestion des événements)
- Classe : `CalendarEvents`
- Rôle : Persistance et gestion des événements
- Méthodes principales :
  - `getEventsForDate(dateStr)` - Récupérer les événements du jour
  - `addEvent(dateStr, event)` - Ajouter un événement
  - `updateEvent(dateStr, index, event)` - Modifier un événement
  - `deleteEvent(dateStr, index)` - Supprimer un événement
  - `getEventsForHour(dateStr, hour)` - Événements par heure
  - `saveEvents()` - Persister dans localStorage

### 4. **calendar-renderer.js** (Rendu des vues)
- Classe : `CalendarRenderer`
- Rôle : Rendu des différentes vues du calendrier
- Méthodes principales :
  - `renderMonth(currentDate)` - Vue mensuelle (grille 7×6)
  - `renderWeek(currentDate, onCellClick, onEventClick)` - Vue hebdomadaire (grille horaire)
  - `renderDay(currentDate, dayEvents, ...)` - Vue journalière (liste)

### 5. **calendar-dialog.js** (Gestion du dialogue)
- Classe : `CalendarDialog`
- Rôle : Affichage et gestion du dialogue d'événements
- Méthodes principales :
  - `show(date, editIdx, defaultTime, onDialogClose)` - Afficher le dialogue
  - `hide()` - Masquer le dialogue
  - Gère l'ajout, la modification et la suppression d'événements

## Flux de données

```
PageCalendrier (orchestration)
    ↓
    ├─→ CalendarUtils (utilitaires)
    ├─→ CalendarEvents (données)
    ├─→ CalendarRenderer (affichage)
    └─→ CalendarDialog (interaction)
```

## Format de l'heure (Français)

Toutes les heures sont au format **HH:mm** (24h) :
- `00:00` → Minuit
- `12:00` → Midi
- `18:30` → 18h30

Utiliser `CalendarUtils.formatTime(time)` pour le formatage.

## Stockage localStorage

**Clé** : `calendar_events`

**Format** :
```json
{
  "2026-03-15": [
    {
      "title": "Rendez-vous médical",
      "time": "14:00",
      "description": "Consultation générale",
      "type": "Rendez-vous médical",
      "color": "#E74C3C"
    }
  ]
}
```

## Types d'événements

1. **Rendez-vous médical** - #E74C3C (rouge)
2. **Médicament** - #3498DB (bleu)
3. **Activité** - #27AE60 (vert)
4. **Autre** - #F39C12 (orange)

## Avantages de la structure modulaire

✅ **Code séparé par responsabilité** - Chaque module a un rôle clair
✅ **Facile à maintenir** - Modifications isolées à un seul module
✅ **Réutilisable** - Les modules peuvent être utilisés indépendamment
✅ **Testable** - Chaque classe peut être testée séparément
✅ **Lisible** - Moins de lignes par fichier, structure claire

## Taille des fichiers avant/après

| Fichier | Avant | Après |
|---------|-------|-------|
| page-calendrier.js | 550 lignes | 130 lignes |
| **Total** | **550 lignes** | **~450 lignes** (modulaire) |

**Bénéfice** : Meilleure organisation, même nombre de lignes mais beaucoup plus lisible.
