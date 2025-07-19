
import React, { createContext, useContext, useState } from 'react';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export interface Translations {
  [key: string]: {
    [langCode: string]: string;
  };
}

const translations: Translations = {
  'nav.features': {
    en: 'Features',
    es: 'Características',
    fr: 'Fonctionnalités',
    de: 'Funktionen',
    it: 'Caratteristiche',
    pt: 'Recursos',
    zh: '功能',
    ja: '機能'
  },
  'nav.pricing': {
    en: 'Pricing',
    es: 'Precios',
    fr: 'Tarifs',
    de: 'Preise',
    it: 'Prezzi',
    pt: 'Preços',
    zh: '价格',
    ja: '価格'
  },
  'nav.login': {
    en: 'Login',
    es: 'Iniciar sesión',
    fr: 'Connexion',
    de: 'Anmelden',
    it: 'Accedi',
    pt: 'Entrar',
    zh: '登录',
    ja: 'ログイン'
  },
  'nav.videoHelp': {
    en: 'Video Help',
    es: 'Ayuda en video',
    fr: 'Aide vidéo',
    de: 'Video-Hilfe',
    it: 'Aiuto video',
    pt: 'Ajuda em vídeo',
    zh: '视频帮助',
    ja: 'ビデオヘルプ'
  },
  'nav.startTrial': {
    en: 'Start Free Trial',
    es: 'Iniciar prueba gratuita',
    fr: 'Essai gratuit',
    de: 'Kostenlose Testversion',
    it: 'Prova gratuita',
    pt: 'Teste grátis',
    zh: '开始免费试用',
    ja: '無料トライアル開始'
  },
  'features.title': {
    en: 'Comprehensive Documentation Tools',
    es: 'Herramientas de documentación integrales',
    fr: 'Outils de documentation complets',
    de: 'Umfassende Dokumentationstools',
    it: 'Strumenti di documentazione completi',
    pt: 'Ferramentas de documentação abrangentes',
    zh: '全面的文档工具',
    ja: '包括的なドキュメントツール'
  },
  'features.viewAll': {
    en: 'View All Features',
    es: 'Ver todas las características',
    fr: 'Voir toutes les fonctionnalités',
    de: 'Alle Funktionen anzeigen',
    it: 'Vedi tutte le caratteristiche',
    pt: 'Ver todos os recursos',
    zh: '查看所有功能',
    ja: 'すべての機能を見る'
  },
  'nav.dashboard': {
    en: 'Dashboard',
    es: 'Tablero',
    fr: 'Tableau de bord',
    de: 'Dashboard',
    it: 'Dashboard',
    pt: 'Painel',
    zh: '仪表板',
    ja: 'ダッシュボード'
  },
  'nav.signOut': {
    en: 'Sign Out',
    es: 'Cerrar sesión',
    fr: 'Se déconnecter',
    de: 'Abmelden',
    it: 'Disconnetti',
    pt: 'Sair',
    zh: '退出',
    ja: 'サインアウト'
  },
  'nav.getStarted': {
    en: 'Get Started',
    es: 'Comenzar',
    fr: 'Commencer',
    de: 'Loslegen',
    it: 'Inizia',
    pt: 'Começar',
    zh: '开始使用',
    ja: '始める'
  },
  'nav.account': {
    en: 'Account',
    es: 'Cuenta',
    fr: 'Compte',
    de: 'Konto',
    it: 'Account',
    pt: 'Conta',
    zh: '账户',
    ja: 'アカウント'
  }
};

interface TranslationContextType {
  currentLanguage: Language;
  translate: (key: string) => string;
  changeLanguage: (language: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  const translate = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[currentLanguage.code] || translation['en'] || key;
  };

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    console.log(`Language changed to: ${language.name}`);
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, translate, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
