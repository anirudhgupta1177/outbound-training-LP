import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiRefresh,
  HiLogout,
  HiAcademicCap,
  HiCheck,
  HiX,
  HiArrowLeft,
  HiTicket
} from 'react-icons/hi';

const EMPTY_FORM = {
  code: '',
  discount_type: 'percent',
  discount_value: '',
  currency: '',
  max_redemptions: '',
  expires_at: '',
  is_active: true,
  description: ''
};

function formatExpiry(iso) {
  if (!iso) return 'No expiry';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Invalid';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function isExpired(iso) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t < Date.now();
}

function statusFor(coupon) {
  if (!coupon.is_active) return { label: 'Inactive', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  if (isExpired(coupon.expires_at)) return { label: 'Expired', color: 'bg-red-500/10 text-red-300 border-red-500/30' };
  if (
    coupon.max_redemptions !== null &&
    coupon.max_redemptions !== undefined &&
    coupon.redemption_count >= coupon.max_redemptions
  ) {
    return { label: 'Used up', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
  }
  return { label: 'Active', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
}

function toDateInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // datetime-local expects YYYY-MM-DDTHH:mm
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { logout, adminEmail, getToken } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error
            ? `Failed to fetch coupons (${res.status}): ${data.error}`
            : `Failed to fetch coupons (${res.status})`
        );
      }
      setCoupons(data.coupons || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value ?? ''),
      currency: coupon.currency || '',
      max_redemptions: coupon.max_redemptions === null || coupon.max_redemptions === undefined
        ? ''
        : String(coupon.max_redemptions),
      expires_at: toDateInputValue(coupon.expires_at),
      is_active: Boolean(coupon.is_active),
      description: coupon.description || ''
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      currency: form.discount_type === 'fixed' ? form.currency || null : null,
      max_redemptions: form.max_redemptions === '' ? null : Number(form.max_redemptions),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: Boolean(form.is_active),
      description: form.description.trim() || null
    };

    try {
      const url = editingId ? `/api/admin/coupons?id=${editingId}` : '/api/admin/coupons';
      const method = editingId ? 'PUT' : 'POST';

      // code is immutable on update — don't send it
      const submitPayload = editingId ? { ...payload } : payload;
      if (editingId) delete submitPayload.code;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(submitPayload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save coupon');

      setSuccessMessage(editingId ? 'Coupon updated' : 'Coupon created');
      setTimeout(() => setSuccessMessage(''), 3000);
      closeForm();
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons?id=${coupon.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete coupon');
      }
      setSuccessMessage(`Deleted ${coupon.code}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (coupon) => {
    setError(null);
    try {
      const res = await fetch(`/api/admin/coupons?id=${coupon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ is_active: !coupon.is_active })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update coupon');
      }
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
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

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <HiTicket className="w-7 h-7 text-gold" />
              Coupons
            </h2>
            <p className="text-gray-400">
              {coupons.length} coupon{coupons.length === 1 ? '' : 's'}. Codes sync to Razorpay via order notes on every checkout.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCoupons}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <HiRefresh className="w-5 h-5" />
            </button>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              New Coupon
            </button>
          </div>
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

        {/* Create / Edit Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white">
                  {editingId ? 'Edit Coupon' : 'New Coupon'}
                </h3>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER20"
                    required
                    disabled={!!editingId}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                  />
                  {editingId && (
                    <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={form.discount_type}
                      onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="fixed">Fixed amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Value</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={form.discount_type === 'percent' ? 100 : undefined}
                      value={form.discount_value}
                      onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                      placeholder={form.discount_type === 'percent' ? '20' : '500'}
                      required
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                {form.discount_type === 'fixed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                    >
                      <option value="">Select currency…</option>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Fixed-amount coupons only apply when the checkout currency matches.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max redemptions</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.max_redemptions}
                      onChange={(e) => setForm({ ...form, max_redemptions: e.target.value })}
                      placeholder="Unlimited"
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Expires at</label>
                    <input
                      type="datetime-local"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description (admin-only note)</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Partner launch, affiliate code, etc."
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>

                <label className="flex items-center gap-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-sm text-gray-300">Active (can be redeemed at checkout)</span>
                </label>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving…' : editingId ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : error ? null : coupons.length === 0 ? (
          <div className="text-center py-20">
            <HiTicket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No coupons yet</h3>
            <p className="text-gray-400 mb-6">Create your first discount code</p>
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Create First Coupon
            </button>
          </div>
        ) : (
          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f0f0f] border-b border-gray-800">
                  <tr className="text-left text-gray-400">
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Discount</th>
                    <th className="px-4 py-3 font-medium">Usage</th>
                    <th className="px-4 py-3 font-medium">Expires</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => {
                    const status = statusFor(c);
                    const discountLabel =
                      c.discount_type === 'percent'
                        ? `${Number(c.discount_value)}%`
                        : `${c.currency || ''} ${Number(c.discount_value)}`.trim();
                    const usageLabel =
                      c.max_redemptions === null || c.max_redemptions === undefined
                        ? `${c.redemption_count} / ∞`
                        : `${c.redemption_count} / ${c.max_redemptions}`;
                    return (
                      <tr key={c.id} className="border-b border-gray-800 last:border-0 hover:bg-[#151515]">
                        <td className="px-4 py-3">
                          <div className="font-mono text-white font-semibold">{c.code}</div>
                          {c.description && (
                            <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{c.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-300">{discountLabel}</td>
                        <td className="px-4 py-3 text-gray-300">{usageLabel}</td>
                        <td className="px-4 py-3 text-gray-300">{formatExpiry(c.expires_at)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleToggleActive(c)}
                              className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                              title={c.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {c.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => openEditForm(c)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                              title="Edit coupon"
                            >
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete coupon"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
