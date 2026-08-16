// tailwind.config.ts
// NOTE: In Tailwind CSS v4, theme customisation is done in globals.css via @theme {}.
// This file is kept for the @tailwindcss/forms plugin ONLY.
// All color/font/animation tokens have been moved to src/app/globals.css.
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [
    forms,
  ],
};

export default config;