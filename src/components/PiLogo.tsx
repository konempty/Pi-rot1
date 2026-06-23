type PiCoinProps = {
  size?: number
  className?: string
}

export function PiCoin({ size = 24, className = '' }: PiCoinProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}pi-coin.png`}
      alt="파이코인"
      width={size}
      height={size}
      className={`pi-coin-image ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label="PI-rot">
      <span className="wordmark-pi-text">PI</span>
      <span className="wordmark-tail">-rot</span>
    </span>
  )
}
