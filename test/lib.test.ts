import { describe, expect, it } from 'vitest'
import { deriveTitle, newId } from '../src/lib/drafts'
import { GENRES, GENRE_MAP } from '../src/lib/genres'
import { libraryFor, PROMPT_LIBRARY } from '../src/lib/library'

describe('deriveTitle', () => {
  it('uses first non-empty line', () => {
    expect(deriveTitle('\n\nThe Storm\nmore text')).toBe('The Storm')
  })
  it('strips markdown heading marks', () => {
    expect(deriveTitle('# Chapter One')).toBe('Chapter One')
  })
  it('truncates long titles', () => {
    const t = deriveTitle('a'.repeat(100))
    expect(t.length).toBeLessThanOrEqual(60)
    expect(t.endsWith('…')).toBe(true)
  })
  it('falls back when empty', () => {
    expect(deriveTitle('   ', 'X')).toBe('X')
  })
})

describe('newId', () => {
  it('produces unique ids', () => {
    expect(newId()).not.toBe(newId())
  })
})

describe('genres', () => {
  it('every genre has a system prompt and map entry', () => {
    for (const g of GENRES) {
      expect(g.system.length).toBeGreaterThan(10)
      expect(GENRE_MAP[g.id]).toBe(g)
    }
  })
})

describe('library', () => {
  it('filters by genre', () => {
    const poems = libraryFor('poem')
    expect(poems.length).toBeGreaterThan(0)
    expect(poems.every((p) => p.genre === 'poem')).toBe(true)
  })
  it('all seeds have unique ids', () => {
    const ids = new Set(PROMPT_LIBRARY.map((p) => p.id))
    expect(ids.size).toBe(PROMPT_LIBRARY.length)
  })
})
