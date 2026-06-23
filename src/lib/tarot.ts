import cards from '../data/tarot-cards.json'
import { translations, type Language } from './i18n'

export type CategoryId = 'today' | 'love' | 'money' | 'career' | 'overall'

export type TarotCardData = {
  id: number
  filename: string
  image: string
  label: string
  roman: string
  name: string
  arcana: 'major' | 'minor'
  suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null
  rank: string | null
}

export type TarotCategory = {
  id: CategoryId
  count: number
  price: number
  icon: 'sun' | 'heart' | 'coins' | 'briefcase' | 'sparkles'
}

function assetPath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

export const TAROT_CARDS = (cards as TarotCardData[]).map((card) => ({
  ...card,
  image: assetPath(card.image),
}))

export const TOTAL_CARDS = 78
export const CARD_BACK = assetPath('tarot/card-back.webp')
export const EXAMPLE_CARD_IDS = [0, 1, 2, 17, 19, 21, 34, 47, 58, 72]

export const CATEGORIES: TarotCategory[] = [
  { id: 'today', count: 1, price: 1, icon: 'sun' },
  { id: 'love', count: 3, price: 3, icon: 'heart' },
  { id: 'money', count: 3, price: 3, icon: 'coins' },
  { id: 'career', count: 3, price: 4, icon: 'briefcase' },
  { id: 'overall', count: 5, price: 7, icon: 'sparkles' },
]

export function getCategory(id: CategoryId | null | undefined) {
  return CATEGORIES.find((category) => category.id === id)
}

export function getCategoryText(id: CategoryId, language: Language) {
  return translations[language].categoryText[id]
}

export function positionLabels(count: number, language: Language) {
  const { positions } = translations[language]
  if (count === 1) return [...positions.one]
  if (count === 3) return [...positions.three]
  if (count === 5) return [...positions.five]
  if (language === 'en') return Array.from({ length: count }, (_, index) => `${positions.fallback} ${index + 1}`)
  if (language === 'zh') return Array.from({ length: count }, (_, index) => `第${index + 1}张卡牌`)
  return Array.from({ length: count }, (_, index) => `${index + 1}${positions.fallback}`)
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.abs(seed) % items.length]
}

function template(source: string, values: Record<string, string>) {
  return source.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '')
}

export type ReadingCard = {
  card: TarotCardData
  position: string
  keyword: string
  text: string
}

export type Reading = {
  summary: string
  cards: ReadingCard[]
  advice: string
}

export function generateMockReading(categoryId: CategoryId, cardIds: number[], language: Language): Reading {
  const labels = positionLabels(cardIds.length, language)
  const t = translations[language]
  const categoryName = getCategoryText(categoryId, language).name
  const readingCards = cardIds.map((id, index) => {
    const card = TAROT_CARDS[id] ?? TAROT_CARDS[0]
    const keyword = pick(t.reading.keywords, id + index)
    const position = labels[index] ?? `${index + 1}`
    return {
      card,
      position,
      keyword,
      text: template(t.reading.cardText, { card: card.label, keyword, position }),
    }
  })
  return {
    summary: template(t.reading.summary, { category: categoryName }),
    cards: readingCards,
    advice: t.reading.advice,
  }
}
