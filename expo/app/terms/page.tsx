import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CGU - Conditions Générales d\'Utilisation | VyBzzZ',
  description: 'Conditions générales d\'utilisation de la plateforme VyBzzZ',
}

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Conditions Générales d'Utilisation (CGU)
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Article 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 1 - Objet</h2>
            <p className="text-gray-700">
              Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent
              l'utilisation de la plateforme VyBzzZ (ci-après « la Plateforme »), accessible via
              le site web et l'application mobile.
            </p>
            <p className="text-gray-700 mt-4">
              La Plateforme permet aux artistes de diffuser des concerts en direct et aux utilisateurs
              (« Fans ») d'y accéder moyennant l'achat de billets électroniques.
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 2 - Éditeur de la Plateforme</h2>
            <p className="text-gray-700">
              La Plateforme est éditée par :
            </p>
            <address className="not-italic text-gray-700 mt-2">
              <strong>VyBzzZ SAS</strong><br />
              Capital social : [Montant] €<br />
              Siège social : [Adresse complète]<br />
              RCS : [Ville] [Numéro]<br />
              SIRET : [Numéro]<br />
              TVA intracommunautaire : [Numéro]<br />
              Email : contact@vybzzz.com<br />
              Directeur de la publication : [Nom]
            </address>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 3 - Hébergement</h2>
            <p className="text-gray-700">
              La Plateforme est hébergée par :
            </p>
            <div className="text-gray-700 mt-2">
              <p><strong>Vercel Inc.</strong></p>
              <p>340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 4 - Accès et Inscription</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Accès</h3>
            <p className="text-gray-700">
              L'accès à la Plateforme est gratuit. Certains services nécessitent la création d'un
              compte utilisateur et/ou l'achat de billets.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Inscription</h3>
            <p className="text-gray-700">
              Pour créer un compte, l'utilisateur doit :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Être majeur (18 ans révolus) ou disposer de l'autorisation parentale</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Créer un mot de passe sécurisé</li>
              <li>Accepter les présentes CGU</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Types de comptes</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Compte Fan :</strong> Permet d'acheter des billets, suivre des artistes, envoyer des pourboires</li>
              <li><strong>Compte Artiste :</strong> Permet de créer et diffuser des concerts, recevoir des paiements</li>
              <li><strong>Compte Affilié :</strong> Permet de parrainer des utilisateurs et percevoir des commissions</li>
            </ul>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 5 - Services Proposés</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Pour les Fans</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Achat de billets pour des concerts en direct</li>
              <li>Visionnage de concerts en streaming</li>
              <li>Envoi de pourboires aux artistes</li>
              <li>Suivi d'artistes favoris</li>
              <li>Accès aux replays (selon conditions)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Pour les Artistes</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Création et diffusion de concerts en direct</li>
              <li>Fixation des prix (selon abonnement)</li>
              <li>Réception de paiements via Stripe Connect</li>
              <li>Accès aux statistiques de performance</li>
              <li>Gestion des followers</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Happy Hour</h3>
            <p className="text-gray-700">
              Chaque mercredi à 20h, les concerts sont proposés au tarif préférentiel de 4,99 €.
            </p>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 6 - Obligations des Utilisateurs</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Obligations générales</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Respecter les lois et règlements en vigueur</li>
              <li>Ne pas porter atteinte aux droits de tiers</li>
              <li>Ne pas diffuser de contenu illicite, violent, diffamatoire ou pornographique</li>
              <li>Ne pas usurper l'identité d'autrui</li>
              <li>Ne pas tenter de contourner les mesures de sécurité</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Obligations des Artistes</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Détenir tous les droits sur le contenu diffusé</li>
              <li>Respecter les droits d'auteur et droits voisins</li>
              <li>S'acquitter de la SACEM et autres organismes de gestion collective</li>
              <li>Fournir un contenu de qualité professionnelle</li>
              <li>Respecter les horaires annoncés</li>
              <li>Disposer d'une connexion internet stable</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.3 Interdictions</h3>
            <p className="text-gray-700">
              Il est strictement interdit de :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Enregistrer, télécharger ou redistribuer les concerts</li>
              <li>Utiliser des bots ou scripts automatisés</li>
              <li>Revendre des billets</li>
              <li>Créer plusieurs comptes pour contourner les limitations</li>
              <li>Exploiter des failles de sécurité</li>
            </ul>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 7 - Propriété Intellectuelle</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.1 Propriété de la Plateforme</h3>
            <p className="text-gray-700">
              La Plateforme, son design, sa structure, son code source et tous les éléments qui la
              composent sont la propriété exclusive de VyBzzZ SAS et sont protégés par le droit d'auteur.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.2 Contenu des Artistes</h3>
            <p className="text-gray-700">
              Les artistes restent propriétaires de leur contenu. En diffusant sur la Plateforme,
              ils accordent à VyBzzZ une licence limitée pour diffuser, stocker et promouvoir ce contenu.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.3 Utilisation des marques</h3>
            <p className="text-gray-700">
              Les marques, logos et signes distinctifs reproduits sur la Plateforme sont la propriété
              de VyBzzZ SAS ou de leurs propriétaires respectifs.
            </p>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 8 - Responsabilité</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.1 Responsabilité de VyBzzZ</h3>
            <p className="text-gray-700">
              VyBzzZ s'efforce d'assurer la disponibilité et la qualité de la Plateforme mais ne peut
              garantir :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>L'absence d'interruptions ou d'erreurs</li>
              <li>La qualité du streaming (dépendant de la connexion de l'artiste)</li>
              <li>L'exactitude du contenu fourni par les artistes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.2 Force majeure</h3>
            <p className="text-gray-700">
              VyBzzZ ne saurait être tenu responsable en cas de force majeure ou d'événements
              indépendants de sa volonté (panne, cyberattaque, catastrophe naturelle, etc.).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.3 Responsabilité des utilisateurs</h3>
            <p className="text-gray-700">
              Les utilisateurs sont seuls responsables de l'utilisation qu'ils font de la Plateforme
              et des contenus qu'ils publient.
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 9 - Suspension et Résiliation</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.1 Suspension</h3>
            <p className="text-gray-700">
              VyBzzZ se réserve le droit de suspendre ou de supprimer un compte en cas de :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Violation des présentes CGU</li>
              <li>Non-paiement</li>
              <li>Activité frauduleuse</li>
              <li>Comportement abusif</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.2 Résiliation par l'utilisateur</h3>
            <p className="text-gray-700">
              L'utilisateur peut supprimer son compte à tout moment via les paramètres de son profil
              ou en contactant le support. Voir notre politique RGPD pour plus d'informations.
            </p>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 10 - Données Personnelles</h2>
            <p className="text-gray-700">
              Le traitement des données personnelles est régi par notre{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Politique de Confidentialité
              </a>
              , conforme au RGPD.
            </p>
          </section>

          {/* Article 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 11 - Modification des CGU</h2>
            <p className="text-gray-700">
              VyBzzZ se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs
              seront informés par email ou notification sur la Plateforme. La poursuite de l'utilisation
              vaut acceptation des nouvelles conditions.
            </p>
          </section>

          {/* Article 12 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 12 - Loi Applicable et Juridiction</h2>
            <p className="text-gray-700">
              Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de
              solution amiable, les tribunaux français seront seuls compétents.
            </p>
            <p className="text-gray-700 mt-4">
              Conformément aux articles L.611-1 et R.612-1 du Code de la consommation, tout consommateur
              a le droit de recourir gratuitement à un médiateur de la consommation en vue de la
              résolution amiable du litige qui l'oppose à un professionnel.
            </p>
          </section>

          {/* Article 13 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 13 - Contact</h2>
            <p className="text-gray-700">
              Pour toute question concernant les présentes CGU :
            </p>
            <address className="not-italic text-gray-700 mt-2">
              Email : legal@vybzzz.com<br />
              Courrier : VyBzzZ SAS, [Adresse], France
            </address>
          </section>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <a href="/" className="text-blue-600 hover:underline">
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}
