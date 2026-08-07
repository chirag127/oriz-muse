import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { chat } from '@chirag127/oz-ai'
import { downloadBlob, readAsText } from '@chirag127/oz-file'
import {
  GENRES,
  type Genre,
  type LengthId,
  LENGTHS,
  STYLES,
  TONES,
} from '../lib/genres'
import { libraryFor, PROMPT_LIBRARY } from '../lib/library'
import {
  buildContinuePrompt,
  buildGeneratePrompt,
  buildRewritePrompt,
  systemFor,
  wordCount,
} from '../lib/prompt'
import {
  type Draft,
  deleteDraft,
  deriveTitle,
  listDrafts,
  newId,
  saveDraft,
} from '../lib/drafts'

type Mode = 'generate' | 'continue' | 'rewrite'

// lazy marked — only pulled in when preview is toggled
let markedFn: ((s: string) => string) | null = null
async function renderMd(src: string): Promise<string> {
  if (!markedFn) {
    const mod = await import('marked')
    markedFn = (s: string) => mod.marked.parse(s, { async: false }) as string
  }
  return markedFn(src)
}

export default function Studio() {
  const [genre, setGenre] = useState<Genre>('story')
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState('')
  const [tone, setTone] = useState('')
  const [length, setLength] = useState<LengthId>('medium')
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<Mode>('generate')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [model, setModel] = useState<string>('') // '' = auto
  const abortRef = useRef<AbortController | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const lib = useMemo(() => libraryFor(genre), [genre])
  const words = useMemo(() => wordCount(content), [content])

  const refreshDrafts = useCallback(() => {
    listDrafts().then(setDrafts).catch(() => {})
  }, [])

  useEffect(() => {
    refreshDrafts()
  }, [refreshDrafts])

  useEffect(() => {
    if (!preview) return
    let live = true
    renderMd(content).then((h) => {
      if (live) setPreviewHtml(h)
    })
    return () => {
      live = false
    }
  }, [preview, content])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setBusy(false)
  }, [])

  const runStream = useCallback(
    async (system: string, prompt: string, append: boolean) => {
      setError('')
      setBusy(true)
      const ac = new AbortController()
      abortRef.current = ac
      const start = append ? `${content}${content && !content.endsWith('\n') ? '\n\n' : ''}` : ''
      if (!append) setContent('')
      let acc = start
      try {
        const stream = await chat([{ role: 'user', content: prompt }], {
          system,
          stream: true,
          signal: ac.signal,
          ...(model ? { model } : {}),
        })
        for await (const delta of stream) {
          acc += delta
          setContent(acc)
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (msg !== 'aborted')
          setError('AI providers are busy. Your text is safe — try again, or keep writing by hand.')
      } finally {
        setBusy(false)
        abortRef.current = null
      }
    },
    [content, model],
  )

  const onGenerate = useCallback(() => {
    if (!topic.trim() || busy) return
    setMode('generate')
    runStream(
      systemFor(genre, style),
      buildGeneratePrompt({ genre, topic, style, tone, length }),
      false,
    )
  }, [busy, genre, length, runStream, style, tone, topic])

  const onContinue = useCallback(() => {
    if (!content.trim() || busy) return
    setMode('continue')
    runStream(systemFor(genre, style), buildContinuePrompt(content, topic || undefined), true)
  }, [busy, content, genre, runStream, style, topic])

  const onRewrite = useCallback(() => {
    if (!content.trim() || busy || !style) return
    setMode('rewrite')
    runStream(systemFor(genre, style), buildRewritePrompt(content, style, tone), false)
  }, [busy, content, genre, runStream, style, tone])

  const onSave = useCallback(async () => {
    if (!content.trim()) return
    const id = activeId ?? newId()
    const existing = drafts.find((d) => d.id === id)
    const rec = await saveDraft({
      id,
      genre,
      content,
      title: deriveTitle(content),
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    })
    setActiveId(rec.id)
    refreshDrafts()
  }, [activeId, content, drafts, genre, refreshDrafts])

  const onNew = useCallback(() => {
    stop()
    setContent('')
    setActiveId(null)
    setTopic('')
    setError('')
    editorRef.current?.focus()
  }, [stop])

  const onLoad = useCallback((d: Draft) => {
    stop()
    setActiveId(d.id)
    setGenre(d.genre)
    setContent(d.content)
    setError('')
  }, [stop])

  const onDelete = useCallback(
    async (id: string) => {
      await deleteDraft(id)
      if (activeId === id) setActiveId(null)
      refreshDrafts()
    },
    [activeId, refreshDrafts],
  )

  const onExport = useCallback(() => {
    if (!content.trim()) return
    const name = `${deriveTitle(content, 'oriz-muse').replace(/[^\w-]+/g, '-')}.md`
    downloadBlob(new Blob([content], { type: 'text/markdown' }), name)
  }, [content])

  const onImport = useCallback(async (file: File) => {
    const text = await readAsText(file)
    setContent(text)
    setActiveId(null)
  }, [])

  const [drag, setDrag] = useState(false)
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDrag(false)
      const f = e.dataTransfer.files?.[0]
      if (f) onImport(f)
    },
    [onImport],
  )

  return (
    <div className="studio" onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
      <aside className="studio__panel">
        <fieldset className="ctl">
          <legend>Genre</legend>
          <div className="chips">
            {GENRES.map((g) => (
              <button key={g.id} type="button" className={`chip${genre === g.id ? ' chip--on' : ''}`} onClick={() => setGenre(g.id)} title={g.blurb}>
                {g.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="ctl">
          <span>Topic / seed</span>
          <textarea ref={editorRef} className="ctl__topic" rows={3} value={topic} placeholder="a lighthouse keeper, the last night of summer…" onChange={(e) => setTopic(e.target.value)} />
        </label>

        <div className="ctl ctl--row">
          <label className="ctl__sel">
            <span>Style</span>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="">— auto —</option>
              {STYLES.map((s) => (<option key={s.id} value={s.label}>{s.label}</option>))}
            </select>
          </label>
          <label className="ctl__sel">
            <span>Tone</span>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="">— auto —</option>
              {TONES.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </label>
        </div>

        <fieldset className="ctl">
          <legend>Length</legend>
          <div className="chips">
            {LENGTHS.map((l) => (
              <button key={l.id} type="button" className={`chip${length === l.id ? ' chip--on' : ''}`} onClick={() => setLength(l.id)} title={l.words}>
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="studio__acts">
          {!busy ? (
            <button type="button" className="btn btn--go" onClick={onGenerate} disabled={!topic.trim()}>Generate</button>
          ) : (
            <button type="button" className="btn btn--stop" onClick={stop}>Stop</button>
          )}
          <button type="button" className="btn" onClick={onContinue} disabled={busy || !content.trim()}>Continue</button>
          <button type="button" className="btn" onClick={onRewrite} disabled={busy || !content.trim() || !style} title={!style ? 'Pick a style to rewrite' : 'Rewrite in the chosen style'}>Rewrite</button>
        </div>

        <details className="lib">
          <summary>Prompt library ({lib.length || PROMPT_LIBRARY.length})</summary>
          <ul>
            {(lib.length ? lib : PROMPT_LIBRARY).map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => { setGenre(p.genre); setTopic(p.prompt) }}>
                  <strong>{p.title}</strong>
                  <em>{p.prompt}</em>
                </button>
              </li>
            ))}
          </ul>
        </details>

        <details className="lib">
          <summary>Model (optional)</summary>
          <input className="ctl__model" type="text" value={model} placeholder="auto — leave blank" onChange={(e) => setModel(e.target.value)} />
          <p className="hint">Blank = auto-router with failover across g4f providers.</p>
        </details>
      </aside>

      <section className="studio__main">
        <div className="studio__bar">
          <span className="studio__count">{words} word{words === 1 ? '' : 's'}{busy ? ` · ${mode}…` : ''}</span>
          <div className="studio__tools">
            <button type="button" className="btn btn--sm" onClick={() => setPreview((p) => !p)} disabled={!content.trim()}>{preview ? 'Edit' : 'Preview'}</button>
            <button type="button" className="btn btn--sm" onClick={onSave} disabled={!content.trim()}>Save</button>
            <button type="button" className="btn btn--sm" onClick={onExport} disabled={!content.trim()}>Export .md</button>
            <button type="button" className="btn btn--sm" onClick={onNew}>New</button>
          </div>
        </div>

        {error && <p className="studio__err" role="alert">{error}</p>}

        {preview ? (
          <article className="studio__preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        ) : (
          <textarea
            className={`studio__editor${busy ? ' studio__editor--flow' : ''}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your page begins here. Pick a genre, seed a topic, and Generate — or just start writing and let the muse Continue."
            aria-label="Writing canvas"
          />
        )}
        {drag && <div className="studio__drop">Drop a .md or .txt to load it</div>}
      </section>

      <aside className="studio__drafts">
        <h2>Drafts</h2>
        {drafts.length === 0 ? (
          <p className="hint">No saved drafts yet. Write something, then Save — it stays in this browser only.</p>
        ) : (
          <ul>
            {drafts.map((d) => (
              <li key={d.id} className={d.id === activeId ? 'on' : ''}>
                <button type="button" className="draft__open" onClick={() => onLoad(d)}>
                  <strong>{d.title}</strong>
                  <span>{d.genre} · {new Date(d.updatedAt).toLocaleDateString()}</span>
                </button>
                <button type="button" className="draft__del" aria-label={`Delete ${d.title}`} onClick={() => onDelete(d.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  )
}
