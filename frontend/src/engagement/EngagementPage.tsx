import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { TargetsPage } from './pages/TargetsPage'
import { AttemptsPage } from './pages/AttemptsPage'
import { WinnersPage } from './pages/WinnersPage'
import { AudiencePage } from './pages/AudiencePage'
import { CampaignsPage } from './pages/CampaignsPage'

const tabs = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'Targets', path: 'targets' },
  { label: 'Attempts', path: 'attempts' },
  { label: 'Winners', path: 'winners' },
  { label: 'Audience', path: 'audience' },
  { label: 'Campaigns', path: 'campaigns' },
]

export function EngagementPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Engagement</h1>
        <p className="mt-1 text-sm text-slate-500">
          Game targets, attempts, winners, audience and campaigns.
        </p>
      </div>

      <nav aria-label="Engagement sections" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={`/engagement/${tab.path}`}
            className={({ isActive }) =>
              `-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition ${
                isActive
                  ? 'border-slate-900 font-semibold text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="targets" element={<TargetsPage />} />
        <Route path="attempts" element={<AttemptsPage />} />
        <Route path="winners" element={<WinnersPage />} />
        <Route path="audience" element={<AudiencePage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  )
}
