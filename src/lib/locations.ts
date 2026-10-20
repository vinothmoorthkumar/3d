import filters from '../data/un-filters.json';

export type Location = { code: string; name: string; country: string; lat: number; lng: number };

/** Duty stations from the official UN Careers location filter (see scripts/fetch-un-data.mjs). */
export const locations: Location[] = filters.locations;
export const locationByCode = new Map(locations.map((l) => [l.code, l]));
