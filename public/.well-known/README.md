# Configuration des Universal Links / App Links

## Fichiers de vérification du domaine

Ces fichiers permettent à iOS et Android de vérifier que tu possèdes le domaine vybzzz.com.

### apple-app-site-association (iOS Universal Links)

**⚠️ IMPORTANT** : Remplace `TEAM_ID` par ton Apple Team ID

Pour obtenir ton Team ID :
1. Va sur https://developer.apple.com/account
2. Section "Membership" → Apple Developer Program
3. Note ton "Team ID" (10 caractères, ex: AB12CD34EF)
4. Remplace `TEAM_ID` dans `apple-app-site-association`

### assetlinks.json (Android App Links)

**⚠️ IMPORTANT** : Remplace `ANDROID_KEYSTORE_SHA256_FINGERPRINT` par le SHA256 de ta keystore

Pour obtenir le SHA256 après le build EAS :
```bash
eas credentials
# Choisis Android → Production → Keystore
# Copie le SHA-256 Fingerprint
```

Ou avec EAS Build :
```bash
eas build:configure
# EAS va générer une keystore et afficher le fingerprint
```

## Vérification

Une fois déployé sur vybzzz.com, teste que les fichiers sont accessibles :

**iOS** :
```
https://vybzzz.com/.well-known/apple-app-site-association
```

**Android** :
```
https://vybzzz.com/.well-known/assetlinks.json
```

Les deux fichiers doivent :
- ✅ Être accessibles en HTTPS
- ✅ Retourner Content-Type: application/json
- ✅ Ne PAS avoir d'extension .json pour apple-app-site-association
- ✅ Être à la racine du domaine (pas de sous-domaine)

## Déploiement sur Vercel

Vercel sert automatiquement les fichiers de `public/.well-known/`.

Assure-toi que `vercel.json` contient :
```json
{
  "headers": [
    {
      "source": "/.well-known/(.*)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600"
        }
      ]
    }
  ]
}
```

Cela garantit que les fichiers sont servis avec le bon Content-Type.
