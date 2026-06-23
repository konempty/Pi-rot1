import { ChevronLeft } from 'lucide-react'
import { LanguageSelect } from './LanguageSelect'
import { Wordmark } from './PiLogo'
import { translations, type Language } from '../lib/i18n'

type StepHeaderProps = {
  step: number
  total?: number
  onBack?: () => void
  language: Language
  onLanguageChange: (language: Language) => void
}

export function StepHeader({ step, total = 3, onBack, language, onLanguageChange }: StepHeaderProps) {
  return (
    <header className="step-header">
      <button className="icon-button" type="button" onClick={onBack} aria-label={translations[language].common.back}>
        <ChevronLeft size={20} />
      </button>
      <Wordmark className="step-wordmark" />
      <div className="step-actions">
        <div className="step-dots" aria-hidden="true">
          {Array.from({ length: total }).map((_, index) => (
            <span
              key={index}
              className={index + 1 === step ? 'is-current' : index + 1 < step ? 'is-done' : ''}
            />
          ))}
        </div>
        <LanguageSelect language={language} onChange={onLanguageChange} />
      </div>
    </header>
  )
}
