# Security remediation

Implemented in this revision:
- Native Supabase TOTP for admin, pasteur and prophete. Browser markers no longer grant MFA access. Setup secrets remain in component memory only.
- Bible and manual birthday APIs require a validated user token, AAL2 and the permitted database role. Scheduled birthday jobs retain CRON_SECRET authentication.
- Contact fields have server-side type/length validation and a best-effort per-instance throttle (5 attempts per 15 minutes). Resend failures are handled; birthday names are escaped in HTML.
- Dependency lockfile refreshed, with patched Capacitor and Vite requested explicitly.

Deployment prerequisites and limitations:
1. Enable Supabase TOTP enrollment and verification in the actual production project. Test with an administrator before rollout; there is deliberately no email/localStorage bypass.
2. Review and apply sql/security-role-guard.sql in that project. This SQL has NOT been executed by this revision. It protects role writes but does not replace a complete RLS audit.
3. Inspect existing policies and SECURITY DEFINER RPCs (including changer_role), storage permissions, cross-church access, backups and logs. Require AAL2 on privileged data operations at the database layer; the React gate alone cannot enforce database authorization.
4. Add a durable rate limit / bot protection at the hosting gateway. The in-process contact throttle does not provide a global serverless limit.
5. Build and release a new signed Android AAB to deliver native Capacitor fixes to installed applications. A web deployment alone is insufficient.
6. Remaining npm advisories must be reviewed, especially the legacy @capacitor/assets toolchain. This revision is not a CIS certification or a complete penetration test.

Tests: node --experimental-strip-types --test tests/security.test.ts
Build: npm run build
