import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Optional PostCSS configuration for applications that need it
export const postcssConfig = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

