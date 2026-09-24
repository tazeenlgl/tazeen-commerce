import type { CampaignStatus } from '../types/campaign'
import { Badge } from './Badge'

export const statusBadge = (s: CampaignStatus) =>
  s === 'completed' ? <Badge tone="ok">Completed</Badge>
    : s === 'failed' ? <Badge tone="danger">Failed</Badge>
    : s === 'sending' ? <Badge tone="warn">Sending</Badge>
    : <Badge>Draft</Badge>
