# VyBzzZ Mobile App

Application mobile React Native (Expo) pour la plateforme VyBzzZ.

## Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- Compte Expo (gratuit): https://expo.dev
- iOS Simulator (Mac) ou Android Emulator

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Ou lancer directement sur iOS
npm run ios

# Ou lancer directement sur Android
npm run android
```

## Configuration

1. **Copier le fichier d'environnement**:
   ```bash
   cp .env.example .env
   ```

2. **Remplir les variables d'environnement** dans `.env`:
   - `EXPO_PUBLIC_SUPABASE_URL`: URL de votre projet Supabase
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Clé anonyme Supabase
   - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Clé publique Stripe
   - `EXPO_PUBLIC_API_URL`: URL de l'API (http://localhost:3000 en dev)

## Structure du Projet

```
mobile/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/            # Écrans d'authentification
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/            # Navigation par onglets
│   │   ├── index.tsx      # Accueil (liste des événements)
│   │   ├── tickets.tsx    # Mes tickets
│   │   └── profile.tsx    # Profil utilisateur
│   ├── events/            # Détails des événements
│   │   ├── [id].tsx       # Page de détail
│   │   └── [id]/
│   │       └── live.tsx   # Streaming live
│   └── _layout.tsx        # Layout racine
│
├── components/            # Composants réutilisables
│   ├── EventCard.tsx     # Carte événement
│   ├── Button.tsx        # Bouton personnalisé
│   ├── Input.tsx         # Champ de saisie
│   └── Loading.tsx       # Indicateur de chargement
│
├── hooks/                # Custom hooks
│   ├── useAuth.ts        # Hook d'authentification
│   ├── useEvents.ts      # Hook pour les événements
│   └── useTickets.ts     # Hook pour les tickets
│
├── lib/                  # Utilitaires et services
│   ├── supabase.ts       # Client Supabase
│   ├── api.ts            # Service API centralisé
│   └── notifications.ts  # Push notifications
│
├── constants/            # Constantes
│   └── Colors.ts         # Palette de couleurs
│
├── types/                # Types TypeScript
│   └── index.ts          # Types partagés
│
├── app.json              # Configuration Expo
├── package.json          # Dépendances
├── tsconfig.json         # Config TypeScript
└── .env.example          # Template env vars
```

## Développement

### Tester sur un appareil physique

1. Installer l'app **Expo Go** sur votre smartphone (iOS/Android)
2. Scanner le QR code affiché dans le terminal après `npm start`

### Tester sur simulateur/émulateur

**iOS** (Mac uniquement):
```bash
npm run ios
```

**Android**:
```bash
npm run android
```

## Scripts Disponibles

- `npm start` - Démarrer le serveur Expo
- `npm run ios` - Lancer sur iOS Simulator
- `npm run android` - Lancer sur Android Emulator
- `npm run web` - Lancer dans le navigateur (dev uniquement)
- `npm test` - Lancer les tests
- `npm run lint` - Vérifier le code (ESLint)

## Build de Production

### Configuration EAS (Expo Application Services)

```bash
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Configurer le projet
eas build:configure
```

### Build iOS

```bash
# Build pour TestFlight
eas build --platform ios --profile preview

# Build pour App Store
eas build --platform ios --profile production
```

### Build Android

```bash
# Build pour Google Play (Beta)
eas build --platform android --profile preview

# Build pour Google Play (Production)
eas build --platform android --profile production
```

### Soumission aux stores

```bash
# iOS (App Store)
eas submit --platform ios

# Android (Google Play)
eas submit --platform android
```

## Fonctionnalités

### ✅ Implémentées

- [ ] Authentification (Sign In / Sign Up)
- [ ] Liste des événements à venir
- [ ] Détail d'un événement
- [ ] Achat de ticket (Stripe)
- [ ] Mes tickets (avec QR code)
- [ ] Streaming live
- [ ] Push notifications
- [ ] Profil utilisateur

### 🚧 En cours

- [ ] Chat en direct pendant les événements
- [ ] Envoi de pourboires aux artistes
- [ ] Vidéos courtes (Shorts)
- [ ] Gamification (miles, badges)

### 📅 À venir

- [ ] Mode hors ligne
- [ ] Partage sur les réseaux sociaux
- [ ] Multi-langue (6 langues)
- [ ] Thème sombre

## Dépendances Principales

- **React Native** - Framework mobile
- **Expo** - Toolchain et services
- **Expo Router** - Navigation basée sur les fichiers
- **Supabase** - Base de données et authentification
- **Stripe React Native** - Paiements
- **React Native WebView** - Affichage YouTube
- **Expo Notifications** - Push notifications
- **date-fns** - Manipulation de dates

## Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

## Débogage

### React Native Debugger

1. Installer [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Lancer l'app avec `npm start`
3. Ouvrir le menu développeur (Cmd+D sur iOS, Cmd+M sur Android)
4. Sélectionner "Debug remote JS"

### Logs

- **iOS**: Ouvrir Console.app et filtrer par "Expo"
- **Android**: `adb logcat`
- **Expo CLI**: Les logs s'affichent directement dans le terminal

## Déploiement

### Configuration des environnements

Le fichier `eas.json` définit 3 environnements:

- **development**: Build de développement (Expo Go)
- **preview**: Build pour beta testing (TestFlight, Google Play Beta)
- **production**: Build pour les stores officiels

### Variables d'environnement en production

Ajouter les secrets via EAS:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "xxx"
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_live_xxx"
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://vybzzz.com"
```

## Troubleshooting

### "Unable to resolve module..."

```bash
# Nettoyer le cache
npm start -- --clear

# Ou
rm -rf node_modules
npm install
```

### Problèmes de build iOS

```bash
# Nettoyer les builds
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Problèmes de build Android

```bash
cd android
./gradlew clean
cd ..
```

## Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Expo Router](https://expo.github.io/router/docs/)
- [Supabase React Native](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- [Stripe React Native](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)

## Support

- **Discord VyBzzZ**: [TO BE FILLED]
- **Email**: dev@vybzzz.com
- **Issues**: https://github.com/Elpadrino971/rork-vybzzz---concert---live-event-platform/issues

---

**Version**: 1.0.0
**Dernière mise à jour**: November 15, 2025
**Statut**: 🚧 En développement (20% complété)
