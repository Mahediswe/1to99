import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?curated=1', label: 'AI Curated Edit' },
  { to: '/vip', label: 'VIP' },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-inkDeep/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-widest2 uppercase text-parchment" onClick={close}>
          Maison <span className="text-gold">Verrier</span>
        </Link>

        <nav className="hidden md:flex items-center gap-9 text-xs tracking-widest2 uppercase text-ash">
          {LINKS.map((l) => <Link key={l.label} to={l.to} className="hover:text-gold transition-colors">{l.label}</Link>)}
          {(user?.role && user.role !== 'customer') && (
            <Link to="/admin" className="hover:text-gold transition-colors">Admin</Link>
          )}
          {user?.role === 'pos_staff' && <Link to="/pos" className="hover:text-gold transition-colors">POS</Link>}
        </nav>

        <div className="flex items-center gap-5 md:gap-6 text-xs tracking-widest2 uppercase">
          {user ? (
            <>
              <Link to="/account" className="hidden sm:inline hover:text-gold transition-colors">{user.name.split(' ')[0]}</Link>
              <button onClick={() => { logout(); navigate('/'); }} className="hidden sm:inline hover:text-gold transition-colors">Sign out</button>
            </>
          ) : (
            <Link to="/login" className="hidden sm:inline hover:text-gold transition-colors">Sign in</Link>
          )}
          <Link to="/cart" className="relative hover:text-gold transition-colors">
            Bag {count > 0 && <span className="ml-1 text-gold">({count})</span>}
          </Link>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex flex-col gap-1.5 w-6"
            aria-label="Toggle menu"
          >
            <span className={`h-px bg-parchment transition-transform ${menuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`h-px bg-parchment transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-px bg-parchment transition-transform ${menuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-inkDeep border-t border-white/5 px-6 py-6 flex flex-col gap-5 text-sm uppercase tracking-widest2 text-ash">
          {LINKS.map((l) => <Link key={l.label} to={l.to} onClick={close} className="hover:text-gold transition-colors">{l.label}</Link>)}
          {(user?.role && user.role !== 'customer') && <Link to="/admin" onClick={close} className="hover:text-gold transition-colors">Admin</Link>}
          {user?.role === 'pos_staff' && <Link to="/pos" onClick={close} className="hover:text-gold transition-colors">POS</Link>}
          <div className="border-t border-white/10 pt-5">
            {user ? (
              <>
                <Link to="/account" onClick={close} className="block mb-3 hover:text-gold transition-colors">{user.name}</Link>
                <button onClick={() => { logout(); close(); navigate('/'); }} className="hover:text-gold transition-colors">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={close} className="hover:text-gold transition-colors">Sign in</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
