import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('customer@demo.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-32 md:pt-40 pb-28">
      <p className="eyebrow mb-3">Welcome back</p>
      <h1 className="font-display text-4xl mb-10">Sign In</h1>
      <form onSubmit={submit} className="space-y-6">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
          className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password"
          className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <p className="text-sm text-ash mt-8">
        New here? <Link to="/register" className="text-gold hover:text-goldSoft">Create an account</Link>
      </p>
      <div className="mt-10 pt-6 border-t border-white/10 text-xs text-ash space-y-1">
        <p className="eyebrow mb-2">Demo accounts (password: password123)</p>
        <p>customer@demo.com — VIP Platinum customer</p>
        <p>admin@demo.com — Super Admin</p>
        <p>content@demo.com / pricing@demo.com / aiops@demo.com — scoped admins</p>
        <p>pos@demo.com — Boutique POS staff</p>
      </div>
    </div>
  );
}
