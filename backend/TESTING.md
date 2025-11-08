# 🧪 Guide de Test - Backend Vybzzz

Ce guide vous explique comment tester le backend localement avant le déploiement.

## 📋 Prérequis

1. Backend configuré avec les variables d'environnement
2. Supabase configuré avec les tables créées
3. Node.js et npm installés

## 🚀 Démarrage du serveur

### Mode développement

```bash
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:3000` avec rechargement automatique.

### Mode production (test)

```bash
cd backend
npm run build
npm start
```

## 🧪 Tests manuels

### 1. Test de santé (Health Check)

```bash
curl http://localhost:3000/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "message": "Vybzzz Backend API is running"
}
```

### 2. Test des événements

#### Liste tous les événements
```bash
curl http://localhost:3000/api/events
```

#### Liste avec pagination
```bash
curl "http://localhost:3000/api/events?page=1&limit=10"
```

#### Liste les événements en direct
```bash
curl "http://localhost:3000/api/events?isLive=true"
```

#### Récupère un événement par ID
```bash
curl http://localhost:3000/api/events/{event-id}
```

#### Crée un événement
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Concert Test",
    "description": "Description du concert",
    "artist": "Artiste Test",
    "venue": "Lieu Test",
    "location": "Paris, France",
    "is_live": false,
    "start_date": "2024-12-31T20:00:00Z",
    "end_date": "2024-12-31T23:00:00Z",
    "price": 50.00,
    "currency": "EUR"
  }'
```

### 3. Test du chat IA

#### Envoie un message
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Bonjour, pouvez-vous me parler des concerts disponibles ?"
      }
    ],
    "model": "gpt-3.5-turbo"
  }'
```

#### Crée une conversation
```bash
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "Ma conversation"
  }'
```

#### Récupère une conversation
```bash
curl http://localhost:3000/api/chat/conversations/{conversation-id}
```

### 4. Test des paiements

#### Crée un Payment Intent
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "eur",
    "description": "Paiement ticket concert",
    "metadata": {
      "userId": "user-123",
      "eventId": "event-456"
    }
  }'
```

### 5. Test du stockage

#### Liste les fichiers d'un bucket
```bash
curl http://localhost:3000/api/storage/list/event-images
```

#### Upload une image (nécessite un fichier)
```bash
curl -X POST http://localhost:3000/api/storage/upload/event-image \
  -F "file=@/path/to/image.jpg" \
  -F "eventId=event-123"
```

#### Récupère l'URL publique
```bash
curl http://localhost:3000/api/storage/url/event-images/events/123/image.jpg
```

#### Supprime un fichier
```bash
curl -X DELETE http://localhost:3000/api/storage/delete/event-images/events/123/image.jpg
```

## 🤖 Tests automatisés

### Script shell

```bash
cd backend
chmod +x scripts/test-endpoints.sh
./scripts/test-endpoints.sh http://localhost:3000
```

### Script TypeScript

```bash
cd backend
npx ts-node scripts/test-api.ts http://localhost:3000
```

## ✅ Checklist de test

Avant de déployer, vérifiez que tous ces tests passent :

- [ ] **Health Check** : `/health` retourne `200 OK`
- [ ] **Events** : 
  - [ ] `GET /api/events` retourne une liste
  - [ ] `GET /api/events/:id` retourne un événement
  - [ ] `POST /api/events` crée un événement
  - [ ] `PUT /api/events/:id` met à jour un événement
  - [ ] `DELETE /api/events/:id` supprime un événement
- [ ] **Chat** :
  - [ ] `POST /api/chat/message` envoie un message
  - [ ] `GET /api/chat/conversations/:id` récupère une conversation
  - [ ] `POST /api/chat/conversations` crée une conversation
- [ ] **Payments** :
  - [ ] `POST /api/payments/create-intent` crée un Payment Intent
- [ ] **Storage** :
  - [ ] `GET /api/storage/list/:bucket` liste les fichiers
  - [ ] `POST /api/storage/upload/event-image` upload une image
  - [ ] `GET /api/storage/url/:bucket/:path` récupère une URL
  - [ ] `DELETE /api/storage/delete/:bucket/:path` supprime un fichier

## 🐛 Dépannage

### Erreur : "Cannot connect to Supabase"
- Vérifiez que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont correctement configurés dans `.env`
- Vérifiez votre connexion internet

### Erreur : "Table does not exist"
- Vérifiez que les tables ont été créées dans Supabase
- Voir `SUPABASE_SETUP.md` pour les scripts SQL

### Erreur : "Stripe API error"
- Vérifiez que `STRIPE_SECRET_KEY` est correctement configuré
- Vérifiez que vous utilisez une clé de test (`sk_test_...`)

### Erreur : "OpenAI API error"
- Vérifiez que `OPENAI_API_KEY` est correctement configuré
- Vérifiez vos limites d'API OpenAI

## 📚 Ressources

- [Documentation API](./README.md)
- [Configuration Supabase](./SUPABASE_SETUP.md)
- [Configuration Storage](./SUPABASE_STORAGE_SETUP.md)

---

**Dernière mise à jour** : 2024

