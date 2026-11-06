# MIEDA

Site et application des Églises MIEDA — Mission Internationale d’Évangélisation et de Délivrance des Âmes.

Développement : **Aser Djeha**.

## Développement local

Prérequis : Node.js 22 ou version ultérieure et npm.

```sh
npm ci
npm run dev
```

## Compilation et publication

```sh
npm run build
```

Le site est publié sur Vercel depuis GitHub. La compilation Android signée est
configurée dans `codemagic.yaml` ; voir `docs/android-cloud-release.md` pour les
paramètres de signature et la préparation d’une nouvelle release. Les clés et
mots de passe restent dans le stockage sécurisé du service de compilation.

Technologies : React, TypeScript, Vite, Tailwind CSS, shadcn/ui et Capacitor.

## Vidéo d’accueil et publications Android

Le clip d’accueil est défini dans `public/media/featured-clip.json`. L’application
Android télécharge ce fichier sur `https://www.eglisesmieda.org` au démarrage,
au retour au premier plan et toutes les minutes pendant que la page est visible.
Une connexion est nécessaire pour recevoir les nouveaux clips ; hors ligne,
le contenu inclus dans l’application sert de secours.

Pour publier un nouvel extrait :
1. Ajouter un MP4 H.264/AAC vérifié et son affiche dans `public/media/`, avec de nouveaux noms.
2. Modifier `id`, `video`, `poster`, `date`, `fr` et `en` dans le JSON.
3. Mettre `available` à `true` après avoir vérifié le fichier avec `ffmpeg -v error -xerror -i VIDEO.mp4 -f null -`.
4. Publier sur GitHub/Vercel. Aucun nouveau AAB n’est nécessaire pour ces clips après installation de la version contenant ce mécanisme.

L’extrait du culte en ligne du 11 octobre 2026 remplace celui du 4 octobre. Le fichier vidéo est vérifié et disponible dans `public/media/`.

Pour livrer ce mécanisme aux utilisateurs existants, une mise à jour Android
est nécessaire : `npm install`, `npm run android:prepare`, puis générer un AAB
signé dans Android Studio et le publier dans Play Console. Le script augmente
le `versionCode` local et utilise le nom de version 1.3.3. Vérifier que ce code
dépasse également celui déjà publié dans Play Console.
