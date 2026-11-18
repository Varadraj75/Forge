export const THEME_STORAGE_KEY = "forge-theme";

export const themeInitScript = `
(function() {
  var stored = null;
  try {
    stored = localStorage.getItem('${THEME_STORAGE_KEY}');
  } catch (e) {}

  var prefersDark = false;
  try {
    prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (e) {}

  var isDark = stored === 'dark' || (!stored && prefersDark);
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();
`;
