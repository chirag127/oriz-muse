export type Genre =
  | 'story'
  | 'poem'
  | 'lyrics'
  | 'blog'
  | 'essay'
  | 'screenplay'

export interface GenreDef {
  id: Genre
  label: string
  blurb: string
  system: string
}

export const GENRES: GenreDef[] = [
  {
    id: 'story',
    label: 'Story',
    blurb: 'Short fiction & scenes',
    system:
      'You are a masterful fiction writer. Write vivid, immersive prose with concrete sensory detail, clear scene, and emotional truth. Show, do not tell.',
  },
  {
    id: 'poem',
    label: 'Poem',
    blurb: 'Verse in any form',
    system:
      'You are a poet with a distinctive voice. Write fresh, image-driven verse. Attend to rhythm, line breaks, and sound. Avoid cliché.',
  },
  {
    id: 'lyrics',
    label: 'Lyrics',
    blurb: 'Songs with structure',
    system:
      'You are a songwriter. Write singable lyrics with clear structure (verse / chorus / bridge). Use a memorable hook and internal rhyme.',
  },
  {
    id: 'blog',
    label: 'Blog',
    blurb: 'Posts & articles',
    system:
      'You are an expert blog writer. Write engaging, well-structured posts with a strong hook, scannable sections, and a clear takeaway. Use Markdown headings.',
  },
  {
    id: 'essay',
    label: 'Essay',
    blurb: 'Argument & reflection',
    system:
      'You are a thoughtful essayist. Build a clear thesis, develop it with reasoning and example, and close with resonance. Precise, unhurried prose.',
  },
  {
    id: 'screenplay',
    label: 'Screenplay',
    blurb: 'Scenes in script form',
    system:
      'You are a screenwriter. Write in standard screenplay format: scene headings, action lines, character cues, and sharp dialogue that reveals character.',
  },
]

export const GENRE_MAP: Record<Genre, GenreDef> = Object.fromEntries(
  GENRES.map((g) => [g.id, g]),
) as Record<Genre, GenreDef>

export interface StyleDef {
  id: string
  label: string
  hint: string
}

export const STYLES: StyleDef[] = [
  { id: 'poetic', label: 'Poetic', hint: 'lyrical, image-rich' },
  { id: 'minimalist', label: 'Minimalist', hint: 'spare, understated' },
  { id: 'noir', label: 'Noir', hint: 'shadowy, hard-boiled' },
  { id: 'whimsical', label: 'Whimsical', hint: 'playful, light' },
  { id: 'gothic', label: 'Gothic', hint: 'dark, romantic, dread' },
  { id: 'academic', label: 'Academic', hint: 'formal, precise' },
  { id: 'conversational', label: 'Conversational', hint: 'warm, casual' },
  { id: 'shakespearean', label: 'Shakespearean', hint: 'early-modern verse' },
  { id: 'hemingway', label: 'Hemingway', hint: 'terse, declarative' },
  { id: 'romantic', label: 'Romantic', hint: 'ardent, sweeping' },
]

export const TONES = [
  'joyful',
  'melancholic',
  'suspenseful',
  'hopeful',
  'ironic',
  'tender',
  'urgent',
  'serene',
] as const

export const LENGTHS = [
  { id: 'short', label: 'Short', words: '~120 words' },
  { id: 'medium', label: 'Medium', words: '~300 words' },
  { id: 'long', label: 'Long', words: '~600 words' },
] as const

export type LengthId = (typeof LENGTHS)[number]['id']
