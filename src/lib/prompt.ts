import { GENRE_MAP, type Genre, type LengthId, LENGTHS } from './genres'

const LEN_WORDS: Record<LengthId, string> = Object.fromEntries(
  LENGTHS.map((l) => [l.id, l.words]),
) as Record<LengthId, string>

export interface GenParams {
  genre: Genre
  topic: string
  style?: string
  tone?: string
  length?: LengthId
}

/** System prompt for a genre + style. Pure. */
export function systemFor(genre: Genre, style?: string): string {
  const base = GENRE_MAP[genre]?.system ?? GENRE_MAP.story.system
  if (!style) return base
  return `${base} Write in a ${style} style.`
}

/** Build the user prompt for a fresh generation. Pure, deterministic. */
export function buildGeneratePrompt(p: GenParams): string {
  const g = GENRE_MAP[p.genre]?.label ?? 'piece'
  const parts = [`Write a ${g.toLowerCase()} about: ${p.topic.trim()}.`]
  if (p.tone) parts.push(`Tone: ${p.tone}.`)
  if (p.length) parts.push(`Target length: ${LEN_WORDS[p.length]}.`)
  parts.push('Output only the piece itself, no preamble or commentary.')
  return parts.join(' ')
}

/** Build the continue-writing prompt from existing text. Pure. */
export function buildContinuePrompt(existing: string, hint?: string): string {
  const trimmed = existing.trim()
  const tail = trimmed.length > 4000 ? trimmed.slice(-4000) : trimmed
  const parts = [
    'Continue the following text seamlessly from where it stops. Match its voice, tense, and style. Do not repeat what is already written; only add what comes next.',
  ]
  if (hint) parts.push(`Direction: ${hint}.`)
  parts.push(`\n\n---\n${tail}\n---\n\nContinuation:`)
  return parts.join(' ')
}

/** Build the rewrite/restyle prompt. Pure. */
export function buildRewritePrompt(text: string, style: string, tone?: string): string {
  const parts = [
    `Rewrite the following text in a ${style} style${tone ? `, with a ${tone} tone` : ''}. Preserve its meaning and intent but transform its voice. Output only the rewritten text.`,
    `\n\n---\n${text.trim()}\n---`,
  ]
  return parts.join(' ')
}

export function wordCount(s: string): number {
  const m = s.trim().match(/\S+/g)
  return m ? m.length : 0
}
