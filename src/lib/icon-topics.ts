import type { IconName } from './icons';

/**
 * Which drawing stands beside which heading or label (design-system.md 4-9). One drawing per meaning:
 * every "Gear" on the site gets the same headphones, so the picture comes to mean the word.
 */
export const TOPIC_ICON = {
  series: 'books',
  works: 'stylus-hand',       // the Works headings and the "Work" label (Original / Tribute): the hand drawing (2026-11-09)
  character: 'character',
  music: 'cd',
  gear: 'headphones',         // turned slightly, with the cable
  posts: 'phone',             // the posts of a work, and SNS
  contact: 'letter',
  business: 'stylus',        // the pen alone: the hand went to Works (2026-11-09)
} as const satisfies Record<string, IconName>;
export type Topic = keyof typeof TOPIC_ICON;
