import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import { Language } from '@/types';
import i18n from 'i18next';

const translations = {
  en: {
    common: {
      home: 'Home',
      discover: 'Discover',
      create: 'Create',
      tickets: 'Tickets',
      profile: 'Profile',
      settings: 'Settings',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      premium: 'Premium',
      pro: 'Pro',
      free: 'Free',
    },
    settings: {
      title: 'Settings',
      account: 'Account',
      preferences: 'Preferences',
      support: 'Support',
      editProfile: 'Edit Profile',
      privacy: 'Privacy',
      paymentMethods: 'Payment Methods',
      darkMode: 'Dark Mode',
      notifications: 'Notifications',
      language: 'Language',
      helpCenter: 'Help Center',
      terms: 'Terms & Privacy',
      logout: 'Log Out',
      userAccess: 'User Access',
      upgradeToPremium: 'Upgrade to Premium',
      referralProgram: 'Referral Program',
      proDashboard: 'Pro Dashboard',
      aiAssistant: 'AI Assistant',
    },
    premium: {
      title: 'Upgrade to Premium',
      subtitle: 'Remove ads and unlock exclusive features',
      features: {
        noAds: 'Ad-free experience',
        exclusiveContent: 'Exclusive content access',
        prioritySupport: 'Priority customer support',
        advancedFilters: 'Advanced search filters',
        unlimitedDownloads: 'Unlimited video downloads',
      },
      monthly: 'Monthly',
      yearly: 'Yearly',
      subscribe: 'Subscribe Now',
    },
    referral: {
      title: 'Do you know our next star?',
      subtitle: 'Invite friends and earn rewards',
      yourCode: 'Your Referral Code',
      earnings: 'Total Earnings',
      inviteFriends: 'Invite Friends',
      shareCode: 'Share Your Code',
      howItWorks: 'How it works',
      step1: 'Share your unique code',
      step2: 'Friends sign up using your code',
      step3: 'Earn rewards for each referral',
    },
    chat: {
      title: 'AI Assistant',
      placeholder: 'Ask me anything about Vybzzz...',
      send: 'Send',
      thinking: 'Thinking...',
      suggestions: {
        howToUpload: 'How do I upload a video?',
        findEvents: 'How can I find events near me?',
        buyTickets: 'How do I buy tickets?',
        becomeArtist: 'How can I become a verified artist?',
      },
    },
    dashboard: {
      title: 'Pro Dashboard',
      artist: 'Artist Dashboard',
      businessIntroducer: 'Business Introducer',
      regionalManager: 'Regional Manager',
      stats: 'Statistics',
      revenue: 'Revenue',
      views: 'Views',
      followers: 'Followers',
      engagement: 'Engagement',
      monthlyGrowth: 'Monthly Growth',
    },
  },
  fr: {
    common: {
      home: 'Accueil',
      discover: 'Découvrir',
      create: 'Créer',
      tickets: 'Billets',
      profile: 'Profil',
      settings: 'Paramètres',
      back: 'Retour',
      save: 'Enregistrer',
      cancel: 'Annuler',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      premium: 'Premium',
      pro: 'Pro',
      free: 'Gratuit',
    },
    settings: {
      title: 'Paramètres',
      account: 'Compte',
      preferences: 'Préférences',
      support: 'Support',
      editProfile: 'Modifier le profil',
      privacy: 'Confidentialité',
      paymentMethods: 'Moyens de paiement',
      darkMode: 'Mode sombre',
      notifications: 'Notifications',
      language: 'Langue',
      helpCenter: 'Centre d\'aide',
      terms: 'Conditions et confidentialité',
      logout: 'Se déconnecter',
      userAccess: 'Accès utilisateur',
      upgradeToPremium: 'Passer à Premium',
      referralProgram: 'Programme de parrainage',
      proDashboard: 'Tableau de bord Pro',
      aiAssistant: 'Assistant IA',
    },
    premium: {
      title: 'Passer à Premium',
      subtitle: 'Supprimez les publicités et débloquez des fonctionnalités exclusives',
      features: {
        noAds: 'Expérience sans publicité',
        exclusiveContent: 'Accès au contenu exclusif',
        prioritySupport: 'Support client prioritaire',
        advancedFilters: 'Filtres de recherche avancés',
        unlimitedDownloads: 'Téléchargements vidéo illimités',
      },
      monthly: 'Mensuel',
      yearly: 'Annuel',
      subscribe: 'S\'abonner maintenant',
    },
    referral: {
      title: 'Connaissez-vous notre prochaine star ?',
      subtitle: 'Invitez des amis et gagnez des récompenses',
      yourCode: 'Votre code de parrainage',
      earnings: 'Gains totaux',
      inviteFriends: 'Inviter des amis',
      shareCode: 'Partager votre code',
      howItWorks: 'Comment ça marche',
      step1: 'Partagez votre code unique',
      step2: 'Les amis s\'inscrivent avec votre code',
      step3: 'Gagnez des récompenses pour chaque parrainage',
    },
    chat: {
      title: 'Assistant IA',
      placeholder: 'Demandez-moi tout sur Vybzzz...',
      send: 'Envoyer',
      thinking: 'Réflexion...',
      suggestions: {
        howToUpload: 'Comment télécharger une vidéo ?',
        findEvents: 'Comment trouver des événements près de moi ?',
        buyTickets: 'Comment acheter des billets ?',
        becomeArtist: 'Comment devenir un artiste vérifié ?',
      },
    },
    dashboard: {
      title: 'Tableau de bord Pro',
      artist: 'Tableau de bord artiste',
      businessIntroducer: 'Apporteur d\'affaires',
      regionalManager: 'Gestionnaire régional',
      stats: 'Statistiques',
      revenue: 'Revenus',
      views: 'Vues',
      followers: 'Abonnés',
      engagement: 'Engagement',
      monthlyGrowth: 'Croissance mensuelle',
    },
  },
  es: {
    common: {
      home: 'Inicio',
      discover: 'Descubrir',
      create: 'Crear',
      tickets: 'Entradas',
      profile: 'Perfil',
      settings: 'Configuración',
      back: 'Atrás',
      save: 'Guardar',
      cancel: 'Cancelar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      premium: 'Premium',
      pro: 'Pro',
      free: 'Gratis',
    },
    settings: {
      title: 'Configuración',
      account: 'Cuenta',
      preferences: 'Preferencias',
      support: 'Soporte',
      editProfile: 'Editar perfil',
      privacy: 'Privacidad',
      paymentMethods: 'Métodos de pago',
      darkMode: 'Modo oscuro',
      notifications: 'Notificaciones',
      language: 'Idioma',
      helpCenter: 'Centro de ayuda',
      terms: 'Términos y privacidad',
      logout: 'Cerrar sesión',
      userAccess: 'Acceso de usuario',
      upgradeToPremium: 'Actualizar a Premium',
      referralProgram: 'Programa de referidos',
      proDashboard: 'Panel Pro',
      aiAssistant: 'Asistente IA',
    },
    premium: {
      title: 'Actualizar a Premium',
      subtitle: 'Elimina anuncios y desbloquea funciones exclusivas',
      features: {
        noAds: 'Experiencia sin anuncios',
        exclusiveContent: 'Acceso a contenido exclusivo',
        prioritySupport: 'Soporte al cliente prioritario',
        advancedFilters: 'Filtros de búsqueda avanzados',
        unlimitedDownloads: 'Descargas de video ilimitadas',
      },
      monthly: 'Mensual',
      yearly: 'Anual',
      subscribe: 'Suscribirse ahora',
    },
    referral: {
      title: '¿Conoces a nuestra próxima estrella?',
      subtitle: 'Invita amigos y gana recompensas',
      yourCode: 'Tu código de referido',
      earnings: 'Ganancias totales',
      inviteFriends: 'Invitar amigos',
      shareCode: 'Compartir tu código',
      howItWorks: 'Cómo funciona',
      step1: 'Comparte tu código único',
      step2: 'Los amigos se registran usando tu código',
      step3: 'Gana recompensas por cada referido',
    },
    chat: {
      title: 'Asistente IA',
      placeholder: 'Pregúntame cualquier cosa sobre Vybzzz...',
      send: 'Enviar',
      thinking: 'Pensando...',
      suggestions: {
        howToUpload: '¿Cómo subo un video?',
        findEvents: '¿Cómo puedo encontrar eventos cerca de mí?',
        buyTickets: '¿Cómo compro entradas?',
        becomeArtist: '¿Cómo puedo convertirme en un artista verificado?',
      },
    },
    dashboard: {
      title: 'Panel Pro',
      artist: 'Panel de artista',
      businessIntroducer: 'Introductor de negocios',
      regionalManager: 'Gerente regional',
      stats: 'Estadísticas',
      revenue: 'Ingresos',
      views: 'Visualizaciones',
      followers: 'Seguidores',
      engagement: 'Compromiso',
      monthlyGrowth: 'Crecimiento mensual',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  const loadLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app-language');
      if (savedLanguage) {
        const language = savedLanguage as Language;
        setCurrentLanguage(language);
        await i18n.changeLanguage(language);
      } else {
        const deviceLanguage = Localization.getLocales()[0]?.languageCode?.split('-')[0] as Language;
        const supportedLanguages: Language[] = ['en', 'fr', 'es', 'de', 'it', 'pt'];
        const language = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';
        setCurrentLanguage(language);
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem('app-language', language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const changeLanguage = useCallback(async (language: Language) => {
    try {
      setCurrentLanguage(language);
      i18n.changeLanguage(language);
      await AsyncStorage.setItem('app-language', language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  const t = useCallback((key: string) => i18n.t(key), []);

  return useMemo(() => ({
    currentLanguage,
    changeLanguage,
    t,
    isLoading,
  }), [currentLanguage, changeLanguage, t, isLoading]);
});