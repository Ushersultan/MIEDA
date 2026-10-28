# MIEDA videos and live streaming

## Deployment
1. Merge the security MFA changes (PR #3) and verify Supabase TOTP for administrators.
2. Run `sql/church-media.sql` in the production Supabase project matching the deployed application URL. This migration has NOT been applied automatically.
3. Deploy the web changes. In Administration → Vidéos & Direct, add a YouTube video URL or hosted HTTPS MP4 URL. Preview, then publish. Uncheck publication to hide it. Only one published item may be marked live; unpublish or unmark the previous direct first.
4. Build/sync and release one signed Android AAB. The new Capacitor hostname matches the registered app ID to provide YouTube with the Android client identity. This changes the WebView origin, so existing users may need to sign in again. Check any origin-specific provider settings and test a release build on a physical Android device before Play rollout.

## Content updates
The updated app and website read published rows from Supabase at entry, return to the screen/app, every visible minute, and on “Actualiser”. New video content requires no new Android binary. Older installed binaries still require the initial update.

YouTube links require no YouTube Data API key. The direct is the exact broadcast's video URL, not a channel /live URL. Marking an item live is an editorial label, not automatic proof that the broadcast is active. When a new broadcast gets a new URL, update it in Admin. The channel button remains available as a fallback.

MP4 files must already be uploaded to an HTTPS video host/storage. This release supports links, not direct file uploads from a phone. The host must support playable MP4 delivery and byte range requests. Large video uploads, transcoding and adaptive streaming need a video hosting provider.

The embedded YouTube player uses referrerPolicy strict-origin-when-cross-origin and playsinline; a fallback button opens YouTube using the native browser. Playback still depends on connectivity, owner embedding permissions and YouTube restrictions. No physical Android playback test or Play publication has been performed here.

## Authorization
Public users can read only published catalog rows. Only authenticated administrators with verified AAL2 may view drafts or insert/update rows. There is no public write policy or anonymous upload bucket. Existing profiles role-write protections must also be installed. No production rows are seeded or modified by the code change.

Validation: npm run build; node --experimental-strip-types --test tests/media.test.ts; targeted ESLint on new components/helpers.
