export const getCdnUrl = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Avoid double-prefixing if already full URL
  const cdnUrl = import.meta.env.VITE_CDN_URL || '';
  return `${cdnUrl}/${path.replace(/^\/+/, '')}`;
};
