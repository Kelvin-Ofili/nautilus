// Runtime configuration - injected by Vercel at deployment
(function() {
  if (typeof window !== 'undefined') {
    window.VITE_API_URL = process.env.VITE_API_URL || '';
  }
})();
