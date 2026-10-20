/**
 * Demo mode shows sample job openings, announcements and news instead of the live UN Careers
 * feeds. It is the default; set VITE_JOBS_MODE=live (e.g. in .env.local) for real data.
 */
export const DEMO_MODE = (import.meta.env.VITE_JOBS_MODE ?? 'demo') === 'demo';
