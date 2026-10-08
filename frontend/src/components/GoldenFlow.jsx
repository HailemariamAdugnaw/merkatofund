export default function GoldenFlow({ label = 'Golden Liquidity Flow — 5,000,000 Birr Daily' }) {
  return (
    <div className="golden-flow" role="presentation">
      <span className="golden-flow-stream golden-flow-stream-one" aria-hidden="true" />
      <span className="golden-flow-stream golden-flow-stream-two" aria-hidden="true" />
      <p className="golden-flow-label">✦ {label} ✦</p>
    </div>
  )
}
