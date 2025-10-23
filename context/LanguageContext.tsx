
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Helper function to get nested values from an object using a dot-separated key
const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

interface LanguageContextType {
  language: string;
  switchLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/translations/${language}.json`);
        if (!response.ok) {
          throw new Error(`Could not load ${language}.json`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Failed to fetch translations:", error);
        // Fallback to English if the selected language fails to load
        if (language !== 'en') {
          setLanguage('en');
        }
      }
    };

    fetchTranslations();
    localStorage.setItem('language', language);
  }, [language]);

  const switchLanguage = (lang: string) => {
    setLanguage(lang);
  };

  const t = (key: string): string => {
    const translation = getNestedTranslation(translations, key);
    return translation || key; // Return the key itself if translation is not found
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
