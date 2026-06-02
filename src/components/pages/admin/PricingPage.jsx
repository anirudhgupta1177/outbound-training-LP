import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiRefresh,
  HiLogout,
  HiAcademicCap,
  HiCheck,
  HiArrowLeft,
  HiCurrencyRupee,
} from 'react-icons/hi';

const TIER_META = {
  INDIA: {
    label: 'Indian Version',
    sublabel: 'Visitors detected in India (IN)',
    accent: 'from-orange-500/10 to-orange-500/5 border-orange-500/30',
    badge: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  },
  SAARC: {
    label: 'Indian Neighbouring Version',
    sublabel: 'Bangladesh, Pakistan, Nepal, Sri Lanka, Bhutan',
    accent: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
  INTERNATIONAL: {
    label: 'Others (International) Version',
    sublabel: 'Everyone else (US, UK, EU, etc.)',
    accent: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/30',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  },
};

const TIER_ORDER = ['INDIA', 'SAARC', 'INTERNATIONAL'];

const formatPreview = (amount, currency) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return currency === 'INR'
    ? `₹${n.toLocaleString('en-IN')}`
    : `$${n.toLocaleString('en-US')}`;
};

export default function PricingPage() {
  const [tiers, setTiers] = useState({}); // keyed by tier
  const [drafts, setDrafts] = useState({}); // local edits per tier
  const [savingTier, setSavingTier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { logout, adminEmail, getToken } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/pricing', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to load pricing (${res.status})`);

      const map = {};
      const draftMap = {};
      for (const row of data.tiers || []) {
        map[row.tier] = row;
        draftMap[row.tier] = {
          currency: row.currency,
          symbol: row.symbol,
          base_price: String(row.base_price),
          original_price: String(row.original_price),
          gst_rate: String(row.gst_rate),
        };
      }
      setTiers(map);
      setDrafts(draftMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDraft = (tier, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: value },
    }));
  };

  const isDirty = (tier) => {
    const row = tiers[tier];
    const draft = drafts[tier];
    if (!row || !draft) return false;
    return (
      String(row.base_price) !== draft.base_price ||
      String(row.original_price) !== draft.original_price ||
      String(row.gst_rate) !== draft.gst_rate ||
      row.currency !== draft.currency ||
      row.symbol !== draft.symbol
    );
  };

  const handleSave = async (tier) => {
    const draft = drafts[tier];
    if (!draft) return;
    setError(null);
    setSavingTier(tier);

    const payload = {
      currency: draft.currency,
      symbol: draft.symbol,
      base_price: Number(draft.base_price),
      original_price: Number(draft.original_price),
      gst_rate: Number(draft.gst_rate),
    };

    if (!Number.isFinite(payload.base_price) || payload.base_price <= 0) {
      setError('Base price must be a positive number');
      setSavingTier(null);
      return;
    }
    if (!Number.isFinite(payload.original_price) || payload.original_price <= 0) {
      setError('Original price must be a positive number');
      setSavingTier(null);
      return;
    }
    if (!Number.isFinite(payload.gst_rate) || payload.gst_rate < 0 || payload.gst_rate >= 1) {
      setError('GST rate must be between 0 and 1 (e.g. 0.18 for 18%)');
      setSavingTier(null);
      return;
    }

    try {
      const res = await fetch(`/api/admin/pricing?tier=${tier}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save pricing');

      setTiers((prev) => ({ ...prev, [tier]: data.tier }));
      setSuccessMessage(`${TIER_META[tier].label} updated`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTier(null);
    }
  };

  const handleReset = (tier) => {
    const row = tiers[tier];
    if (!row) return;
    setDrafts((prev) => ({
      ...prev,
      [tier]: {
        currency: row.currency,
        symbol: row.symbol,
        base_price: String(row.base_price),
        original_price: String(row.original_price),
        gst_rate: String(row.gst_rate),
      },
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#111] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HiAcademicCap className="w-8 h-8 text-gold" />
              <div>
                <h1 className="text-lg font-bold text-white">Course Admin</h1>
                <p className="text-xs text-gray-400">{adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <HiArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <HiLogout className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <HiCurrencyRupee className="w-7 h-7 text-gold" />
              Course Pricing
            </h2>
            <p className="text-gray-400 mt-1">
              Set the price shown to each region. Updates the landing page CTAs, checkout summary, and the actual Razorpay charge.
            </p>
          </div>
          <button
            onClick={fetchTiers}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-3">
            <HiCheck className="w-5 h-5 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline hover:no-underline">
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {TIER_ORDER.map((tier) => {
              const meta = TIER_META[tier];
              const draft = drafts[tier];
              const row = tiers[tier];
              if (!draft || !row) {
                return (
                  <div key={tier} className="p-6 bg-[#111] border border-gray-800 rounded-xl text-gray-400">
                    No row for <span className="font-mono text-white">{tier}</span> yet. Run{' '}
                    <code className="text-gold">supabase/pricing-schema.sql</code> to seed it.
                  </div>
                );
              }

              const dirty = isDirty(tier);
              const previewBase = formatPreview(draft.base_price, draft.currency);
              const previewOriginal = formatPreview(draft.original_price, draft.currency);
              const gstPct = Number(draft.gst_rate) ? `${(Number(draft.gst_rate) * 100).toFixed(2).replace(/\.?0+$/, '')}%` : 'No GST';

              return (
                <section
                  key={tier}
                  className={`bg-gradient-to-br ${meta.accent} bg-[#111] border rounded-xl p-6`}
                >
                  <div className="flex items-start justify-between mb-5 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{meta.label}</h3>
                        <span className={`text-xs px-2 py-0.5 border rounded-full ${meta.badge}`}>
                          {tier}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{meta.sublabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Live preview</p>
                      <p className="text-2xl font-bold text-white">{previewBase}</p>
                      <p className="text-sm text-gray-400 line-through">{previewOriginal}</p>
                      <p className="text-xs text-gray-500 mt-1">{gstPct}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                      <select
                        value={draft.currency}
                        onChange={(e) => updateDraft(tier, 'currency', e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                      <input
                        type="text"
                        value={draft.symbol}
                        maxLength={3}
                        onChange={(e) => updateDraft(tier, 'symbol', e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Base price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.base_price}
                        onChange={(e) => updateDraft(tier, 'base_price', e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Original (strikethrough)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.original_price}
                        onChange={(e) => updateDraft(tier, 'original_price', e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">GST rate (0–1)</label>
                      <input
                        type="number"
                        min="0"
                        max="0.99"
                        step="0.01"
                        value={draft.gst_rate}
                        onChange={(e) => updateDraft(tier, 'gst_rate', e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                    <p className="text-xs text-gray-500">
                      Last updated: {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReset(tier)}
                        disabled={!dirty || savingTier === tier}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => handleSave(tier)}
                        disabled={!dirty || savingTier === tier}
                        className="px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingTier === tier ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-8 p-4 bg-[#111] border border-gray-800 rounded-xl text-sm text-gray-400">
          <p className="font-semibold text-gray-300 mb-1">How this propagates</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Landing page CTAs, value-stack card, mobile sticky bar, checkout summary all read from this row in real time.</li>
            <li>The Razorpay order amount is recomputed server-side from the matching tier — clients cannot tamper with it.</li>
            <li>Visitors see at most a 60-second cache delay (CDN) before the new price appears.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
