import data from './content.json';
export type SiteContent = typeof data;
const required: (keyof SiteContent)[] = ['meta','brand','navigation','hero','dashboard','logos','features','solutions','pricing','cta','footer'];
const missing = required.filter((key) => data[key] == null);
if (missing.length) throw new Error(`Invalid content.json. Missing sections: ${missing.join(', ')}`);
export const content: SiteContent = data;
