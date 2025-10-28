# VyBzzZ Mobile - Guide de Setup pour le Dev Mobile

## 📱 Setup React Native Project

### 1. Créer le projet Expo

```bash
npx create-expo-app vybzzz-mobile --template blank-typescript
cd vybzzz-mobile
```

### 2. Installer les dépendances

```bash
# Core dependencies
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Stripe
npm install @stripe/stripe-react-native

# Video & Casting
npm install expo-av
npm install react-native-google-cast

# UI Components
npm install react-native-gesture-handler
npm install react-native-reanimated

# Utils
npm install date-fns
npm install axios
```

### 3. Structure du Projet

```
vybzzz-mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── discover.tsx      # Feed shorts
│   │   ├── events.tsx        # Liste événements
│   │   ├── live.tsx          # En direct
│   │   ├── profile.tsx       # Profil
│   │   └── _layout.tsx       # Navigation tabs
│   ├── event/
│   │   └── [id].tsx          # Détail événement
│   └── _layout.tsx
├── components/
│   ├── EventCard.tsx
│   ├── ShortPlayer.tsx
│   ├── ChatMessage.tsx
│   └── ...
├── lib/
│   ├── api-client.ts         # Copié du repo principal
│   ├── supabase.ts
│   └── stripe.ts
├── types/
│   └── database.ts           # Copié du repo principal
└── constants/
    ├── Colors.ts
    └── Config.ts
```

### 4. Configuration

Créer `app.json`:

```json
{
  "expo": {
    "name": "VyBzzZ",
    "slug": "vybzzz",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B5CF6"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.vybzzz.app",
      "infoPlist": {
        "NSCameraUsageDescription": "VyBzzZ needs camera access for QR code scanning",
        "NSMicrophoneUsageDescription": "VyBzzZ needs microphone access for voice messages"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#8B5CF6"
      },
      "package": "com.vybzzz.app",
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO"
      ]
    },
    "plugins": [
      "@stripe/stripe-react-native",
      [
        "expo-av",
        {
          "microphonePermission": "Allow VyBzzZ to access your microphone."
        }
      ]
    ]
  }
}
```

### 5. Variables d'environnement

Créer `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_API_URL=https://vybzzz.com/api
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

## 📱 Screens à Créer

### Priority 1 (Semaine 1)
- [x] Login
- [x] Signup
- [x] Home (liste événements)
- [x] Event Detail
- [x] Ticket Purchase Flow

### Priority 2 (Semaine 2)
- [ ] Discover Feed (Shorts)
- [ ] Live Screen avec Casting
- [ ] Chat
- [ ] Tips Modal
- [ ] Profile

### Priority 3 (Semaine 3)
- [ ] Artist Dashboard
- [ ] Event Creation (artists)
- [ ] Gamification (badges, quests)
- [ ] Notifications

## 🎨 Design Guidelines

### Couleurs VyBzzZ
```typescript
const Colors = {
  primary: {
    purple: '#8B5CF6',
    pink: '#EC4899',
    blue: '#3B82F6',
  },
  background: {
    dark: '#0F172A',
    light: '#FFFFFF',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    light: '#FFFFFF',
  }
}
```

### Navigation
- Bottom tabs: Discover, Events, Live, Profile
- Stack navigation pour les détails

### Animations
- Swipe verticale pour les shorts (TikTok-style)
- Transitions fluides entre screens
- Loading states avec skeletons

## 🔌 Intégration API

### Exemple: Login
```typescript
import { api } from '@/lib/api-client'

const LoginScreen = () => {
  const handleLogin = async () => {
    try {
      const result = await api.auth.login(email, password)
      // Navigate to home
      router.push('/(tabs)/events')
    } catch (error) {
      Alert.alert('Error', error.message)
    }
  }
}
```

### Exemple: Fetch Events
```typescript
import { api } from '@/lib/api-client'
import { Event } from '@/types/database'

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await api.events.getUpcoming(20)
      setEvents(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
}
```

### Exemple: Purchase Ticket
```typescript
import { useStripe } from '@stripe/stripe-react-native'

const EventDetailScreen = ({ eventId }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const handlePurchase = async () => {
    try {
      // 1. Get payment intent from API
      const { stripe_client_secret, amount } = await api.tickets.purchase({
        event_id: eventId,
      })

      // 2. Initialize Stripe payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: stripe_client_secret,
        merchantDisplayName: 'VyBzzZ',
      })

      if (initError) throw initError

      // 3. Present payment sheet
      const { error: presentError } = await presentPaymentSheet()

      if (presentError) throw presentError

      // 4. Success!
      Alert.alert('Success', 'Ticket purchased!')
      router.push('/ticket/[id]', { id: ticketId })

    } catch (error) {
      Alert.alert('Error', error.message)
    }
  }
}
```

## 📺 Chromecast Integration

```typescript
import GoogleCast, { CastButton } from 'react-native-google-cast'

// Setup (in App.tsx)
useEffect(() => {
  GoogleCast.showIntroductoryOverlay()
}, [])

// In LiveScreen
const castVideo = async () => {
  try {
    await GoogleCast.castMedia({
      mediaUrl: event.stream_url,
      imageUrl: event.cover_image_url,
      title: event.title,
      subtitle: event.artist.stage_name,
    })
  } catch (error) {
    console.error('Cast error:', error)
  }
}

// UI
<View>
  <CastButton style={{ width: 40, height: 40, tintColor: 'white' }} />
</View>
```

## 🔄 Real-time Chat

```typescript
import { api } from '@/lib/api-client'

const ChatComponent = ({ eventId }) => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    // Subscribe to new messages
    const channel = api.chat.subscribeToEvent(eventId, (payload) => {
      setMessages(prev => [...prev, payload.new])
    })

    return () => {
      channel.unsubscribe()
    }
  }, [eventId])

  const sendMessage = async (text) => {
    await api.chat.sendMessage(eventId, text)
  }
}
```

## 🚀 Build & Deploy

### Development
```bash
npm start
# Scan QR code avec Expo Go app
```

### iOS
```bash
npx expo prebuild
cd ios
pod install
cd ..
npx expo run:ios
```

### Android
```bash
npx expo prebuild
npx expo run:android
```

### Production Build
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 📝 Notes Importantes

1. **Toujours utiliser les types TypeScript** du fichier `types/database.ts`
2. **Toutes les requêtes API** passent par `lib/api-client.ts`
3. **Gestion d'erreurs** systématique avec try/catch
4. **Loading states** pour toutes les opérations async
5. **Optimistic updates** quand possible (likes, follows, etc.)

## 🐛 Debug

### Supabase
```typescript
import { supabase } from '@/lib/api-client'

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase.from('events').select('*').limit(1)
  console.log('Supabase test:', { data, error })
}
```

### Logs
```bash
# React Native logs
npx react-native log-ios
npx react-native log-android

# Expo logs
npx expo start --dev-client
```

## 📞 Support

- **Backend API:** Demander à Claude (moi!)
- **Types TypeScript:** Voir `types/database.ts`
- **API Methods:** Voir `lib/api-client.ts`

## ✅ Checklist Avant de Commencer

- [ ] Node.js 18+ installé
- [ ] Expo CLI installé (`npm install -g expo-cli`)
- [ ] Xcode (pour iOS) ou Android Studio (pour Android)
- [ ] Compte Apple Developer (pour tester sur vraie device iOS)
- [ ] Fichiers copiés: `lib/api-client.ts`, `types/database.ts`
- [ ] Variables d'environnement configurées
- [ ] Supabase credentials obtenus

**Let's build! 🚀🐝**
