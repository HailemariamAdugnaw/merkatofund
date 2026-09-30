import { useCountUp } from '../hooks/useCountUp'

const STATS = [
  {
    value: 5000000,
    label: 'Birr Daily Liquidity',
    note: 'Injected into the local economy every single day'
  },
  {
    value: 1000000,
    label: 'Members Strong',
    note: 'One million voices across the ecosystem'
  },
  {
    value: 10,
    label: 'Distinct Sectors',
    note: 'Specialized units feeding the central artery'
  },
  {
    value: 100000,
    label: 'Members per Batch',
    note: 'Collective power behind every payout'
  }
]

function StatCard({ stat }) {
  const [ref, value] = useCountUp(stat.value)
  return (
    <div className="stat-card" ref={ref}>
      <p className="stat-number">{value.toLocaleString('en-US')}</p>
      <p className="stat-card-label">{stat.label}</p>
      <p className="stat-note">{stat.note}</p>
    </div>
  )
}

export default function StatsBar() {
  return (
    <section className="stats" aria-label="Key numbers of the fund">
      <div className="container stats-grid">
        {STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  )
}
