// Runtime configuration - read from meta tag or environment
(function() {
  if (typeof window !== 'undefined') {
    // Try to read from meta tag first (set by Vercel)
    const meta = document.querySelector('meta[name="api-url"]');
    if (meta && meta.content) {
      window.VITE_API_URL = meta.content;
    }
    // If not set, use default (will be overridden by Vercel env vars at build time in client.ts)
    if (!window.VITE_API_URL) {
      window.VITE_API_URL = '';
    }
  }
})();
