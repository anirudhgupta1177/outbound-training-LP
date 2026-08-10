// Tailwind only keeps classes it can see as complete strings, so offer accents
// are a lookup table rather than interpolated class names.
const ACCENTS = {
  cyan: {
    ring: 'hover:border-cyan-400/50',
    glow: 'from-cyan-400/10',
    badge: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
    button:
      'bg-gradient-to-r from-cyan-400 to-emerald-500 text-black hover:from-cyan-300 hover:to-emerald-400',
    bullet: 'text-cyan-400',
    label: 'text-cyan-400',
  },
  amber: {
    ring: 'hover:border-amber-400/50',
    glow: 'from-amber-400/10',
    badge: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    button:
      'bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:from-amber-300 hover:to-orange-400',
    bullet: 'text-amber-400',
    label: 'text-amber-400',
  },
  purple: {
    ring: 'hover:border-purple-400/50',
    glow: 'from-purple-400/10',
    badge: 'bg-purple-400/10 text-purple-300 border-purple-400/30',
    button:
      'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400',
    bullet: 'text-purple-400',
    label: 'text-purple-400',
  },
  emerald: {
    ring: 'hover:border-emerald-400/50',
    glow: 'from-emerald-400/10',
    badge: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
    button:
      'bg-gradient-to-r from-emerald-400 to-teal-500 text-black hover:from-emerald-300 hover:to-teal-400',
    bullet: 'text-emerald-400',
    label: 'text-emerald-400',
  },
};

export function getAccent(name) {
  return ACCENTS[name] || ACCENTS.cyan;
}
