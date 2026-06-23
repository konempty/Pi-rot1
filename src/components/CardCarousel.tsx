import { useEffect, useMemo, useRef, useState } from 'react'
import { EXAMPLE_CARD_IDS, TAROT_CARDS, type TarotCardData } from '../lib/tarot'
import { TarotCard } from './TarotCard'

const SLOT_COUNT = 10
const CARD_W = 104
const CARD_H = CARD_W * 1.5
const RADIUS = 220
const ROTATION_MS = 30000

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360
}

function isBackFacing(angle: number) {
  const normalized = normalizeAngle(angle)
  return normalized > 90 && normalized < 270
}

function distanceFromBack(angle: number) {
  return Math.abs(normalizeAngle(angle) - 180)
}

function randomCard(excludeId?: number): TarotCardData {
  let next = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)]
  while (TAROT_CARDS.length > 1 && next.id === excludeId) {
    next = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)]
  }
  return next
}

export function CardCarousel() {
  const initialCards = useMemo(() => {
    const fixed = EXAMPLE_CARD_IDS.map((id) => TAROT_CARDS[id]).filter(Boolean)
    const used = new Set(fixed.map((card) => card.id))
    const rest = TAROT_CARDS.filter((card) => !used.has(card.id)).sort(() => Math.random() - 0.5)
    return [...fixed, ...rest].slice(0, SLOT_COUNT)
  }, [])
  const [cards, setCards] = useState(initialCards)
  const [backSides, setBackSides] = useState(() => initialCards.map((_, index) => isBackFacing(index * (360 / SLOT_COUNT))))
  const [paused, setPaused] = useState(false)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const elapsedRef = useRef(0)
  const lastFrameRef = useRef<number | null>(null)
  const lastSwapRef = useRef<number[]>(Array(SLOT_COUNT).fill(-ROTATION_MS))
  const backSidesRef = useRef(backSides)
  const step = 360 / Math.max(cards.length, 1)

  useEffect(() => {
    backSidesRef.current = backSides
  }, [backSides])

  useEffect(() => {
    let raf = 0
    function tick(now: number) {
      if (lastFrameRef.current === null) lastFrameRef.current = now
      const delta = now - lastFrameRef.current
      lastFrameRef.current = now

      if (!paused) {
        elapsedRef.current += delta
        const rotation = (elapsedRef.current / ROTATION_MS) * 360
        if (ringRef.current) ringRef.current.style.transform = `rotateY(${rotation}deg)`
        let nextBackSides: boolean[] | null = null
        cards.forEach((_, index) => {
          const cardAngle = index * step + rotation
          const backFacing = isBackFacing(cardAngle)
          if (backSidesRef.current[index] !== backFacing) {
            nextBackSides ??= [...backSidesRef.current]
            nextBackSides[index] = backFacing
          }
          const cooledDown = elapsedRef.current - lastSwapRef.current[index] > ROTATION_MS * 0.55
          if (distanceFromBack(cardAngle) < 7 && cooledDown) {
            lastSwapRef.current[index] = elapsedRef.current
            setCards((current) => {
              const copy = [...current]
              copy[index] = randomCard(copy[index]?.id)
              return copy
            })
          }
        })
        if (nextBackSides) {
          backSidesRef.current = nextBackSides
          setBackSides(nextBackSides)
        }
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [cards, paused, step])

  return (
    <div
      className="carousel"
      style={{ perspective: '1100px', perspectiveOrigin: '50% 45%' }}
      aria-label="예시 타로 카드 3D 캐러셀"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="carousel-ring" ref={ringRef}>
        {cards.map((card, index) => {
          const angle = index * step
          return (
            <div
              className={`carousel-card ${backSides[index] ? 'is-back-facing' : ''}`}
              key={index}
              style={{
                width: CARD_W,
                height: CARD_H,
                left: -CARD_W / 2,
                top: -CARD_H / 2,
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
              }}
            >
              <div className="carousel-facing">
                <div className="carousel-visible-card">
                  <TarotCard card={card} faceUp={!backSides[index]} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
