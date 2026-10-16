import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 pt-32 md:pt-40 pb-28">
      <p className="eyebrow mb-3">Join the atelier</p>
      <h1 className="font-display text-4xl mb-10">Create Account</h1>
      <form onSubmit={submit} className="space-y-6">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name"
          className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email"
          className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password"
          className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-sm py-2 placeholder:text-ash/60" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">{loading ? 'Creating…' : 'Create Account'}</button>
      </form>
      <p className="text-sm text-ash mt-8">
        Already a member? <Link to="/login" className="text-gold hover:text-goldSoft">Sign in</Link>
      </p>
    </div>
  );
}
