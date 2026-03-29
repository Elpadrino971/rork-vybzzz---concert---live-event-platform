import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CGV - Conditions Générales de Vente | VyBzzZ',
  description: 'Conditions générales de vente de billets de concert sur VyBzzZ',
}

export default function TermsOfSalePage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Conditions Générales de Vente (CGV)
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          {/* Préambule */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Préambule</h2>
            <p className="text-gray-700">
              Les présentes Conditions Générales de Vente (ci-après « CGV ») s'appliquent à toutes
              les transactions effectuées sur la plateforme VyBzzZ entre :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li><strong>Le Vendeur :</strong> VyBzzZ SAS (intermédiaire technique) et les Artistes (prestataires de contenu)</li>
              <li><strong>L'Acheteur :</strong> Toute personne physique ou morale procédant à l'achat de billets</li>
            </ul>
          </section>

          {/* Article 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 1 - Objet</h2>
            <p className="text-gray-700">
              Les présentes CGV régissent la vente de billets électroniques donnant accès à des
              concerts en direct diffusés sur la plateforme VyBzzZ. Les billets ne sont ni physiques
              ni échangeables contre des billets physiques.
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 2 - Produits et Services</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Billets de Concert</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Accès à un concert en direct via streaming</li>
              <li>Durée approximative selon l'événement</li>
              <li>Qualité vidéo adaptative (selon connexion internet)</li>
              <li>Chat en direct avec les autres spectateurs</li>
              <li>Possibilité d'envoyer des pourboires à l'artiste</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Tarification</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Tarif standard :</strong> 5€ à 25€ selon l'artiste et son abonnement</li>
              <li><strong>Happy Hour :</strong> 4,99€ tous les mercredis à 20h</li>
              <li><strong>Pourboires :</strong> Montants libres de 1€ à 1 000€</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.3 Abonnements Artistes</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Starter :</strong> 19,99€/mois - 50% de revenus</li>
              <li><strong>Pro :</strong> 59,99€/mois - 60% de revenus</li>
              <li><strong>Elite :</strong> 129,99€/mois - 70% de revenus</li>
            </ul>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 3 - Commande</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Processus de commande</h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Sélection du concert</li>
              <li>Ajout au panier</li>
              <li>Création de compte ou connexion</li>
              <li>Vérification du récapitulatif</li>
              <li>Saisie des informations de paiement</li>
              <li>Validation de la commande</li>
              <li>Réception de la confirmation par email</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Confirmation</h3>
            <p className="text-gray-700">
              La commande est considérée comme définitive après validation du paiement. Un email
              de confirmation est envoyé avec les détails de l'accès au concert.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Code de parrainage</h3>
            <p className="text-gray-700">
              Les utilisateurs peuvent utiliser un code de parrainage lors de l'achat. Ce code permet
              de contribuer au système d'affiliation et n'affecte pas le prix du billet.
            </p>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 4 - Prix</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Prix TTC</h3>
            <p className="text-gray-700">
              Les prix sont indiqués en euros, toutes taxes comprises (TTC), incluant la TVA au taux
              en vigueur. Les prix peuvent varier selon les artistes et les événements.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Frais</h3>
            <p className="text-gray-700">
              Le prix affiché est le prix final. Il n'y a pas de frais supplémentaires de service ou
              de traitement.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Modification des prix</h3>
            <p className="text-gray-700">
              VyBzzZ et les artistes se réservent le droit de modifier les prix à tout moment. Les
              commandes validées restent au prix en vigueur au moment de l'achat.
            </p>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 5 - Paiement</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Moyens de paiement</h3>
            <p className="text-gray-700">
              Les paiements sont traités de manière sécurisée par Stripe. Moyens acceptés :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Carte bancaire (Visa, Mastercard, American Express)</li>
              <li>Carte de débit</li>
              <li>Apple Pay</li>
              <li>Google Pay</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Sécurité</h3>
            <p className="text-gray-700">
              Les informations bancaires ne sont ni collectées ni stockées par VyBzzZ. Elles sont
              transmises directement à Stripe (certifié PCI-DSS niveau 1).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Validation du paiement</h3>
            <p className="text-gray-700">
              La commande est traitée uniquement après validation du paiement par la banque et Stripe.
              En cas de refus, la commande est annulée.
            </p>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 6 - Accès au Concert</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Modalités d'accès</h3>
            <p className="text-gray-700">
              Après validation du paiement, l'acheteur reçoit :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Un email de confirmation</li>
              <li>Un billet électronique dans son compte</li>
              <li>Un lien direct vers le concert (accessible dès l'heure de début)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Conditions techniques</h3>
            <p className="text-gray-700">
              Pour accéder au concert, l'acheteur doit disposer :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>D'une connexion internet stable (min. 5 Mbps recommandé)</li>
              <li>D'un navigateur récent ou de l'application mobile VyBzzZ</li>
              <li>D'un compte utilisateur actif</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.3 Durée de disponibilité</h3>
            <p className="text-gray-700">
              L'accès au concert est disponible :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li><strong>En direct :</strong> Pendant toute la durée du concert</li>
              <li><strong>Replay :</strong> Selon les conditions définies par l'artiste (généralement non disponible)</li>
            </ul>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 7 - Droit de Rétractation</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.1 Exception au droit de rétractation</h3>
            <p className="text-gray-700">
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation
              de 14 jours ne s'applique pas aux :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>Fourniture de contenu numérique non fourni sur support matériel</li>
              <li>Prestations de services pleinement exécutées avant la fin du délai de rétractation</li>
              <li>Événements de loisirs à date ou période déterminée</li>
            </ul>

            <p className="text-gray-700 mt-4">
              <strong>En conséquence, aucun remboursement n'est possible après l'achat d'un billet.</strong>
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.2 Cas particuliers</h3>
            <p className="text-gray-700">
              Un remboursement peut être accordé dans les cas suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li><strong>Annulation par l'artiste :</strong> Remboursement intégral automatique</li>
              <li><strong>Problème technique majeur :</strong> Remboursement au cas par cas</li>
              <li><strong>Erreur de facturation :</strong> Correction ou remboursement</li>
            </ul>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 8 - Annulation et Incidents</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.1 Annulation par l'artiste</h3>
            <p className="text-gray-700">
              En cas d'annulation du concert par l'artiste, les acheteurs sont remboursés intégralement
              sous 5 à 10 jours ouvrés. Notification par email et sur la plateforme.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.2 Problèmes techniques</h3>
            <p className="text-gray-700">
              En cas de problème technique empêchant l'accès au concert :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li><strong>Problème côté VyBzzZ :</strong> Remboursement ou avoir selon durée d'interruption</li>
              <li><strong>Problème côté utilisateur :</strong> Support technique, pas de remboursement</li>
              <li><strong>Problème côté artiste :</strong> Remboursement au prorata du temps perdu</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">8.3 Report d'événement</h3>
            <p className="text-gray-700">
              En cas de report, le billet reste valable pour la nouvelle date. Si l'acheteur ne peut
              assister à la nouvelle date, un remboursement peut être demandé dans les 48h suivant
              l'annonce du report.
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 9 - Facturation</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.1 Facture</h3>
            <p className="text-gray-700">
              Une facture électronique est disponible dans le compte utilisateur et envoyée par email
              après chaque achat.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">9.2 Conservation</h3>
            <p className="text-gray-700">
              Les factures sont conservées pendant 10 ans conformément à la réglementation comptable française.
            </p>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 10 - Réclamations</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10.1 Service client</h3>
            <p className="text-gray-700">
              Pour toute réclamation :
            </p>
            <address className="not-italic text-gray-700 mt-2">
              Email : support@vybzzz.com<br />
              Formulaire de contact sur la plateforme<br />
              Délai de réponse : 48 heures ouvrées
            </address>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">10.2 Médiation</h3>
            <p className="text-gray-700">
              En cas de litige non résolu, l'acheteur peut saisir gratuitement le médiateur de la
              consommation dont relève VyBzzZ :
            </p>
            <address className="not-italic text-gray-700 mt-2">
              [Nom du médiateur]<br />
              [Adresse]<br />
              [Site web]
            </address>
          </section>

          {/* Article 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 11 - Responsabilité</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">11.1 Limitation de responsabilité</h3>
            <p className="text-gray-700">
              VyBzzZ agit en tant qu'intermédiaire technique. La responsabilité du contenu diffusé
              incombe aux artistes. VyBzzZ ne peut être tenu responsable :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-2">
              <li>De la qualité artistique du concert</li>
              <li>Du non-respect des horaires par l'artiste</li>
              <li>Des interruptions dues à la connexion de l'artiste</li>
              <li>De l'incompatibilité du matériel de l'acheteur</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">11.2 Force majeure</h3>
            <p className="text-gray-700">
              VyBzzZ ne saurait être tenu responsable en cas de force majeure ou d'événement
              imprévisible et insurmontable.
            </p>
          </section>

          {/* Article 12 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 12 - Données Personnelles</h2>
            <p className="text-gray-700">
              Le traitement des données personnelles dans le cadre des commandes est conforme au RGPD.
              Voir notre{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Politique de Confidentialité
              </Link>
              .
            </p>
          </section>

          {/* Article 13 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 13 - Loi Applicable</h2>
            <p className="text-gray-700">
              Les présentes CGV sont soumises au droit français. Tout litige sera de la compétence
              exclusive des tribunaux français.
            </p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Retour à l'accueil
          </Link>
          <Link href="/terms" className="text-blue-600 hover:underline">
            Voir les CGU →
          </Link>
        </div>
      </div>
    </div>
  )
}
