# 🎥 Architecture Streaming VyBzzZ - Système Hybride

**Date**: 2025-11-16
**Version**: 1.0
**Objectif**: Maximiser la capacité de streaming gratuite et minimiser les coûts

---

## 📊 État Actuel

### Plateformes Configurées

| Plateforme | Statut | Implémentation | Coût | Capacité |
|------------|--------|----------------|------|----------|
| **YouTube Live** | ✅ Actif | Default pour David Guetta | Gratuit | Illimité (avec délai ~20-30s) |
| **AWS IVS** | ✅ Implémenté | `lib/aws-ivs.ts` complet | ~$1/heure/stream | Faible latence (<3s) |
| **100ms** | ❌ Déclaré | Mentionné dans constants | Variable | ~10,000 min gratuits/mois |
| **Agora** | ❌ À intégrer | Objectif principal | ~$0.99/1000 min | 10,000 min gratuits/mois |
| **StreamCore** | ❌ À créer | Alternative gratuite | Gratuit | À optimiser |

### Configuration Actuelle

**Fichier**: `constants/BusinessRules.ts`
```typescript
streamPlatforms: ['youtube', 'aws_ivs', '100ms']
defaultStreamPlatform: 'youtube'
```

**Base de données**: `events` table
```sql
stream_key TEXT,      -- AWS IVS stream key
stream_url TEXT,      -- Playback URL
status TEXT CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'cancelled'))
```

---

## 🎯 Objectifs du Système Hybride

1. **Maximiser le streaming gratuit** pour petits événements et tests
2. **Minimiser les coûts** en routant intelligemment selon l'événement
3. **Garantir la qualité** pour événements premium (David Guetta, etc.)
4. **Scalabilité** pour supporter 10,000+ spectateurs simultanés

---

## 🏗️ Architecture Proposée

### Schéma du Système

```
┌─────────────────────────────────────────────────────────────┐
│                    VyBzzZ Streaming Router                  │
│                   (Logic de Sélection)                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   YouTube    │    │    Agora     │    │  StreamCore  │
│   (Gratuit)  │    │  (Premium)   │    │  (Gratuit)   │
└──────────────┘    └──────────────┘    └──────────────┘
  - Délai 20-30s      - Latence <500ms    - Latence 2-3s
  - Illimité          - 10k min/mois       - Illimité
  - Backup            - Haute qualité      - WebRTC P2P
```

### Logique de Routage

**Matrice de Décision**:

| Critères | YouTube | Agora | StreamCore |
|----------|---------|-------|------------|
| **Spectateurs attendus** | >5,000 | 500-5,000 | <500 |
| **Tier artiste** | - | Elite/Pro | Starter |
| **Latence requise** | >10s OK | <1s | 2-5s OK |
| **Budget événement** | Gratuit | Premium | Gratuit |
| **Qualité vidéo** | 1080p+ | 720p-1080p | 480p-720p |

**Algorithme de Sélection**:
```typescript
function selectStreamingPlatform(event: Event): StreamPlatform {
  // 1. Événements premium → Agora
  if (event.expected_attendees > 500 && event.artist_tier in ['pro', 'elite']) {
    return 'agora'
  }

  // 2. Gros événements publics → YouTube
  if (event.expected_attendees > 5000) {
    return 'youtube'
  }

  // 3. Tests et petits événements → StreamCore
  if (event.expected_attendees < 500) {
    return 'streamcore'
  }

  // 4. Fallback → YouTube (toujours disponible)
  return 'youtube'
}
```

---

## 🔴 Agora Integration

### Pourquoi Agora ?

✅ **Avantages**:
- Faible latence (~500ms)
- 10,000 minutes gratuites/mois
- SDK mature pour Web + Mobile
- Support RTMP et WebRTC
- Enregistrement cloud inclus
- Analytics en temps réel

❌ **Inconvénients**:
- Coût après quota gratuit (~$0.99/1000 min)
- Configuration complexe
- Nécessite token server

### Plan d'Intégration

#### Phase 1: Setup SDK (2h)

**1. Installation**:
```bash
# Frontend
npm install agora-rtc-sdk-ng

# Backend
npm install agora-access-token

# Mobile
npm install react-native-agora
```

**2. Variables d'environnement** (`.env.example`):
```bash
# Agora Configuration
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate
```

**3. Token Server** (`/lib/agora.ts`):
```typescript
import { RtcTokenBuilder, RtcRole } from 'agora-access-token'

export function generateAgoraToken(
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber'
): string {
  const appId = process.env.AGORA_APP_ID!
  const certificate = process.env.AGORA_APP_CERTIFICATE!
  const expirationTimeInSeconds = 3600 // 1 hour

  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

  const tokenRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    certificate,
    channelName,
    uid,
    tokenRole,
    privilegeExpiredTs
  )
}
```

#### Phase 2: Frontend Integration (3h)

**Composant VideoPlayer** (`/components/events/VideoPlayerAgora.tsx`):
```typescript
'use client'

import { useEffect, useRef } from 'react'
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng'

interface AgoraPlayerProps {
  channelName: string
  token: string
  uid: number
  isPublisher: boolean // true pour artiste, false pour spectateur
}

export default function AgoraVideoPlayer({ channelName, token, uid, isPublisher }: AgoraPlayerProps) {
  const clientRef = useRef<IAgoraRTCClient | null>(null)
  const localVideoTrack = useRef<ICameraVideoTrack | null>(null)
  const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null)

  useEffect(() => {
    const initAgora = async () => {
      // 1. Create client
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
      clientRef.current = client

      // 2. Join channel
      await client.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        channelName,
        token,
        uid
      )

      if (isPublisher) {
        // Artist: publish camera + mic
        localVideoTrack.current = await AgoraRTC.createCameraVideoTrack()
        localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack()

        await client.publish([localVideoTrack.current, localAudioTrack.current])

        // Play local video
        localVideoTrack.current.play('local-video')
      } else {
        // Spectator: subscribe to remote tracks
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType)

          if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack
            remoteVideoTrack?.play('remote-video')
          }

          if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack
            remoteAudioTrack?.play()
          }
        })
      }
    }

    initAgora()

    return () => {
      // Cleanup
      localVideoTrack.current?.close()
      localAudioTrack.current?.close()
      clientRef.current?.leave()
    }
  }, [channelName, token, uid, isPublisher])

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      {isPublisher ? (
        <div id="local-video" className="w-full h-full" />
      ) : (
        <div id="remote-video" className="w-full h-full" />
      )}
    </div>
  )
}
```

#### Phase 3: Backend API (2h)

**Route Token** (`/app/api/streaming/agora-token/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateAgoraToken } from '@/lib/agora'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId, role } = await request.json()

    // Verify user has access to event
    const { data: event } = await supabase
      .from('events')
      .select('*, artist:profiles!artist_id(*)')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Artist = publisher, others = subscriber
    const isPublisher = user.id === event.artist_id
    const tokenRole = isPublisher ? 'publisher' : 'subscriber'

    // Generate token
    const token = generateAgoraToken(
      eventId, // Use eventId as channelName
      parseInt(user.id.replace(/-/g, '').substring(0, 8), 16), // UID from user ID
      tokenRole
    )

    return NextResponse.json({
      token,
      channelName: eventId,
      uid: parseInt(user.id.replace(/-/g, '').substring(0, 8), 16),
      appId: process.env.NEXT_PUBLIC_AGORA_APP_ID,
      role: tokenRole
    })
  } catch (error: any) {
    console.error('Agora token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
```

#### Phase 4: Mobile Integration (3h)

**Installation**:
```bash
cd mobile
npx expo install react-native-agora
```

**Composant Mobile** (`/mobile/components/AgoraStream.tsx`):
```typescript
import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import {
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora'

interface AgoraStreamProps {
  appId: string
  channelName: string
  token: string
  uid: number
  isPublisher: boolean
}

export default function AgoraStream({ appId, channelName, token, uid, isPublisher }: AgoraStreamProps) {
  const [engine, setEngine] = useState<IRtcEngine | null>(null)

  useEffect(() => {
    const init = async () => {
      // Create engine
      const agoraEngine = createAgoraRtcEngine()
      agoraEngine.initialize({ appId })

      // Enable video
      agoraEngine.enableVideo()

      // Set channel profile
      agoraEngine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting)

      // Set client role
      agoraEngine.setClientRole(
        isPublisher ? ClientRoleType.ClientRoleBroadcaster : ClientRoleType.ClientRoleAudience
      )

      // Join channel
      await agoraEngine.joinChannel(token, channelName, uid, {})

      setEngine(agoraEngine)
    }

    init()

    return () => {
      engine?.leaveChannel()
      engine?.release()
    }
  }, [appId, channelName, token, uid, isPublisher])

  return (
    <View style={styles.container}>
      {/* Agora handles video rendering internally */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
})
```

### Coûts Estimés Agora

**Quota Gratuit**: 10,000 minutes/mois

**Scénario 1** - Utilisation Modérée:
- 20 événements/mois × 2h × 100 spectateurs = 4,000 min
- **Coût**: Gratuit ✅

**Scénario 2** - Utilisation Intensive:
- 50 événements/mois × 3h × 200 spectateurs = 30,000 min
- Dépassement: 20,000 min × $0.99/1000 = **$19.80/mois**

**Scénario 3** - Événement Premium (David Guetta):
- 1 événement × 4h × 10,000 spectateurs = 40,000 min
- **Coût**: $39.60 pour cet événement unique
- ⚠️ **Solution**: Utiliser YouTube pour gros événements publics

---

## 🟢 StreamCore - Alternative Gratuite

### Concept

**StreamCore** est une solution WebRTC P2P optimisée pour:
- Petits événements (<500 spectateurs)
- Tests d'artistes
- Streaming fan-to-fan
- Réduire coûts infrastructure

### Architecture StreamCore

```
┌─────────────┐         WebRTC          ┌─────────────┐
│   Artiste   │◄─────────────────────────►   Fan 1    │
│ (Publisher) │                          │ (Peer)      │
└─────────────┘                          └─────────────┘
       │                                        ▲
       │                                        │
       │         WebRTC Mesh                    │
       │                                        │
       ▼                                        ▼
┌─────────────┐                          ┌─────────────┐
│   Fan 2     │◄──────────────────────────►   Fan 3    │
│ (Peer)      │                          │ (Peer)      │
└─────────────┘                          └─────────────┘
```

**Technologie**:
- **Simple-Peer** (gratuit, open-source)
- **PeerJS** (serveur signaling gratuit)
- **MediaRecorder API** (enregistrement local)
- **Supabase Realtime** (signaling)

### Implémentation StreamCore

#### Installation

```bash
npm install simple-peer peerjs
```

#### Serveur Signaling (Supabase Realtime)

**Table**: `webrtc_signals`
```sql
CREATE TABLE webrtc_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  signal_data JSONB,
  signal_type TEXT CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for real-time queries
CREATE INDEX idx_webrtc_signals_event ON webrtc_signals(event_id, created_at DESC);
CREATE INDEX idx_webrtc_signals_to_user ON webrtc_signals(to_user_id, created_at DESC);

-- RLS Policies
ALTER TABLE webrtc_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own signals"
  ON webrtc_signals FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can read signals addressed to them"
  ON webrtc_signals FOR SELECT
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);
```

#### Client StreamCore (`/lib/streamcore.ts`)

```typescript
import SimplePeer from 'simple-peer'
import { createClient } from '@/lib/supabase/client'

export class StreamCore {
  private peer: SimplePeer.Instance | null = null
  private supabase = createClient()
  private eventId: string
  private userId: string
  private isPublisher: boolean

  constructor(eventId: string, userId: string, isPublisher: boolean) {
    this.eventId = eventId
    this.userId = userId
    this.isPublisher = isPublisher
  }

  async init(videoElement: HTMLVideoElement) {
    try {
      // 1. Get user media (for publisher)
      let stream: MediaStream | undefined

      if (this.isPublisher) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        })

        // Show local preview
        videoElement.srcObject = stream
      }

      // 2. Create peer connection
      this.peer = new SimplePeer({
        initiator: this.isPublisher,
        stream: stream,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ]
        }
      })

      // 3. Handle signals
      this.peer.on('signal', async (signal) => {
        // Send signal via Supabase
        await this.supabase
          .from('webrtc_signals')
          .insert({
            event_id: this.eventId,
            from_user_id: this.userId,
            to_user_id: this.isPublisher ? 'broadcast' : 'artist',
            signal_data: signal,
            signal_type: signal.type === 'offer' ? 'offer' :
                        signal.type === 'answer' ? 'answer' : 'ice-candidate'
          })
      })

      // 4. Handle incoming stream
      this.peer.on('stream', (remoteStream) => {
        videoElement.srcObject = remoteStream
      })

      // 5. Subscribe to signals
      const channel = this.supabase
        .channel(`streamcore:${this.eventId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'webrtc_signals',
            filter: `to_user_id=eq.${this.userId}`
          },
          (payload) => {
            if (payload.new.signal_data) {
              this.peer?.signal(payload.new.signal_data)
            }
          }
        )
        .subscribe()

      // 6. Error handling
      this.peer.on('error', (err) => {
        console.error('StreamCore error:', err)
      })

    } catch (error) {
      console.error('Failed to initialize StreamCore:', error)
      throw error
    }
  }

  destroy() {
    this.peer?.destroy()
    this.supabase.removeAllChannels()
  }
}
```

#### Composant React StreamCore

**File**: `/components/events/VideoPlayerStreamCore.tsx`
```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { StreamCore } from '@/lib/streamcore'

interface StreamCorePlayerProps {
  eventId: string
  userId: string
  isPublisher: boolean
}

export default function VideoPlayerStreamCore({ eventId, userId, isPublisher }: StreamCorePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamCoreRef = useRef<StreamCore | null>(null)
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  useEffect(() => {
    if (!videoRef.current) return

    const initStream = async () => {
      try {
        const streamCore = new StreamCore(eventId, userId, isPublisher)
        streamCoreRef.current = streamCore

        await streamCore.init(videoRef.current!)
        setStatus('connected')
      } catch (error) {
        console.error('StreamCore init failed:', error)
        setStatus('error')
      }
    }

    initStream()

    return () => {
      streamCoreRef.current?.destroy()
    }
  }, [eventId, userId, isPublisher])

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      {status === 'connecting' && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>Erreur de connexion. Utilisez YouTube comme fallback.</p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls
        className="w-full h-full"
      />

      {isPublisher && (
        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
          StreamCore (P2P)
        </div>
      )}
    </div>
  )
}
```

### Limites StreamCore

⚠️ **Contraintes P2P**:
- **Max 10-15 spectateurs simultanés** (limitation WebRTC mesh)
- **Bande passante** dépend de l'upload de l'artiste
- **Qualité variable** selon connexions
- **Pas d'enregistrement cloud** (local seulement)

✅ **Optimisations**:
- Limiter à 480p/720p pour économiser bande passante
- Implémenter SFU (Selective Forwarding Unit) pour >15 spectateurs
- Utiliser TURN server pour NAT traversal
- Fallback automatique vers YouTube si >20 spectateurs rejoignent

---

## 🔀 Système Hybride - Router Intelligent

### Implémentation du Router

**File**: `/lib/streaming-router.ts`

```typescript
import { Database } from '@/types/database-complete'

type Event = Database['public']['Tables']['events']['Row']
type StreamPlatform = 'youtube' | 'agora' | 'streamcore' | 'aws_ivs'

interface StreamingDecision {
  platform: StreamPlatform
  reason: string
  estimatedCost: number
  maxCapacity: number
}

export class StreamingRouter {
  /**
   * Sélectionne la meilleure plateforme de streaming pour un événement
   */
  static selectPlatform(
    event: Event,
    artistTier: 'starter' | 'pro' | 'elite',
    currentLoad: {
      agoraMinutesUsed: number
      streamCoreActiveStreams: number
    }
  ): StreamingDecision {
    const expectedAttendees = event.max_attendees || 100

    // 1. MEGA ÉVÉNEMENT (>5000) → YouTube (gratuit + illimité)
    if (expectedAttendees > 5000) {
      return {
        platform: 'youtube',
        reason: 'Large public event - YouTube provides unlimited free capacity',
        estimatedCost: 0,
        maxCapacity: Infinity
      }
    }

    // 2. ÉVÉNEMENT PREMIUM (Elite tier, >500 attendees) → Agora
    if (artistTier === 'elite' && expectedAttendees > 500) {
      const durationHours = 3 // Estimation
      const minutes = expectedAttendees * durationHours * 60
      const cost = Math.max(0, (minutes - 10000) / 1000 * 0.99)

      return {
        platform: 'agora',
        reason: 'Premium event requiring low latency and high quality',
        estimatedCost: cost,
        maxCapacity: 10000
      }
    }

    // 3. ÉVÉNEMENT MOYEN (Pro tier, 200-500) → Agora si quota disponible
    if (artistTier === 'pro' && expectedAttendees >= 200 && expectedAttendees <= 500) {
      const durationHours = 2
      const minutes = expectedAttendees * durationHours * 60

      if (currentLoad.agoraMinutesUsed + minutes < 10000) {
        return {
          platform: 'agora',
          reason: 'Medium event within free Agora quota',
          estimatedCost: 0,
          maxCapacity: 500
        }
      } else {
        // Quota dépassé → fallback YouTube
        return {
          platform: 'youtube',
          reason: 'Agora quota exceeded - fallback to YouTube',
          estimatedCost: 0,
          maxCapacity: Infinity
        }
      }
    }

    // 4. PETIT ÉVÉNEMENT (<200) → StreamCore
    if (expectedAttendees < 200 && currentLoad.streamCoreActiveStreams < 50) {
      return {
        platform: 'streamcore',
        reason: 'Small event - P2P StreamCore is cost-effective',
        estimatedCost: 0,
        maxCapacity: 200
      }
    }

    // 5. DEFAULT FALLBACK → YouTube (toujours disponible)
    return {
      platform: 'youtube',
      reason: 'Default fallback - YouTube is always available',
      estimatedCost: 0,
      maxCapacity: Infinity
    }
  }

  /**
   * Vérifie si un upgrade de plateforme est nécessaire en cours de stream
   */
  static shouldUpgrade(
    currentPlatform: StreamPlatform,
    currentAttendees: number,
    maxCapacity: number
  ): { shouldUpgrade: boolean; newPlatform?: StreamPlatform; reason?: string } {
    // StreamCore atteint sa limite → upgrade vers Agora ou YouTube
    if (currentPlatform === 'streamcore' && currentAttendees > 150) {
      return {
        shouldUpgrade: true,
        newPlatform: 'agora',
        reason: 'StreamCore capacity exceeded - upgrading to Agora for better scalability'
      }
    }

    // Agora devient trop coûteux → downgrade vers YouTube
    if (currentPlatform === 'agora' && currentAttendees > 5000) {
      return {
        shouldUpgrade: true,
        newPlatform: 'youtube',
        reason: 'High viewer count - YouTube is more cost-effective'
      }
    }

    return { shouldUpgrade: false }
  }
}
```

### API Route de Sélection

**File**: `/app/api/streaming/select-platform/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { StreamingRouter } from '@/lib/streaming-router'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await request.json()

    // Get event details
    const { data: event } = await supabase
      .from('events')
      .select(`
        *,
        artist:profiles!artist_id(user_type, stripe_subscription_tier)
      `)
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get current streaming load
    // TODO: Implement quota tracking
    const currentLoad = {
      agoraMinutesUsed: 0, // Get from tracking table
      streamCoreActiveStreams: 0 // Count active streams
    }

    // Select platform
    const decision = StreamingRouter.selectPlatform(
      event,
      event.artist.stripe_subscription_tier || 'starter',
      currentLoad
    )

    // Update event with selected platform
    await supabase
      .from('events')
      .update({
        stream_platform: decision.platform,
        metadata: {
          ...event.metadata,
          streaming_decision: decision
        }
      })
      .eq('id', eventId)

    return NextResponse.json(decision)
  } catch (error: any) {
    console.error('Platform selection error:', error)
    return NextResponse.json(
      { error: 'Failed to select platform' },
      { status: 500 }
    )
  }
}
```

---

## 📊 Comparaison des Plateformes

| Critère | YouTube | Agora | StreamCore | AWS IVS |
|---------|---------|-------|-----------|---------|
| **Coût/mois** | Gratuit | $0-20 | Gratuit | $30-100 |
| **Latence** | 20-30s | <500ms | 2-3s | <3s |
| **Max spectateurs** | Illimité | 10,000 | 200 | 10,000 |
| **Qualité vidéo** | 1080p+ | 720p-1080p | 480p-720p | 1080p |
| **Enregistrement** | Auto | Cloud | Local | S3 |
| **Setup complexité** | Faible | Moyenne | Moyenne | Élevée |
| **Mobile SDK** | Natif | ✅ | ✅ | ✅ |
| **Analytics** | ✅ | ✅ | ❌ | ✅ |

---

## 💰 Estimation Coûts Mensuels

### Scénario Réaliste (Launch+3 mois)

**Configuration**:
- 100 événements/mois
- 70% petits (<200 spectateurs) → StreamCore gratuit
- 25% moyens (200-500) → Agora quota gratuit
- 5% grands (>500) → YouTube gratuit

**Coûts**:
```
StreamCore:  70 événements × $0 = $0
Agora:       25 événements × 9,000 min = 225k min
             (10k gratuits + 215k payants)
             215k/1000 × $0.99 = $212.85
YouTube:     5 événements × $0 = $0

TOTAL: ~$213/mois
```

### Optimisation Proposée

**Avec Système Hybride**:
- Utiliser Agora seulement pour Elite tier
- Starter/Pro → StreamCore puis fallback YouTube si >150 spectateurs
- Grands événements publics → directement YouTube

**Coûts Optimisés**:
```
StreamCore:  85 événements × $0 = $0
Agora:       10 événements × 5,000 min = 50k min (under free quota)
YouTube:     5 événements × $0 = $0

TOTAL: $0/mois ✅
```

---

## 🚀 Plan de Déploiement

### Phase 1: Infrastructure (Semaine 1)

**Jour 1-2**: Setup Agora
- [ ] Créer compte Agora
- [ ] Obtenir App ID et Certificate
- [ ] Ajouter variables d'environnement
- [ ] Implémenter `/lib/agora.ts`
- [ ] Créer route `/api/streaming/agora-token`

**Jour 3-4**: Développer StreamCore
- [ ] Créer table `webrtc_signals`
- [ ] Implémenter `/lib/streamcore.ts`
- [ ] Créer composant `VideoPlayerStreamCore.tsx`
- [ ] Tester avec 2-3 spectateurs

**Jour 5-7**: Système Hybride
- [ ] Implémenter `/lib/streaming-router.ts`
- [ ] Créer route `/api/streaming/select-platform`
- [ ] Ajouter champ `stream_platform` à table events
- [ ] Intégrer router dans création d'événement

### Phase 2: Frontend Integration (Semaine 2)

**Jour 8-10**: Composants Web
- [ ] Créer `VideoPlayerAgora.tsx`
- [ ] Modifier `VideoPlayer.tsx` pour supporter multi-plateforme
- [ ] Ajouter sélecteur manuel de plateforme (admin)
- [ ] Implémenter fallback automatique

**Jour 11-13**: Mobile App
- [ ] Installer `react-native-agora`
- [ ] Créer `AgoraStream.tsx` mobile
- [ ] Créer `StreamCoreNative.tsx` (WebRTC mobile)
- [ ] Tester sur iOS + Android

**Jour 14**: Tests & Documentation
- [ ] Tester chaque plateforme
- [ ] Documenter API routes
- [ ] Créer guide pour artistes
- [ ] Mettre à jour `CLAUDE.md`

### Phase 3: Monitoring & Optimisation (Semaine 3)

**Jour 15-16**: Tracking
- [ ] Créer table `streaming_usage`
- [ ] Logger minutes Agora consommées
- [ ] Dashboard analytics temps réel
- [ ] Alertes quota Agora

**Jour 17-18**: Optimisations
- [ ] Implémenter adaptive bitrate
- [ ] Optimiser qualité StreamCore
- [ ] Réduire latence Agora
- [ ] Compression vidéo

**Jour 19-21**: Production
- [ ] Deploy sur Vercel/Railway
- [ ] Tests charge (simulate 1000 spectateurs)
- [ ] Backup strategy
- [ ] Monitoring Sentry

---

## 📈 Métriques de Succès

### KPIs à Tracker

1. **Coût par événement**
   - Target: <$1/événement en moyenne
   - Mesure: Total streaming costs / nombre événements

2. **Qualité de streaming**
   - Target: <2% d'erreurs de connexion
   - Target: >95% uptime

3. **Utilisation quota Agora**
   - Target: rester sous 10k min/mois gratuits
   - Alerte si >80% utilisé

4. **Satisfaction artistes**
   - Survey après chaque événement
   - Target: >4/5 étoiles

---

## 🔧 Configuration Base de Données

### Modifications `events` table

```sql
-- Ajouter colonnes streaming
ALTER TABLE events
ADD COLUMN stream_platform TEXT CHECK (stream_platform IN ('youtube', 'agora', 'streamcore', 'aws_ivs')) DEFAULT 'youtube',
ADD COLUMN agora_channel_name TEXT,
ADD COLUMN agora_token TEXT,
ADD COLUMN stream_quality TEXT CHECK (stream_quality IN ('480p', '720p', '1080p')) DEFAULT '720p',
ADD COLUMN current_attendees INTEGER DEFAULT 0;

-- Index pour queries rapides
CREATE INDEX idx_events_stream_platform ON events(stream_platform);
CREATE INDEX idx_events_is_live ON events(is_live) WHERE is_live = true;
```

### Nouvelle table `streaming_usage`

```sql
CREATE TABLE streaming_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  peak_attendees INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour analytics
CREATE INDEX idx_streaming_usage_event ON streaming_usage(event_id);
CREATE INDEX idx_streaming_usage_platform ON streaming_usage(platform, created_at DESC);
CREATE INDEX idx_streaming_usage_dates ON streaming_usage(started_at, ended_at);

-- RLS
ALTER TABLE streaming_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists can view their streaming usage"
  ON streaming_usage FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM events WHERE artist_id = auth.uid()
    )
  );
```

---

## 📝 Documentation Artiste

### Guide de Sélection Plateforme

**Pour les artistes**:

| Mon événement | Plateforme recommandée | Pourquoi |
|---------------|------------------------|----------|
| **Test/Répétition** (<50 personnes) | StreamCore | Gratuit, rapide à setup |
| **Petit concert** (50-200) | StreamCore | Gratuit, qualité correcte |
| **Concert moyen** (200-500) | Agora | Meilleure qualité, faible latence |
| **Grand concert** (500-5000) | Agora | Pro quality, enregistrement cloud |
| **Événement public** (>5000) | YouTube | Gratuit, capacité illimitée |

**Conseil**: Le système sélectionne automatiquement la meilleure plateforme. Vous pouvez la changer manuellement dans les paramètres avancés.

---

## ✅ Checklist de Lancement

### Avant de Passer en Production

#### Infrastructure
- [ ] Compte Agora créé et vérifié
- [ ] Variables d'environnement en production
- [ ] STUN/TURN servers configurés pour StreamCore
- [ ] Backup servers (fallback)

#### Code
- [ ] Tests unitaires pour router
- [ ] Tests d'intégration multi-plateforme
- [ ] Tests de charge (1000+ spectateurs)
- [ ] Gestion d'erreurs complète

#### Monitoring
- [ ] Dashboard analytics temps réel
- [ ] Alertes Sentry configurées
- [ ] Logs CloudWatch/Railway
- [ ] Tracking coûts Agora

#### Documentation
- [ ] Guide artiste mis à jour
- [ ] API documentation complète
- [ ] Troubleshooting guide
- [ ] Runbook pour incidents

---

## 🎓 Formation Équipe

### Points Clés à Retenir

1. **YouTube = Default Safe Choice**
   - Toujours disponible
   - Gratuit et illimité
   - Utilisez pour gros événements

2. **Agora = Premium Quality**
   - Faible latence
   - Meilleure qualité
   - Attention au quota gratuit (10k min/mois)

3. **StreamCore = Small Events**
   - 100% gratuit
   - Limité à ~200 spectateurs
   - Fallback automatique si dépassement

4. **Router = Intelligent Selection**
   - Fait le bon choix automatiquement
   - Optimise les coûts
   - Peut être override manuellement

---

## 📞 Support et Maintenance

### Contacts Urgents

- **Agora Support**: [support@agora.io](mailto:support@agora.io)
- **AWS IVS**: Support via AWS Console
- **YouTube Live**: Creator Support

### Troubleshooting Commun

**Problème**: Agora quota dépassé
**Solution**: Router automatiquement vers YouTube

**Problème**: StreamCore ne connecte pas
**Solution**: Vérifier STUN servers, fallback vers Agora

**Problème**: Latence élevée
**Solution**: Upgrade vers Agora ou AWS IVS

---

**Document créé le**: 2025-11-16
**Prochaine révision**: Après Phase 1 complétée
**Responsable**: Tech Team VyBzzZ
