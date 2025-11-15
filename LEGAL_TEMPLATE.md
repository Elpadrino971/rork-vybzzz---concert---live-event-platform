# 🏢 Guide de Remplissage des Informations Légales

**ATTENTION** : Ce document contient des EXEMPLES FICTIFS. Vous DEVEZ remplacer toutes ces informations par vos vraies données après l'enregistrement de votre société.

---

## ⚠️ Prérequis

Avant de remplir les pages légales, vous DEVEZ avoir :

1. ✅ **Société enregistrée** au Greffe du Tribunal de Commerce
2. ✅ **SIRET obtenu** (14 chiffres)
3. ✅ **RCS obtenu** (Ville + numéro d'immatriculation)
4. ✅ **TVA intracommunautaire** (FR + 11 chiffres)
5. ✅ **Adresse du siège social** (complète)
6. ✅ **Capital social défini** (minimum 1€)
7. ✅ **Médiateur de consommation** contracté

---

## 📝 Template d'Informations à Collecter

### Informations Société

Remplissez ce formulaire avec VOS informations réelles :

```yaml
# INFORMATIONS LÉGALES VYBZZZ
# ================================================

Raison sociale: VyBzzZ SAS
Capital social: 1 €  # Ou montant réel choisi

# Adresse siège social (COMPLÈTE)
Adresse ligne 1: [Numéro et nom de rue]
Adresse ligne 2: [Complément d'adresse - optionnel]
Code postal: [75001, etc.]
Ville: [Paris, Lyon, etc.]
Pays: France

# Identifiants légaux
SIRET: [14 chiffres - format: 123 456 789 01234]
SIREN: [9 premiers chiffres du SIRET]
RCS: [Ville] [Lettre B ou A] [Numéro]  # Ex: Paris B 123 456 789
TVA intracommunautaire: FR[11 chiffres]  # Ex: FR12345678901

# Direction
Directeur de publication: [Nom complet du dirigeant]
Email de contact: contact@vybzzz.com
Téléphone: +33 [numéro]

# Hébergement web
Hébergeur: Vercel Inc.
Adresse hébergeur: 340 S Lemon Ave #4133, Walnut, CA 91789, USA

# Médiateur de consommation (OBLIGATOIRE)
Nom du médiateur: [CNPM, Médicys, CM2C, etc.]
Adresse médiateur: [Adresse complète]
Site web médiateur: [URL]
Email médiateur: [Email de contact]
```

---

## 📄 Fichiers à Modifier

### 1. `/app/terms/page.tsx` (CGU - Conditions Générales d'Utilisation)

**Lignes à modifier : 43-49**

```typescript
// AVANT (avec placeholders)
<p className="mb-2">
  <strong>VyBzzZ SAS</strong>
  <br />
  Capital social : [Montant] €
  <br />
  Siège social : [Adresse complète]
  <br />
  RCS : [Ville] [Numéro]
  <br />
  SIRET : [Numéro]
  <br />
  TVA intracommunautaire : [Numéro]
  <br />
  Directeur de la publication : [Nom]
</p>

// APRÈS (exemple avec données FICTIVES - REMPLACER PAR VOS VRAIES DONNÉES)
<p className="mb-2">
  <strong>VyBzzZ SAS</strong>
  <br />
  Capital social : 1 €
  <br />
  Siège social : 123 Avenue des Champs-Élysées, 75008 Paris, France
  <br />
  RCS : Paris B 123 456 789
  <br />
  SIRET : 12345678901234
  <br />
  TVA intracommunautaire : FR12345678901
  <br />
  Directeur de la publication : Jean Dupont
</p>
```

**Ligne à modifier : ~276 (section Contact)**

```typescript
// AVANT
Courrier : VyBzzZ SAS, [Adresse], France

// APRÈS
Courrier : VyBzzZ SAS, 123 Avenue des Champs-Élysées, 75008 Paris, France
```

---

### 2. `/app/legal/page.tsx` (CGV - Conditions Générales de Vente)

**Section "Informations sur le vendeur" (similaire aux CGU)**

```typescript
// AVANT
<div className="space-y-2">
  <p><strong>Dénomination sociale :</strong> VyBzzZ SAS</p>
  <p><strong>Siège social :</strong> [Adresse complète]</p>
  <p><strong>SIRET :</strong> [Numéro]</p>
  <p><strong>RCS :</strong> [Ville] [Numéro]</p>
  <p><strong>Capital social :</strong> [Montant] €</p>
  <p><strong>Email :</strong> contact@vybzzz.com</p>
  <p><strong>Téléphone :</strong> [Numéro]</p>
</div>

// APRÈS (exemple FICTIF - REMPLACER)
<div className="space-y-2">
  <p><strong>Dénomination sociale :</strong> VyBzzZ SAS</p>
  <p><strong>Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
  <p><strong>SIRET :</strong> 12345678901234</p>
  <p><strong>RCS :</strong> Paris B 123 456 789</p>
  <p><strong>Capital social :</strong> 1 €</p>
  <p><strong>Email :</strong> contact@vybzzz.com</p>
  <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
</div>
```

**Section Médiateur de consommation (OBLIGATOIRE par la loi)**

```typescript
// AJOUTER cette section dans les CGV
<Section title="10. Médiation de la consommation">
  <p>
    Conformément aux articles L.616-1 et R.616-1 du Code de la consommation,
    nous proposons un dispositif de médiation de la consommation.
  </p>
  <p className="mt-4">
    <strong>Médiateur :</strong> [Nom du médiateur - ex: CNPM]
    <br />
    <strong>Adresse :</strong> [Adresse complète]
    <br />
    <strong>Site web :</strong> <a href="[URL]" className="text-primary">[URL]</a>
    <br />
    <strong>Email :</strong> [email du médiateur]
  </p>
  <p className="mt-4">
    Le consommateur peut saisir gratuitement le médiateur dans un délai
    maximum d'un an à compter de sa réclamation écrite auprès de VyBzzZ.
  </p>
</Section>
```

---

### 3. `/app/privacy/page.tsx` (Politique de Confidentialité)

**Section "Responsable du traitement"**

```typescript
// AVANT
<p>
  Le responsable du traitement des données personnelles est :
  <br />
  VyBzzZ SAS, [Adresse], France
</p>

// APRÈS
<p>
  Le responsable du traitement des données personnelles est :
  <br />
  VyBzzZ SAS
  <br />
  123 Avenue des Champs-Élysées
  <br />
  75008 Paris, France
  <br />
  Email : dpo@vybzzz.com
</p>
```

---

## 🔍 Comment Trouver ces Fichiers

```bash
# Ouvrir les fichiers dans votre éditeur
code app/terms/page.tsx
code app/legal/page.tsx
code app/privacy/page.tsx

# Ou chercher les placeholders
grep -r "\[Adresse" app/
grep -r "\[Montant\]" app/
grep -r "\[Numéro\]" app/
```

---

## ✅ Checklist de Vérification

Avant de déployer en production, vérifiez que :

### Informations Légales
- [ ] SIRET rempli (14 chiffres exacts)
- [ ] RCS rempli (Ville + lettre + numéro)
- [ ] TVA intracommunautaire remplie (FR + 11 chiffres)
- [ ] Capital social correct (minimum 1€)
- [ ] Adresse siège social COMPLÈTE
- [ ] Directeur de publication nommé
- [ ] Aucun placeholder [xxx] restant

### Contacts
- [ ] Email contact@vybzzz.com configuré
- [ ] Téléphone de contact valide
- [ ] Email DPO (Data Protection Officer) configuré

### Médiateur Consommation
- [ ] Contrat signé avec médiateur
- [ ] Nom du médiateur ajouté
- [ ] Adresse du médiateur ajoutée
- [ ] Site web du médiateur ajouté
- [ ] Informations dans CGU ET CGV

### Vérification Finale
- [ ] Toutes les pages légales relues
- [ ] Validation par un avocat (RECOMMANDÉ)
- [ ] Aucune faute de frappe
- [ ] Liens fonctionnels

---

## 🚨 Erreurs à Éviter

### ❌ NE PAS FAIRE

1. **Laisser des placeholders** type `[Adresse]` → Amende jusqu'à 75 000€
2. **Inventer des numéros** → Fraude, poursuites judiciaires
3. **Copier des infos d'une autre société** → Usurpation d'identité
4. **Oublier le médiateur** → Non-conformité légale, amende
5. **Lancer sans validation avocat** → Risque juridique élevé

### ✅ À FAIRE

1. Attendre l'obtention officielle de TOUS les numéros
2. Vérifier 3 fois les numéros (SIRET, RCS, TVA)
3. Faire valider par un avocat spécialisé e-commerce
4. Garder une copie de tous les documents officiels
5. Mettre à jour si changement (déménagement, capital, etc.)

---

## 📞 Ressources Utiles

### Enregistrement Société
- **Guichet Entreprises** : https://www.guichet-entreprises.fr
- **Infogreffe** : https://www.infogreffe.fr
- **INSEE (SIRET)** : https://avis-situation-sirene.insee.fr

### Médiateurs Agréés
- **CNPM** : https://cnpm-mediation-consommation.eu
- **Médicys** : https://www.medicys.fr
- **CM2C** : https://www.cm2c.net

### Validation Légale
- **DGCCRF** : https://www.economie.gouv.fr/dgccrf
- **CNIL** : https://www.cnil.fr
- **Légifrance** : https://www.legifrance.gouv.fr

---

## 🔄 Procédure de Mise à Jour

### Quand mettre à jour les pages légales ?

1. **Changement d'adresse** → Modifier dans les 1 mois
2. **Augmentation du capital** → Modifier immédiatement
3. **Changement de dirigeant** → Modifier dans les 15 jours
4. **Nouveau médiateur** → Modifier immédiatement
5. **Modification CGU/CGV** → Notifier utilisateurs 30 jours avant

### Comment notifier les utilisateurs ?

```typescript
// Ajouter dans les CGU/CGV
<p className="text-sm text-muted-foreground">
  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
</p>
```

---

## 📋 Template Email de Notification

Quand vous obtenez vos numéros légaux, utilisez ce template :

```
Objet : VyBzzZ - Informations légales officielles

Bonjour,

Nous avons le plaisir de vous informer que VyBzzZ SAS est désormais
officiellement enregistrée.

Informations légales :
- SIRET : [votre SIRET]
- RCS : [votre RCS]
- TVA : [votre TVA]
- Siège : [votre adresse]

Ces informations ont été mises à jour sur notre site web dans les
pages légales (CGU, CGV, Confidentialité).

Cordialement,
L'équipe VyBzzZ
```

---

## ⏱️ Timeline

### Avant Lancement (J-46)
- [ ] Semaine 1-2 : Enregistrement société
- [ ] Semaine 2 : Obtention numéros (SIRET, RCS, TVA)
- [ ] Semaine 3 : Signature médiateur
- [ ] Semaine 4 : Mise à jour pages légales
- [ ] Semaine 5 : Validation avocat
- [ ] Semaine 6 : Déploiement final

### Jour du Déploiement
1. Vérifier que TOUS les placeholders sont remplis
2. Tester tous les liens
3. Faire une capture d'écran de chaque page légale
4. Archiver les anciennes versions
5. Déployer
6. Vérifier en production

---

## 🆘 Contacts d'Urgence

**Avocat E-Commerce** : [À trouver - recommandé]
**Expert-Comptable** : [À définir]
**Greffe Tribunal Commerce** : [Selon votre ville]

---

**IMPORTANT** : Ne lancez JAMAIS sans avoir rempli TOUTES ces informations légales. Les sanctions sont lourdes et peuvent aller jusqu'à la fermeture forcée de l'entreprise.

---

**Dernière mise à jour** : 15 novembre 2025
**Validité** : Jusqu'au lancement (31 décembre 2025)
