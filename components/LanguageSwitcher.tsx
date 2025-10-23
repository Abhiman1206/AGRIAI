
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, switchLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'hi', name: 'HI' },
  ];

  return (
    <div className="flex items-center space-x-1 p-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
            language === lang.code
              ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
