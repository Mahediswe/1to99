import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 pt-32 md:pt-40 pb-28 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="font-display text-4xl mb-6">This page has left the atelier.</h1>
      <p className="text-ash mb-10">The piece you're looking for may have sold, or the address isn't quite right.</p>
      <Link to="/" className="btn-gold">Return Home</Link>
    </div>
  );
}
