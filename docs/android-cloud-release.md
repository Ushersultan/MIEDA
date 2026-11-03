# Android release without a local Android Studio installation

This repository now includes a manually started Codemagic workflow, `mieda-android-release`. It produces a signed AAB only; it does not publish to Google Play or send emails. No keystore or password is committed to the repository.

## One-time setup
1. Sign in to Codemagic and connect the GitHub repository `Ushersultan/MIEDA`. Select the `codemagic.yaml` configuration.
2. Under Team settings → codemagic.yaml settings → Code signing identities → Android keystores, upload the ORIGINAL upload keystore, enter its password, alias and key password, and use reference name `mieda_upload`. Keep a separate private backup; the service does not allow downloading the uploaded keystore. Do not put this file, passwords or service-account JSON in GitHub or chat messages.
3. Add environment variable group `mieda_android` to the app/team. Set `ANDROID_VERSION_CODE` to an integer higher than ALL codes previously uploaded to Play (including tests and drafts). Set `ANDROID_VERSION_NAME` to the intended next release name. The workflow deliberately provides no guessed version code.
4. Add any required client configuration as appropriate. Public Supabase defaults are already in the application; service-role and email-provider keys must NEVER be VITE_ variables or compiled into the app. If push notifications are required, configure the production Firebase Android registration and supply google-services.json privately before the native build; it is not included by this workflow.
5. Start a manual build on a trusted reviewed commit. Code running in this build can access signing credentials, so do not enable untrusted pull-request builds with these secrets.

## Before Play upload
- Compare the keystore's public certificate SHA-256 with Play Console → App integrity → Upload key certificate (not Google's app signing key certificate). The received keystore has not yet been password-validated or matched to Play.
- The build uses the existing app ID `org.eglisesmieda.app`; keep it unchanged.
- Download the signed AAB and upload to an internal testing track first. Check login/MFA, managed video catalog, YouTube live/embedded playback and fallback, logo, donations and navigation on a real Android device. Database migrations for video management and role protection still need confirmation in Supabase.
- Verify push notification configuration separately if it is part of the release.
- Review remaining dependency advisories, store privacy/Data safety declarations and the release notes before promoting to production.

## Current validation limits
Only workflow configuration and scripts can be checked here. No Codemagic account has been connected, no private key password has been provided, no signing certificate has been compared to Play Console, and no signed Android build or store publication has been performed. The supplied key is kept outside the repository.
