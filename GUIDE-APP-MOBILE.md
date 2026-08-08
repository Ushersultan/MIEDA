# 📱 Application mobile MIEDA — Guide complet

Votre site devient une **application**, sans réécriture. Deux niveaux, du plus rapide au plus complet.

- **Partie 1 — PWA** : installable dès aujourd'hui sur iPhone et Android depuis le navigateur. **Gratuit, aucun magasin, ça marche immédiatement.**
- **Partie 2 — App Store & Google Play** : une vraie app téléchargeable dans les magasins, avec notifications push. Nécessite votre ordinateur (et les comptes développeurs).

Le même code sert pour les deux — c'est tout l'intérêt de l'approche **Capacitor**.

---

## PARTIE 1 — La PWA (à faire en premier, gratuit)

### Ce que ça fait
Vos fidèles ouvrent `www.eglisesmieda.org` sur leur téléphone, puis **« Ajouter à l'écran d'accueil »**. Une icône MIEDA apparaît, l'app s'ouvre en plein écran (sans barre d'adresse), se charge très vite et fonctionne partiellement hors-ligne.

### Installation (vous) — via GitHub, comme d'habitude
Envoyez sur GitHub les fichiers de ce paquet :

**Fichiers à la racine** (glissez-les un par un dans « Add file → Upload files ») :
- `vite.config.ts`
- `capacitor.config.ts`
- `index.html`
- `package.json`
- `package-lock.json`
- `.gitignore`

**Dossiers** (glissez le dossier entier à la racine) :
- `public/` (les 4 icônes)
- `resources/` (icône + splash pour plus tard)
- `src/` (contient `main.tsx`, `index.css`, `lib/native.ts`)

Commit : `feat: application mobile — PWA + base Capacitor`

Vercel déploie tout seul. **La PWA est alors active.**

### Comment vos fidèles l'installent
- **Android (Chrome)** : ouvrir le site → une bannière « Installer l'application » apparaît, ou menu ⋮ → « Installer l'application ».
- **iPhone (Safari)** : ouvrir le site → bouton Partager ⬆️ → « Sur l'écran d'accueil ».

Vous pouvez mettre une petite annonce sur le site : *« Installez l'application MIEDA : ouvrez ce site sur votre téléphone puis Ajouter à l'écran d'accueil. »*

---

## PARTIE 2 — App Store & Google Play (Capacitor)

Cette partie se fait **sur votre ordinateur**, pas via GitHub. Le site est déjà prêt à être empaqueté.

### Ce qu'il vous faut

| Pour… | Outils | Coût |
|-------|--------|------|
| Android | [Android Studio](https://developer.android.com/studio) (gratuit) | Google Play : **25 $ une fois** |
| iOS | Un **Mac** + [Xcode](https://apps.apple.com/app/xcode/id497799835) (gratuit) | Apple Developer : **99 $/an** |
| Les deux | [Node.js 20+](https://nodejs.org) | — |

> iOS **exige** un Mac. Sans Mac, vous pouvez publier sur Android d'abord, et faire l'iPhone plus tard (ou via un service de build cloud).

### Étape 1 — Préparer le projet (une seule fois)

Ouvrez un terminal sur votre ordinateur :

```bash
# Récupérer votre dépôt à jour
git clone https://github.com/Ushersultan/MIEDA.git
cd MIEDA

# Installer les dépendances
npm install

# Construire le site
npm run build

# Générer les projets natifs (crée les dossiers android/ et ios/)
npx cap add android
npx cap add ios        # sur Mac uniquement

# Générer les icônes et écrans de démarrage MIEDA
npx @capacitor/assets generate

# Copier le site dans les apps
npx cap sync
```

### Étape 2 — Android (APK / AAB pour Google Play)

```bash
npx cap open android
```

Android Studio s'ouvre. Puis :
1. Laissez-le finir l'indexation (barre en bas).
2. Menu **Build → Generate Signed Bundle / APK**.
3. Choisissez **Android App Bundle** (format demandé par Google Play).
4. Créez une **clé de signature** (gardez-la précieusement — elle vous suivra à chaque mise à jour).
5. Le fichier `.aab` est produit dans `android/app/release/`.

Puis sur [Google Play Console](https://play.google.com/console) (25 $) :
- Créez l'application « MIEDA »
- Téléversez le `.aab`
- Remplissez la fiche (description, captures d'écran, politique de confidentialité)
- Soumettez — validation en quelques heures à 2 jours.

### Étape 3 — iOS (App Store, sur Mac)

```bash
npx cap open ios
```

Xcode s'ouvre. Puis :
1. Sélectionnez le projet **App** → onglet **Signing & Capabilities**.
2. Connectez votre **compte Apple Developer** (99 $/an) et choisissez votre équipe.
3. **Product → Archive**.
4. **Distribute App → App Store Connect**.

Sur [App Store Connect](https://appstoreconnect.apple.com) :
- Créez l'app « MIEDA »
- Envoyez d'abord en **TestFlight** pour tester
- Remplissez la fiche + captures + confidentialité
- Soumettez — validation Apple : 1 à 3 jours en général.

---

## 🔄 Mettre à jour l'app quand le site change

À chaque modification du site (nouveau message, correctif…), pour répercuter dans les apps :

```bash
cd MIEDA
git pull
npm run build
npx cap sync
```

Puis reconstruisez depuis Android Studio / Xcode et renvoyez la nouvelle version aux magasins.

> **La PWA, elle, se met à jour toute seule** dès que Vercel déploie — aucune action. C'est l'avantage de garder les deux.

---

## 🔔 Notifications push (étape suivante, quand vous voulez)

Le code est déjà prêt : `src/lib/native.ts` contient `enregistrerPush()`. Pour l'activer, il faudra :
1. Créer un projet [Firebase](https://console.firebase.google.com) (gratuit) pour Android.
2. Configurer les certificats push Apple pour iOS.
3. Stocker les jetons d'appareil dans Supabase (une table `appareils_push`).
4. Une petite fonction d'envoi (par ex. depuis l'Espace Admin : « Nouveau message du Prophète 🙏 »).

Dites-moi quand vous voulez brancher ça — c'est un chantier à part entière, mais la fondation est posée.

---

## 📋 Récapitulatif

| Élément | État |
|---------|------|
| PWA installable iPhone + Android | ✅ Dès l'upload GitHub |
| Base Capacitor (iOS + Android) | ✅ Prête |
| Icônes & écrans de démarrage MIEDA | ✅ Générés (fond blanc, logo centré) |
| appId | `org.eglisesmieda.app` |
| Nom de l'app | MIEDA |
| Barre d'état, encoches iPhone | ✅ Gérées |
| Fonctionnement hors-ligne partiel | ✅ (consultation) |
| Notifications push | 🔧 Fondation posée, activation à venir |

**Commencez par la Partie 1** : uploadez les fichiers, et l'app est installable ce soir. La Partie 2 (magasins) se fera tranquillement quand vous aurez Android Studio et les comptes développeurs. 🙏
