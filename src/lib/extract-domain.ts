export function extractDomain(url?: string): string {
  if (!url) return "";

  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
