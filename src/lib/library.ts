import type { Genre } from './genres'

export interface PromptSeed {
  id: string
  genre: Genre
  title: string
  prompt: string
}

/** Curated starter prompts — the prompt library. Pure data. */
export const PROMPT_LIBRARY: PromptSeed[] = [
  { id: 'p1', genre: 'story', title: 'The last lighthouse', prompt: 'the keeper of the last working lighthouse on a drowned coast, and the night a stranger climbs the stairs' },
  { id: 'p2', genre: 'story', title: 'Letters never sent', prompt: 'a drawer of letters written but never posted, discovered by the person they were meant for' },
  { id: 'p3', genre: 'story', title: 'The clockmaker’s debt', prompt: 'a clockmaker who can trade minutes of his own life to mend broken timepieces' },
  { id: 'p4', genre: 'poem', title: 'Rain on old glass', prompt: 'rain against an old windowpane, and everything it reminds you of' },
  { id: 'p5', genre: 'poem', title: 'Inheritance', prompt: 'the small, wordless things we inherit from the people who raised us' },
  { id: 'p6', genre: 'poem', title: 'The blue hour', prompt: 'the blue hour between night and dawn, when the world is neither asleep nor awake' },
  { id: 'p7', genre: 'lyrics', title: 'Neon and rain', prompt: 'a late-night city ballad about chasing someone through neon and rain' },
  { id: 'p8', genre: 'lyrics', title: 'Homecoming', prompt: 'an anthem about returning to a town that has changed while you were away' },
  { id: 'p9', genre: 'blog', title: 'Why slow mornings matter', prompt: 'why unhurried mornings quietly reshape the rest of your day' },
  { id: 'p10', genre: 'blog', title: 'The craft of noticing', prompt: 'how learning to notice small details makes you a better writer and a happier person' },
  { id: 'p11', genre: 'essay', title: 'On keeping notebooks', prompt: 'the strange, private value of keeping notebooks no one else will read' },
  { id: 'p12', genre: 'essay', title: 'The comfort of ritual', prompt: 'why humans reach for ritual in times of uncertainty' },
  { id: 'p13', genre: 'screenplay', title: 'Two strangers, one platform', prompt: 'two strangers share a train platform at 3am and one of them has just made a decision that changes everything' },
  { id: 'p14', genre: 'story', title: 'The map that redraws itself', prompt: 'a map that quietly redraws itself each night to match places that no longer exist' },
]

export function libraryFor(genre: Genre): PromptSeed[] {
  return PROMPT_LIBRARY.filter((p) => p.genre === genre)
}
