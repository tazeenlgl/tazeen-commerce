import type { AttemptItem } from '../types/attempt'
import type { WinnerItem } from '../types/winner'

/** Winners are exactly the attempts flagged is_winner (one winner row per winning attempt). */
export function deriveWinners(attempts: AttemptItem[]): WinnerItem[] {
  return attempts
    .filter((a) => a.is_winner)
    .map((a) => ({
      id: `w-${a.id}`,
      attempt_id: a.id,
      customer_id: a.customer_id,
      phone: a.phone,
      winner_date: a.attempt_date,
      target_centiseconds: a.target_centiseconds,
      actual_centiseconds: a.actual_centiseconds,
      attempted_at: a.attempted_at,
      device: a.device,
      reward_name: null,
      reward_status: 'pending',
      claimed_at: null,
      created_at: a.attempted_at,
    }))
}
