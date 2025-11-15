# VyBzzZ Mobile App - Development Guide

**Last Updated**: November 15, 2025
**Launch Target**: December 31, 2025 (David Guetta Concert)
**Current Status**: 20% complete
**Days Remaining**: 46 days

---

## Overview

This guide provides a roadmap to complete the VyBzzZ mobile app (React Native with Expo) before the December 31, 2025 launch.

**Technology Stack**:
- React Native
- Expo SDK
- TypeScript
- Supabase Client
- Stripe React Native SDK
- Expo Router (navigation)

---

## Critical Features for MVP Launch

### ✅ Must-Have (Blocking for Launch)

1. **Event Discovery** - Browse upcoming concerts
2. **Event Detail** - View event information
3. **Live Streaming** - Watch concerts (YouTube iframe or custom player)
4. **Ticket Purchase** - Buy tickets via Stripe
5. **User Authentication** - Sign up / Sign in with Supabase Auth
6. **My Tickets** - View purchased tickets

### 🟡 Should-Have (High Priority)

7. **Push Notifications** - Event reminders, ticket confirmations
8. **User Profile** - Edit profile, view stats
9. **Tips/Pourboires** - Send tips to artists during stream
10. **Chat** - Real-time chat during events

### ⚪ Nice-to-Have (Can be deferred to post-launch)

11. **Shorts/TikTok Videos** - AI-generated highlights
12. **Gamification** - Miles, badges, leaderboards
13. **Social Sharing** - Share events on social media
14. **Offline Mode** - View tickets offline
15. **Multi-language Support** - 6 languages

---

## Project Setup

### 1. Initialize Expo Project

```bash
# Create new Expo project with TypeScript
npx create-expo-app vybzzz-mobile --template expo-template-blank-typescript

cd vybzzz-mobile

# Install dependencies
npm install @supabase/supabase-js
npm install @stripe/stripe-react-native
npm install expo-router
npm install react-native-webview  # For YouTube player
npm install expo-notifications      # For push notifications
npm install expo-av                 # For video playback (alternative to YouTube)
npm install react-native-reanimated # For animations
npm install react-native-gesture-handler
npm install date-fns                # Date formatting
```

### 2. Configure Supabase

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 3. Configure Stripe

```typescript
// app/_layout.tsx
import { StripeProvider } from '@stripe/stripe-react-native';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      {/* Your app */}
    </StripeProvider>
  );
}
```

### 4. Environment Variables

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://localhost:3000  # Dev
# EXPO_PUBLIC_API_URL=https://vybzzz.com   # Prod
```

---

## Screen Implementations

### Priority 1: Authentication (Week 1)

**File**: `app/(auth)/sign-in.tsx`

```typescript
import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.replace('/(tabs)');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion à VyBzzZ</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loading ? 'Connexion...' : 'Se connecter'}
        onPress={handleSignIn}
        disabled={loading}
      />

      <Button
        title="Créer un compte"
        onPress={() => router.push('/(auth)/sign-up')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
```

**File**: `app/(auth)/sign-up.tsx` - Similar structure with `signUp()` method

---

### Priority 2: Event Discovery (Week 1-2)

**File**: `app/(tabs)/index.tsx` (Home screen)

```typescript
import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  ticket_price: number;
  image_url: string;
  artist_name: string;
}

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:artist_id (
          display_name
        )
      `)
      .eq('status', 'published')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (data) {
      setEvents(data as Event[]);
    }

    setLoading(false);
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/events/${item.id}`)}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventArtist}>{item.artist_name}</Text>
        <Text style={styles.eventDate}>
          {format(new Date(item.event_date), 'dd/MM/yyyy à HH:mm')}
        </Text>
        <Text style={styles.eventPrice}>{item.ticket_price}€</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Concerts à venir</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchEvents}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
  },
  eventCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 10,
  },
});
```

---

### Priority 3: Event Detail + Ticket Purchase (Week 2)

**File**: `app/events/[id].tsx`

```typescript
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useStripe } from '@stripe/stripe-react-native';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    setEvent(data);
    setLoading(false);
  };

  const handlePurchaseTicket = async () => {
    setLoading(true);

    try {
      // 1. Create payment intent on backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/tickets/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: id,
        }),
      });

      const { clientSecret, error } = await response.json();

      if (error) {
        Alert.alert('Erreur', error);
        return;
      }

      // 2. Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'VyBzzZ',
      });

      if (initError) {
        Alert.alert('Erreur', initError.message);
        return;
      }

      // 3. Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert('Paiement annulé', paymentError.message);
      } else {
        Alert.alert('Succès', 'Votre ticket a été acheté avec succès!');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !event) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: event.image_url }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>
        <Text style={styles.price}>{event.ticket_price}€</Text>

        <Button
          title={loading ? 'Chargement...' : 'Acheter un ticket'}
          onPress={handlePurchaseTicket}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 20,
  },
});
```

---

### Priority 4: Live Streaming (Week 2-3)

**File**: `app/events/[id]/live.tsx`

```typescript
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

export default function LiveStreamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // YouTube embed URL
  const youtubeUrl = `https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: youtubeUrl }}
        style={styles.webview}
        allowsFullscreenVideo
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
});
```

**Alternative: Custom Video Player**

```typescript
import { Video } from 'expo-av';

export default function LiveStreamScreen() {
  return (
    <View style={styles.container}>
      <Video
        source={{ uri: 'https://your-stream-url.m3u8' }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />
    </View>
  );
}
```

---

### Priority 5: My Tickets (Week 3)

**File**: `app/(tabs)/tickets.tsx`

```typescript
import { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import QRCode from 'react-native-qrcode-svg';

interface Ticket {
  id: string;
  event_id: string;
  purchase_date: string;
  events: {
    title: string;
    event_date: string;
  };
}

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        events (
          title,
          event_date
        )
      `)
      .eq('user_id', user.id)
      .order('purchase_date', { ascending: false });

    if (data) {
      setTickets(data as Ticket[]);
    }

    setLoading(false);
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <View style={styles.ticketCard}>
      <Text style={styles.eventTitle}>{item.events.title}</Text>
      <Text style={styles.eventDate}>
        {new Date(item.events.event_date).toLocaleDateString()}
      </Text>

      <View style={styles.qrContainer}>
        <QRCode value={item.id} size={150} />
      </View>

      <Text style={styles.ticketId}>Ticket: {item.id.slice(0, 8)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Vous n'avez pas encore de tickets</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mes Tickets</Text>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
  },
  ticketCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 20,
  },
  ticketId: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
```

---

### Priority 6: Push Notifications (Week 3)

**Setup**:

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

export async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to Supabase
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', user.id);
  }

  return token;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

---

## Week-by-Week Development Plan

### Week 1 (Nov 16-22): Foundation
- [ ] Initialize Expo project
- [ ] Configure Supabase and Stripe
- [ ] Implement authentication (Sign In, Sign Up)
- [ ] Create tab navigation structure
- [ ] Test on iOS and Android emulators

### Week 2 (Nov 23-29): Core Features
- [ ] Event discovery screen (list + search)
- [ ] Event detail screen
- [ ] Ticket purchase flow (Stripe integration)
- [ ] My Tickets screen with QR codes
- [ ] Test purchases end-to-end

### Week 3 (Nov 30-Dec 6): Streaming + Notifications
- [ ] Live streaming screen (YouTube player)
- [ ] Push notification setup
- [ ] Event reminders (1 hour before)
- [ ] User profile screen
- [ ] Test notifications

### Week 4 (Dec 7-13): Polish + Testing
- [ ] Chat during live events (optional)
- [ ] Tips/Pourboires feature (optional)
- [ ] UI/UX polish
- [ ] Performance optimization
- [ ] Bug fixes

### Week 5 (Dec 14-20): Beta Testing
- [ ] TestFlight submission (iOS)
- [ ] Google Play Beta submission (Android)
- [ ] 10+ beta testers
- [ ] Collect feedback
- [ ] Fix critical bugs

### Week 6 (Dec 21-27): App Store Submission
- [ ] Prepare app metadata (screenshots, description)
- [ ] Submit to App Store (7-14 day review)
- [ ] Submit to Google Play (2-3 day review)
- [ ] Final testing

### Week 7 (Dec 28-31): Launch Preparation
- [ ] App Store approval monitoring
- [ ] Final smoke tests
- [ ] **Launch: December 31, 2025**

---

## Testing Checklist

### Unit Tests
- [ ] Authentication flow
- [ ] Event fetching
- [ ] Ticket purchase
- [ ] Payment error handling

### Integration Tests
- [ ] Full user journey (sign up → browse → purchase → view ticket)
- [ ] Payment flow with real Stripe keys
- [ ] Push notifications delivery

### Device Testing
- [ ] iOS (iPhone 12, 13, 14, 15)
- [ ] Android (Samsung S21+, Google Pixel 6+)
- [ ] Tablets (iPad, Android tablet)

### Performance
- [ ] App loads in <3 seconds
- [ ] Smooth scrolling (60 FPS)
- [ ] Video streaming without buffering
- [ ] No memory leaks

---

## Deployment

### iOS (App Store)

1. **Create App Store listing**
   - Bundle ID: `com.vybzzz.mobile`
   - App name: VyBzzZ
   - Category: Entertainment
   - Screenshots (required): 6.5" iPhone, 5.5" iPhone, 12.9" iPad

2. **Build for production**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit to TestFlight**
   ```bash
   eas submit --platform ios
   ```

4. **Submit for App Store review** (via App Store Connect)

### Android (Google Play)

1. **Create Google Play listing**
   - Package name: `com.vybzzz.mobile`
   - Screenshots: Phone, 7" tablet, 10" tablet

2. **Build for production**
   ```bash
   eas build --platform android --profile production
   ```

3. **Submit to Google Play**
   ```bash
   eas submit --platform android
   ```

---

## Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase React Native](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- [Stripe React Native](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)

### Tools
- **Expo Go** - Test on physical devices
- **Expo Application Services (EAS)** - Build and submit apps
- **React Native Debugger** - Debugging tool

### Community
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://www.reactnative.dev/community/overview)

---

## Troubleshooting

### Common Issues

**Issue**: Stripe payment sheet not working
- **Solution**: Ensure `@stripe/stripe-react-native` is properly installed
- Run: `npx expo install @stripe/stripe-react-native`

**Issue**: Push notifications not received
- **Solution**: Check Expo push token is saved to Supabase
- Test with Expo Push Notification Tool

**Issue**: Video player crashes
- **Solution**: Use WebView for YouTube or expo-av for custom player
- Check video URL format (must be HTTPS)

**Issue**: Build fails on EAS
- **Solution**: Check `eas.json` configuration
- Verify all environment variables are set

---

**Last Updated**: November 15, 2025
**Next Review**: Weekly until launch

🚀 Ready to build the VyBzzZ mobile app!
