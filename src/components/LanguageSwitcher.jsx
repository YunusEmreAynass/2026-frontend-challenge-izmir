import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value);
    };

    return (
        <div className="flex items-center gap-2 text-gray-300">
            <Globe size={18} />
            <select
                value={i18n.language}
                onChange={handleLanguageChange}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
            >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher;
