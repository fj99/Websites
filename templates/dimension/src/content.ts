import data from './content.json';

export type SiteContent = typeof data;
const keys: (keyof SiteContent)[] = ['meta', 'brand', 'navigation', 'hero', 'worlds', 'manifesto', 'work', 'process', 'contact', 'footer'];
const missing = keys.filter((key) => data[key] == null);
if (missing.length) throw new Error(`Invalid content.json. Missing sections: ${missing.join(', ')}`);

export const content: SiteContent = data;
