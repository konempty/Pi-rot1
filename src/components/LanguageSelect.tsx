import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { LANGUAGES, translations, type Language } from '../lib/i18n'

type LanguageSelectProps = {
  language: Language
  onChange: (language: Language) => void
}

export function LanguageSelect({ language, onChange }: LanguageSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const current = LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0]

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  return (
    <div className="language-select" ref={rootRef}>
      <button
        className="language-select-trigger"
        type="button"
        aria-label={translations[language].common.language}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{current.flag}</span>
        <strong>{current.nativeName}</strong>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="language-select-menu" role="menu">
        {LANGUAGES.map((item) => (
          <button
            key={item.code}
            className={item.code === language ? 'is-active' : ''}
            type="button"
            role="menuitemradio"
            aria-checked={item.code === language}
            onClick={() => {
              onChange(item.code)
              setOpen(false)
            }}
          >
            <span aria-hidden="true">{item.flag}</span>
            <strong>{item.nativeName}</strong>
          </button>
        ))}
        </div>
      )}
    </div>
  )
}
