import { useLang } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

// ════════════════════════════════════════════════════════════════
//  Politique de confidentialité — exigée par Google Play & App Store
//  URL publique : https://www.eglisesmieda.org/confidentialite
// ════════════════════════════════════════════════════════════════

const Confidentialite = () => {
  const { lang } = useLang();
  const fr = lang !== "en";
  const maj = "6 août 2026";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> {fr ? "Retour à l'accueil" : "Back to home"}
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">
              {fr ? "Politique de confidentialité" : "Privacy Policy"}
            </h1>
          </div>
          <p className="text-primary-foreground/80 mt-2 text-sm">
            {fr ? "Dernière mise à jour : " : "Last updated: "}{maj}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-12">
        <article className="prose prose-slate max-w-none space-y-6 text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">

          {fr ? (
            <>
              <p>
                La présente politique décrit comment la Mission Internationale d'Évangélisation
                et de Délivrance des Âmes (« MIEDA », « nous ») collecte, utilise et protège
                vos données personnelles lorsque vous utilisez notre site web
                www.eglisesmieda.org et notre application mobile (ensemble, les « Services »).
              </p>

              <h2>1. Responsable du traitement</h2>
              <p>
                MIEDA — Mission Internationale d'Évangélisation et de Délivrance des Âmes.
                Contact : com@eglisesmieda.org.
              </p>

              <h2>2. Données que nous collectons</h2>
              <p>Nous collectons uniquement les données que vous nous fournissez volontairement :</p>
              <ul>
                <li><strong>Compte</strong> : nom complet, adresse email, mot de passe (chiffré).</li>
                <li><strong>Profil (facultatif)</strong> : numéro de téléphone, ville, pays, quartier, profession, date de naissance, photo de profil, courte présentation.</li>
                <li><strong>Église</strong> : l'église MIEDA à laquelle vous êtes rattaché.</li>
                <li><strong>Activité</strong> : demandes de prière et demandes d'adhésion à un département que vous soumettez.</li>
              </ul>
              <p>
                Nous ne collectons aucune donnée de localisation en temps réel, ni aucune
                information à votre insu. L'application ne piste pas votre activité en dehors
                des Services.
              </p>

              <h2>3. Utilisation des données</h2>
              <ul>
                <li>Créer et gérer votre compte et votre espace personnel.</li>
                <li>Vous rattacher à votre église locale et à votre serviteur.</li>
                <li>Transmettre vos demandes de prière et d'adhésion aux responsables concernés.</li>
                <li>Vous envoyer des messages liés à la vie de l'église (vœux d'anniversaire, annonces, message du prophète).</li>
                <li>Assurer la sécurité et le bon fonctionnement des Services.</li>
              </ul>

              <h2>4. Partage des données</h2>
              <p>
                Vos données ne sont jamais vendues ni louées. Elles ne sont visibles que par :
              </p>
              <ul>
                <li>Vous-même, dans votre espace personnel.</li>
                <li>Le pasteur et les responsables de votre église, pour l'accompagnement spirituel.</li>
                <li>L'administration de MIEDA, pour la gestion de la mission.</li>
              </ul>
              <p>
                Votre nom et votre photo de profil peuvent apparaître publiquement uniquement
                si vous êtes un serviteur (pasteur, évangéliste…) ayant choisi d'ajouter une photo.
                Les adresses email ne sont jamais rendues publiques.
              </p>

              <h2>5. Prestataires techniques</h2>
              <p>
                Nous nous appuyons sur des prestataires reconnus qui hébergent les données de
                façon sécurisée : Supabase (base de données et authentification), Vercel
                (hébergement du site) et Resend (envoi d'emails). Ces prestataires n'utilisent
                pas vos données à leurs propres fins.
              </p>

              <h2>6. Conservation et suppression</h2>
              <p>
                Vos données sont conservées tant que votre compte est actif. Vous pouvez à tout
                moment demander la modification ou la suppression de votre compte et de vos
                données en écrivant à com@eglisesmieda.org. La suppression est
                définitive.
              </p>

              <h2>7. Sécurité</h2>
              <p>
                Les mots de passe sont chiffrés, les échanges sont protégés par le protocole
                HTTPS, et l'accès aux données est strictement encadré. Une authentification à
                deux facteurs protège les comptes des responsables.
              </p>

              <h2>8. Enfants</h2>
              <p>
                Les Services s'adressent à un public familial. Les mineurs ne doivent créer un
                compte qu'avec l'accord d'un parent ou tuteur.
              </p>

              <h2>9. Vos droits</h2>
              <p>
                Vous disposez d'un droit d'accès, de rectification et de suppression de vos
                données. Pour l'exercer, contactez-nous à com@eglisesmieda.org.
              </p>

              <h2>10. Modifications</h2>
              <p>
                Cette politique peut être mise à jour. La date de dernière mise à jour figure
                en haut de cette page.
              </p>

              <h2>Contact</h2>
              <p>
                Pour toute question relative à vos données : com@eglisesmieda.org.
              </p>
            </>
          ) : (
            <>
              <p>
                This policy explains how the International Mission of Evangelism and Deliverance
                of Souls ("MIEDA", "we") collects, uses and protects your personal data when you
                use our website www.eglisesmieda.org and our mobile application (together, the
                "Services").
              </p>

              <h2>1. Data Controller</h2>
              <p>
                MIEDA — International Mission of Evangelism and Deliverance of Souls.
                Contact: com@eglisesmieda.org.
              </p>

              <h2>2. Data We Collect</h2>
              <p>We only collect data you voluntarily provide:</p>
              <ul>
                <li><strong>Account</strong>: full name, email address, password (encrypted).</li>
                <li><strong>Profile (optional)</strong>: phone number, city, country, neighbourhood, profession, date of birth, profile photo, short bio.</li>
                <li><strong>Church</strong>: the MIEDA church you belong to.</li>
                <li><strong>Activity</strong>: prayer requests and department membership requests you submit.</li>
              </ul>
              <p>
                We do not collect any real-time location data or any information without your
                knowledge. The app does not track your activity outside the Services.
              </p>

              <h2>3. How We Use Data</h2>
              <ul>
                <li>Create and manage your account and personal space.</li>
                <li>Connect you with your local church and pastor.</li>
                <li>Forward your prayer and membership requests to the relevant leaders.</li>
                <li>Send you church-related messages (birthday wishes, announcements, prophetic message).</li>
                <li>Ensure the security and proper operation of the Services.</li>
              </ul>

              <h2>4. Data Sharing</h2>
              <p>Your data is never sold or rented. It is only visible to:</p>
              <ul>
                <li>Yourself, in your personal space.</li>
                <li>The pastor and leaders of your church, for spiritual support.</li>
                <li>MIEDA administration, for managing the mission.</li>
              </ul>
              <p>
                Your name and profile photo may appear publicly only if you are a servant
                (pastor, evangelist…) who chose to add a photo. Email addresses are never made public.
              </p>

              <h2>5. Technical Providers</h2>
              <p>
                We rely on trusted providers that host data securely: Supabase (database and
                authentication), Vercel (website hosting) and Resend (email delivery). These
                providers do not use your data for their own purposes.
              </p>

              <h2>6. Retention and Deletion</h2>
              <p>
                Your data is kept as long as your account is active. You can request modification
                or deletion of your account and data at any time by writing to
                com@eglisesmieda.org. Deletion is permanent.
              </p>

              <h2>7. Security</h2>
              <p>
                Passwords are encrypted, communications are protected by HTTPS, and data access
                is strictly controlled. Two-factor authentication protects leaders' accounts.
              </p>

              <h2>8. Children</h2>
              <p>
                The Services are intended for a family audience. Minors should only create an
                account with the consent of a parent or guardian.
              </p>

              <h2>9. Your Rights</h2>
              <p>
                You have the right to access, correct and delete your data. To exercise it,
                contact us at com@eglisesmieda.org.
              </p>

              <h2>10. Changes</h2>
              <p>
                This policy may be updated. The last update date appears at the top of this page.
              </p>

              <h2>Contact</h2>
              <p>For any question about your data: com@eglisesmieda.org.</p>
            </>
          )}
        </article>
      </div>
    </div>
  );
};

export default Confidentialite;
