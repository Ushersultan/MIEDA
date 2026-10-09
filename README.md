# Welcome to your Lovable project

## Project info

## How can I edit this code?

There are several ways of editing your application.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.


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

Le clip actuel reste temporairement indisponible : le MP4 publié est corrompu,
il faut remplacer ce fichier depuis l’original Zoom avant de le réactiver.

Pour livrer ce mécanisme aux utilisateurs existants, une mise à jour Android
est nécessaire : `npm install`, `npm run android:prepare`, puis générer un AAB
signé dans Android Studio et le publier dans Play Console. Le script augmente
le `versionCode` local et utilise le nom de version 1.3.3. Vérifier que ce code
dépasse également celui déjà publié dans Play Console.
