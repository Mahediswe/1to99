import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ADMIN_ROLES = ['content_admin', 'pricing_admin', 'ai_ops_admin', 'super_admin'];

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/pricing-rules', label: 'Pricing Rules' },
  { to: '/admin/audit-log', label: 'Price Audit Log' },
  { to: '/admin/vip-members', label: 'VIP Members' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/ai-config', label: 'AI Assistant' },
  { to: '/admin/market-intelligence', label: 'Market Intelligence' },
];

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (loading) return null;
  if (!user || !ADMIN_ROLES.includes(user.role)) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 pt-28 md:pt-32 pb-28 flex flex-col md:flex-row gap-8 md:gap-12">
      {/* Mobile: dropdown selector instead of sidebar */}
      <div className="md:hidden">
        <select
          value={location.pathname}
          onChange={(e) => navigate(e.target.value)}
          className="w-full bg-ink border border-white/20 text-sm px-4 py-3 uppercase tracking-widest2 text-gold"
        >
          {LINKS.map((l) => <option key={l.to} value={l.to}>{l.label}</option>)}
        </select>
      </div>

      <aside className="w-56 shrink-0 hidden md:block">
        <p className="eyebrow mb-6">Control Panel</p>
        <nav className="space-y-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm border-l-2 transition-colors ${isActive ? 'border-gold text-gold bg-white/5' : 'border-transparent text-ash hover:text-parchment'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <p className="text-[11px] text-ash mt-10 uppercase tracking-widest2">Signed in as<br /><span className="text-parchment normal-case">{user.role.replace('_', ' ')}</span></p>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
