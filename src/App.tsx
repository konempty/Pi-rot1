import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import {
  Briefcase,
  Check,
  ChevronRight,
  Coins,
  Heart,
  Home,
  Loader2,
  Moon,
  MousePointerClick,
  Quote,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  WandSparkles,
} from 'lucide-react'
import { CardCarousel } from './components/CardCarousel'
import { LanguageSelect } from './components/LanguageSelect'
import { PiCoin, Wordmark } from './components/PiLogo'
import { StepHeader } from './components/StepHeader'
import { TarotCard } from './components/TarotCard'
import { LANGUAGE_STORAGE_KEY, LANGUAGES, translations, type Language, type Translation } from './lib/i18n'
import { CATEGORIES, TAROT_CARDS, type CategoryId, generateMockReading, getCategory, getCategoryText } from './lib/tarot'

type Screen = 'home' | 'categories' | 'payment' | 'select' | 'loading' | 'result'

type FlowState = {
  categoryId: CategoryId | null
  paid: boolean
  selectedCards: number[]
}

const STORAGE_KEY = 'pirot-react-flow'
const MOCK_BALANCE = 128.5
const initialFlow: FlowState = { categoryId: null, paid: false, selectedCards: [] }
const SELECT_FAN_CONFIGS = {
  desktop: {
    rows: 4,
    baseTops: [0, 130, 260, 390],
    width: 78,
    theta: 28,
    depth: 58,
  },
  tablet: {
    rows: 6,
    baseTops: [0, 108, 216, 324, 432, 540],
    width: 76,
    theta: 25,
    depth: 44,
  },
  mobile: {
    rows: 6,
    baseTops: [0, 96, 192, 288, 384, 480],
    width: 78,
    theta: 26,
    depth: 42,
  },
} as const

function isLanguage(value: string | null): value is Language {
  return LANGUAGES.some((item) => item.code === value)
}

function loadLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(saved) ? saved : 'en'
  } catch {
    return 'en'
  }
}

function hasStoredLanguage() {
  try {
    return isLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY))
  } catch {
    return false
  }
}

function cardCountText(count: number, language: Language, t: Translation) {
  if (language === 'en') return `${count} ${count === 1 ? t.common.card : t.common.cards}`
  return `${count}${count === 1 ? t.common.card : t.common.cards}`
}

function remainingText(count: number, language: Language, t: Translation) {
  if (language === 'en') return `${count} ${count === 1 ? 'card' : 'cards'} ${t.select.remaining}`
  return `${count}${t.select.remaining}`
}

function chooseMoreText(count: number, language: Language, t: Translation) {
  if (language === 'en') return `${count} ${count === 1 ? 'card' : 'cards'} ${t.select.chooseMore}`
  return `${count}${t.select.chooseMore}`
}

function shuffleDeck() {
  const deck = TAROT_CARDS.map((card) => card.id)
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[deck[index], deck[swap]] = [deck[swap], deck[index]]
  }
  return deck
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth))
  useEffect(() => {
    function update() {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return width
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [language, setLanguage] = useState<Language>(() => loadLanguage())
  const [showLanguageModal, setShowLanguageModal] = useState(() => !hasStoredLanguage())
  const [flow, setFlow] = useState<FlowState>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : initialFlow
    } catch {
      return initialFlow
    }
  })
  const t = translations[language]

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flow))
    } catch {
      // ignore
    }
  }, [flow])

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage)
    setShowLanguageModal(false)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    } catch {
      // ignore
    }
  }

  function reset() {
    setFlow(initialFlow)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  function go(next: Screen) {
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const languageModal = showLanguageModal ? <LanguageModal language={language} onChoose={changeLanguage} /> : null
  const category = getCategory(flow.categoryId)

  if (screen === 'categories') {
    return (
      <>
        <CategoriesScreen language={language} t={t} onLanguageChange={changeLanguage} onBack={() => go('home')} onChoose={(categoryId) => {
          setFlow({ categoryId, paid: false, selectedCards: [] })
          go('payment')
        }} />
        {languageModal}
      </>
    )
  }
  if (screen === 'payment') {
    return (
      <>
        <PaymentScreen language={language} t={t} onLanguageChange={changeLanguage} categoryId={flow.categoryId} onBack={() => go('categories')} onPaid={() => {
          setFlow((current) => ({ ...current, paid: true }))
          go('select')
        }} />
        {languageModal}
      </>
    )
  }
  if (screen === 'select') {
    return (
      <>
        <SelectScreen language={language} t={t} onLanguageChange={changeLanguage} categoryId={flow.categoryId} paid={flow.paid} onBack={() => go('payment')} onConfirm={(selectedCards) => {
          setFlow((current) => ({ ...current, selectedCards }))
          go('loading')
        }} />
        {languageModal}
      </>
    )
  }
  if (screen === 'loading') {
    return (
      <>
        <LoadingScreen t={t} valid={Boolean(category && flow.paid && flow.selectedCards.length)} onInvalid={() => go('categories')} onDone={() => go('result')} />
        {languageModal}
      </>
    )
  }
  if (screen === 'result') {
    return (
      <>
        <ResultScreen language={language} t={t} onLanguageChange={changeLanguage} flow={flow} onHome={() => {
          reset()
          go('home')
        }} onRestart={() => {
          reset()
          go('categories')
        }} />
        {languageModal}
      </>
    )
  }

  return (
    <>
      <HomeScreen language={language} t={t} onLanguageChange={changeLanguage} onStart={() => go('categories')} />
      {languageModal}
    </>
  )
}

function HomeScreen({ language, t, onLanguageChange, onStart }: { language: Language; t: Translation; onLanguageChange: (language: Language) => void; onStart: () => void }) {
  const stepIcons = [Sparkles, MousePointerClick, WandSparkles]
  return (
    <main className="page starfield">
      <header className="topbar">
        <Wordmark />
        <div className="topbar-actions">
          <span className="coin-badge"><PiCoin size={16} />{t.common.piPayment}</span>
          <LanguageSelect language={language} onChange={onLanguageChange} />
        </div>
      </header>
      <section className="hero">
        <span className="eyebrow"><Sparkles size={14} />{t.home.eyebrow}</span>
        <h1>
          {t.home.titlePrefix}
          <br />
          {language === 'en' ? <>{t.home.titleSuffix} <span>PI-rot</span></> : <><span>PI-rot</span> {t.home.titleSuffix}</>}
        </h1>
        <p>{t.home.body}</p>
        <div className="hero-actions">
          <button className="primary-button" type="button" onClick={onStart}>{t.home.start}<span>→</span></button>
          <small>{t.home.note}</small>
        </div>
      </section>
      <section className="carousel-section">
        <CardCarousel />
        <p>{t.home.carouselNote}</p>
      </section>
      <section className="steps">
        <h2>{t.home.stepsTitle}</h2>
        <ol>
          {t.home.steps.map(([title, desc], index) => {
            const Icon = stepIcons[index] ?? Sparkles
            return (
              <li key={title}>
                <div>
                  <span className="step-icon"><Icon size={20} /></span>
                  <b>{index + 1}</b>
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </li>
            )
          })}
        </ol>
      </section>
      <footer><PiCoin size={14} /> {t.home.footer}</footer>
    </main>
  )
}

function CategoriesScreen({ language, t, onLanguageChange, onBack, onChoose }: { language: Language; t: Translation; onLanguageChange: (language: Language) => void; onBack: () => void; onChoose: (id: CategoryId) => void }) {
  const icons = { sun: Sun, heart: Heart, coins: Coins, briefcase: Briefcase, sparkles: Sparkles }
  return (
    <main className="page starfield">
      <StepHeader step={1} language={language} onLanguageChange={onLanguageChange} onBack={onBack} />
      <section className="narrow">
        <h1>{t.categories.title}</h1>
        <p>{t.categories.body}</p>
        <ul className="category-list">
          {CATEGORIES.map((category) => {
            const categoryText = getCategoryText(category.id, language)
            const Icon = icons[category.icon]
            return (
              <li key={category.id}>
                <button type="button" onClick={() => onChoose(category.id)}>
                  <span className="category-icon"><Icon size={24} /></span>
                  <span className="category-copy">
                    <span className="category-copy-title">
                      <strong>{categoryText.name}</strong>
                      <span className="card-count">{cardCountText(category.count, language, t)}</span>
                    </span>
                    <small>{categoryText.tagline}</small>
                  </span>
                  <span className="price"><PiCoin size={18} />{category.price}</span>
                  <ChevronRight className="category-chevron" size={20} />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}

function PaymentScreen({ language, t, onLanguageChange, categoryId, onBack, onPaid }: { language: Language; t: Translation; onLanguageChange: (language: Language) => void; categoryId: CategoryId | null; onBack: () => void; onPaid: () => void }) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const category = getCategory(categoryId)
  useEffect(() => {
    if (!category) onBack()
  }, [category, onBack])
  if (!category) return null
  const categoryText = getCategoryText(category.id, language)
  function pay() {
    setStatus('processing')
    window.setTimeout(() => {
      setStatus('done')
      window.setTimeout(onPaid, 750)
    }, 1600)
  }
  return (
    <main className="page starfield">
      <StepHeader step={2} language={language} onLanguageChange={onLanguageChange} onBack={onBack} />
      <section className="payment narrow">
        <h1>{t.payment.title}</h1>
        <p>{t.payment.body}</p>
        <div className="summary-box">
          <Row label={t.payment.topic} value={categoryText.name} />
          <Row label={t.payment.cardCount} value={cardCountText(category.count, language, t)} />
          <Row label={t.payment.networkFee} value="0 π" />
          <div className="summary-total">
            <span>{t.payment.total}</span>
            <strong><PiCoin size={22} />{category.price} π</strong>
          </div>
        </div>
        <div className="wallet-box">
          <span><PiCoin size={28} /><span><strong>{t.payment.wallet}</strong><small>{t.payment.balance} {MOCK_BALANCE} π</small></span></span>
          <em>{t.common.connected}</em>
        </div>
        <p className="payment-note"><ShieldCheck size={14} />{t.payment.secureNote}</p>
      </section>
      <BottomBar max="md">
        <button className="primary-button wide" type="button" disabled={status !== 'idle'} onClick={pay}>
          {status === 'idle' && <><PiCoin size={20} />{category.price} π {t.payment.pay}</>}
          {status === 'processing' && <><Loader2 size={20} className="spin" />{t.payment.processing}</>}
          {status === 'done' && <><Check size={20} />{t.payment.done}</>}
        </button>
      </BottomBar>
    </main>
  )
}

function SelectScreen({ language, t, onLanguageChange, categoryId, paid, onBack, onConfirm }: { language: Language; t: Translation; onLanguageChange: (language: Language) => void; categoryId: CategoryId | null; paid: boolean; onBack: () => void; onConfirm: (cards: number[]) => void }) {
  const category = getCategory(categoryId)
  const [deck, setDeck] = useState<number[]>([])
  const [picked, setPicked] = useState<number[]>([])
  const viewportWidth = useViewportWidth()
  useEffect(() => {
    if (!category || !paid) {
      onBack()
      return
    }
    setDeck(shuffleDeck())
  }, [category, paid, onBack])
  if (!category) return null
  const remaining = category.count - picked.length
  const isFull = remaining === 0
  const fanConfig = viewportWidth <= 640 ? SELECT_FAN_CONFIGS.mobile : viewportWidth <= 1100 ? SELECT_FAN_CONFIGS.tablet : SELECT_FAN_CONFIGS.desktop
  const fanRowSize = Math.ceil(deck.length / fanConfig.rows)
  function toggle(position: number) {
    setPicked((current) => {
      if (current.includes(position)) return current.filter((item) => item !== position)
      if (current.length >= category.count) return current
      return [...current, position]
    })
  }
  return (
    <main className="page starfield">
      <StepHeader step={3} language={language} onLanguageChange={onLanguageChange} onBack={onBack} />
      <section className="select">
        <div className="select-heading">
          <h1>{t.select.title}</h1>
          <p>{t.select.bodyPrefix} <strong>{cardCountText(category.count, language, t)}</strong>{language === 'en' ? ' ' : ''}{t.select.bodySuffix}</p>
          <p className="status-pill"><Sparkles size={16} />{isFull ? t.select.selectedDone : remainingText(remaining, language, t)}</p>
        </div>
        <div className="deck-fan">
          {deck.map((cardId, position) => {
            const order = picked.indexOf(position)
            const selected = order !== -1
            const dim = isFull && !selected
            const row = Math.floor(position / fanRowSize)
            const rowStart = row * fanRowSize
            const rowCount = Math.min(fanRowSize, deck.length - rowStart)
            const column = position - rowStart
            const progress = rowCount <= 1 ? 0.5 : column / (rowCount - 1)
            const width = fanConfig.width
            const theta = (fanConfig.theta * Math.PI) / 180
            const angle = -theta + progress * theta * 2
            const rowBaseTop = fanConfig.baseTops[row] ?? row * 110
            const rowLeft = 50 + (Math.sin(angle) / Math.sin(theta)) * (width / 2)
            const curveProgress = (1 - Math.cos(angle)) / (1 - Math.cos(theta))
            const rowTop = rowBaseTop + curveProgress * fanConfig.depth
            const style = {
              '--fan-left': `${rowLeft}%`,
              '--fan-top': `${rowTop}px`,
              '--fan-rotate': `${((angle * 180) / Math.PI) * 0.92}deg`,
              '--fan-z': selected ? 1000 + order : position,
            } as CSSProperties
            return (
              <button key={`${cardId}-${position}`} className={`deck-card ${selected ? 'picked' : ''} ${dim ? 'dimmed' : ''}`} style={style} type="button" onClick={() => toggle(position)} aria-label={`${t.select.cardAria} ${position + 1}`} aria-pressed={selected}>
                <TarotCard selected={selected} />
                {selected && <span>{order + 1}</span>}
              </button>
            )
          })}
        </div>
      </section>
      <BottomBar>
        <button className="primary-button wide" type="button" disabled={!isFull} onClick={() => onConfirm(picked.map((position) => deck[position]))}>
          {isFull ? t.select.confirm : chooseMoreText(remaining, language, t)}
        </button>
      </BottomBar>
    </main>
  )
}

function LoadingScreen({ t, valid, onInvalid, onDone }: { t: Translation; valid: boolean; onInvalid: () => void; onDone: () => void }) {
  const [message, setMessage] = useState(0)
  useEffect(() => {
    if (!valid) {
      onInvalid()
      return
    }
    const interval = window.setInterval(() => setMessage((current) => (current + 1) % t.loading.messages.length), 1800)
    const timeout = window.setTimeout(onDone, 5200)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [valid, onInvalid, onDone, t.loading.messages.length])
  return (
    <main className="loading-screen starfield">
      <div className="orbit">
        <div className="orbit-track" aria-hidden="true"><Star size={20} /><Moon size={20} /><Sparkles size={20} /></div>
        <div><PiCoin size={56} /></div>
      </div>
      <h1>{t.loading.title}</h1>
      <p>{t.loading.messages[message]}</p>
      <div className="loading-dots" aria-hidden="true">{t.loading.messages.map((_, index) => <span key={index} className={index === message ? 'is-active' : ''} />)}</div>
    </main>
  )
}

function ResultScreen({ language, t, onLanguageChange, flow, onHome, onRestart }: { language: Language; t: Translation; onLanguageChange: (language: Language) => void; flow: FlowState; onHome: () => void; onRestart: () => void }) {
  const category = getCategory(flow.categoryId)
  const reading = useMemo(() => {
    if (!flow.categoryId || !flow.selectedCards.length) return null
    return generateMockReading(flow.categoryId, flow.selectedCards, language)
  }, [flow.categoryId, flow.selectedCards, language])
  if (!category || !reading) {
    return (
      <main className="page starfield">
        <section className="narrow center">
          <h1>{t.result.empty}</h1>
          <button className="primary-button" type="button" onClick={onRestart}>{t.result.startAgain}</button>
        </section>
      </main>
    )
  }
  const categoryText = getCategoryText(category.id, language)
  const columns = Math.min(reading.cards.length, 5)
  return (
    <main className="page starfield">
      <StepHeader step={3} language={language} onLanguageChange={onLanguageChange} onBack={onHome} />
      <section className="result narrow-wide">
        <div className="center">
          <span className="eyebrow"><Sparkles size={14} />{categoryText.name} {t.result.badgeSuffix}</span>
          <h1>{t.result.title}</h1>
        </div>
        <div className={`spread spread-${columns}`}>
          {reading.cards.map((item, index) => (
            <div className="spread-card" key={`${item.card.id}-${index}`}>
              <TarotCard card={item.card} faceUp />
              <span>{item.position}</span>
            </div>
          ))}
        </div>
        <p className="result-card-hint">{t.result.cardHint}</p>
        <section className="reading-box accent"><h2><Quote size={16} />{t.result.summary}</h2><p>{reading.summary}</p></section>
        <section className="reading-list">
          {reading.cards.map((item, index) => (
            <article key={`${item.card.id}-reading-${index}`}>
              <TarotCard card={item.card} faceUp compact />
              <div><h3>{item.position}</h3><span>{item.keyword}</span><p>{item.text}</p></div>
            </article>
          ))}
        </section>
        <section className="reading-box"><h2><Sparkles size={16} />{t.result.adviceTitle}</h2><p>{reading.advice}</p></section>
      </section>
      <BottomBar>
        <button className="secondary-button" type="button" onClick={onHome}><Home size={16} />{t.common.home}</button>
        <button className="primary-button" type="button" onClick={onRestart}><RotateCcw size={16} />{t.common.restart}</button>
      </BottomBar>
    </main>
  )
}

function LanguageModal({ language, onChoose }: { language: Language; onChoose: (language: Language) => void }) {
  const t = translations[language]
  return (
    <div className="language-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="language-title">
      <div className="language-modal">
        <PiCoin size={42} />
        <h2 id="language-title">{t.languageModal.title}</h2>
        <p>{t.languageModal.body}</p>
        <div className="language-options">
          {LANGUAGES.map((item) => (
            <button key={item.code} className={item.code === language ? 'is-active' : ''} type="button" onClick={() => onChoose(item.code)}>
              <span>{item.flag}</span><strong>{item.nativeName}</strong><small>{item.label}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="summary-row"><span>{label}</span><strong>{value}</strong></div>
}

function BottomBar({ children, max = 'lg' }: { children: ReactNode; max?: 'md' | 'lg' }) {
  return <div className="bottom-bar"><div className={max === 'md' ? 'bar-md' : ''}>{children}</div></div>
}
