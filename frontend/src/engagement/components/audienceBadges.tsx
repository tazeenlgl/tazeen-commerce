import type { Permission, PushStatus } from '../types/audience'
import { Badge } from './Badge'

export const permissionBadge = (p: Permission) =>
  p === 'granted' ? <Badge tone="ok">Granted</Badge>
    : p === 'denied' ? <Badge tone="danger">Denied</Badge>
    : <Badge>Default</Badge>

export const pushBadge = (p: PushStatus) =>
  p === 'active' ? <Badge tone="ok">Active</Badge>
    : p === 'inactive' ? <Badge tone="warn">Inactive</Badge>
    : <Badge>None</Badge>
