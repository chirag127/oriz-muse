import { describe, expect, it } from 'vitest'
import {
  buildContinuePrompt,
  buildGeneratePrompt,
  buildRewritePrompt,
  systemFor,
  wordCount,
} from '../src/lib/prompt'

describe('systemFor', () => {
  it('returns genre system prompt', () => {
    expect(systemFor('poem')).toContain('poet')
  })
  it('appends style when given', () => {
    expect(systemFor('story', 'Noir')).toContain('Noir style')
  })
  it('falls back to story for unknown genre', () => {
    // @ts-expect-error testing bad input
    expect(systemFor('nope')).toContain('fiction')
  })
})

describe('buildGeneratePrompt', () => {
  it('includes topic, tone, length', () => {
    const p = buildGeneratePrompt({ genre: 'blog', topic: 'slow mornings', tone: 'hopeful', length: 'short' })
    expect(p).toContain('slow mornings')
    expect(p).toContain('hopeful')
    expect(p).toContain('~120 words')
    expect(p.toLowerCase()).toContain('blog')
  })
  it('omits optional fields cleanly', () => {
    const p = buildGeneratePrompt({ genre: 'poem', topic: 'rain' })
    expect(p).toContain('rain')
    expect(p).not.toContain('Tone:')
  })
})

describe('buildContinuePrompt', () => {
  it('embeds existing text and asks to continue', () => {
    const p = buildContinuePrompt('Once upon a time.')
    expect(p).toContain('Once upon a time.')
    expect(p).toContain('Continue')
  })
  it('truncates to last 4000 chars', () => {
    const long = 'x'.repeat(5000)
    const p = buildContinuePrompt(long)
    expect(p).not.toContain('x'.repeat(4001))
    expect(p).toContain('x'.repeat(4000))
  })
  it('adds direction hint', () => {
    expect(buildContinuePrompt('a', 'make it darker')).toContain('make it darker')
  })
})

describe('buildRewritePrompt', () => {
  it('names the style and includes text', () => {
    const p = buildRewritePrompt('Hello world.', 'Gothic', 'melancholic')
    expect(p).toContain('Gothic style')
    expect(p).toContain('melancholic tone')
    expect(p).toContain('Hello world.')
  })
})

describe('wordCount', () => {
  it('counts words', () => {
    expect(wordCount('one two three')).toBe(3)
  })
  it('handles empty and whitespace', () => {
    expect(wordCount('   ')).toBe(0)
    expect(wordCount('')).toBe(0)
  })
})
