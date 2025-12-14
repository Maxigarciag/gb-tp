import { Flame } from 'lucide-react'
import { UserStreak } from './streak.types'
import { getStreakLevel } from './streak.levels'

type Props = {
  streak: UserStreak | null
  loading: boolean
  error: string | null
}

const StreakCard = ({ streak, loading, error }: Props) => {
  const current = streak?.current_streak ?? 0
  const longest = streak?.longest_streak ?? 0
  const levelInfo = loading ? null : getStreakLevel(current)

  const nextLabel = loading
    ? ''
    : levelInfo?.nextLevel
      ? `Siguiente: ${levelInfo.nextLevel.emoji} ${levelInfo.nextLevel.name}`
      : 'Nivel máximo alcanzado'

  const daysHint = loading
    ? ''
    : levelInfo?.daysToNext === null
      ? 'Ya alcanzaste el máximo nivel'
      : `Faltan ${levelInfo?.daysToNext} días`

  const progressPercent = loading
    ? 0
    : Math.round((levelInfo?.progressToNext ?? 0) * 100)

  return (
    <div className="routine-stat-card streak-card">
      <div className="streak-card-header">
        <div className="stat-icon-wrapper">
          <Flame size={20} />
        </div>
        <div className="streak-level-badge">
          {loading ? '...' : `${levelInfo?.level.emoji ?? ''} ${levelInfo?.level.name ?? ''}`}
        </div>
        <div className="streak-days">
          {loading ? '...' : `${current} ${current === 1 ? 'día' : 'días'}`}
        </div>
      </div>

      <div className="streak-stats-row">
        <div className="streak-stat">
          <span className="streak-stat-label">Racha actual</span>
          <span className="streak-stat-value">{loading ? '...' : current}</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat-label">Racha máxima</span>
          <span className="streak-stat-value">{loading ? '...' : longest}</span>
        </div>
      </div>

      <div className="streak-progress">
        <div className="streak-progress-top">
          <span className="streak-progress-title">{nextLabel}</span>
          <span className="streak-progress-percentage">{loading ? '...' : `${progressPercent}%`}</span>
        </div>
        <div className="streak-progress-bar">
          <div 
            className="streak-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="streak-progress-hint">
          {daysHint}
        </div>
      </div>

      {error && (
        <div className="streak-error">
          {error}
        </div>
      )}
    </div>
  )
}

export default StreakCard

