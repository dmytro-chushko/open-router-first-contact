import { THEME_STORAGE_KEY } from './theme-storage';

/**
 * Synchronous boot script: keep in sync with `ThemeProvider` DOM updates.
 * Injected via `next/script` with `beforeInteractive`.
 */
export const THEME_INLINE_SCRIPT = `(function(){var k=${JSON.stringify(THEME_STORAGE_KEY)};function r(p){if(p==="dark")return"dark";if(p==="light")return"light";try{return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){return"light"}}try{var v=localStorage.getItem(k);if(v!=="light"&&v!=="dark"&&v!=="system")v="system";var x=r(v),root=document.documentElement;root.classList.toggle("dark",x==="dark");root.style.colorScheme=x==="dark"?"dark":"light";root.setAttribute("data-theme",v)}catch(e){}})();`;
