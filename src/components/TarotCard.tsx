import { CARD_BACK, TAROT_CARDS, type TarotCardData } from '../lib/tarot'

type TarotCardProps = {
  card?: TarotCardData
  cardId?: number
  faceUp?: boolean
  selected?: boolean
  compact?: boolean
}

export function TarotCard({ card, cardId, faceUp = false, selected = false, compact = false }: TarotCardProps) {
  const resolved = card ?? (typeof cardId === 'number' ? TAROT_CARDS[cardId] : undefined)
  const src = faceUp && resolved ? resolved.image : CARD_BACK
  const alt = faceUp && resolved ? resolved.label : 'PI tarot card back'
  return (
    <span className={`tarot-card ${selected ? 'is-selected' : ''} ${compact ? 'is-compact' : ''}`}>
      <img src={src} alt={alt} loading="lazy" draggable={false} />
    </span>
  )
}
