/**
 * Social Sharing Utility for Phase 5
 */
export const socialShare = {
  whatsapp: (tripName, url) => {
    const text = encodeURIComponent(`Check out my travel plan for ${tripName} on TraveLoop! ✈️\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  },
  
  twitter: (tripName, url) => {
    const text = encodeURIComponent(`Planning my next adventure: ${tripName} on @TraveLoop 🌍`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  },
  
  copyToClipboard: (url) => {
    return navigator.clipboard.writeText(url);
  }
};
