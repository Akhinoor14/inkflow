'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';
import type { Language } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-gray-500 dark:text-gray-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 outline-none hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <option value="en">English</option>
        <option value="bn">বাংলা</option>
      </select>
    </div>
  );
}
