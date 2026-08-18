import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronUp,
  HiChevronDown,
  HiLogout,
  HiAcademicCap,
  HiRefresh,
  HiArrowLeft,
  HiCheck,
  HiLink,
  HiCalendar,
  HiSave,
  HiEye,
  HiEyeOff,
  HiLockOpen,
} from 'react-icons/hi';

const KIND_LABELS = {
  course: 'Full course',
  micro_course: 'Micro-course',
  consult: 'Call / consult',
};

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [settings, setSettings] = useState({
    booking_url: '',
    vault_heading: '',
    vault_subheading: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', slug: '', kind: 'course' });

  const { logout, adminEmail, getToken } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
  }, []);

  const flashSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const fetchOffers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/offers', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch offers');

      setOffers(data.offers || []);
      setSettings({
        booking_url: data.settings?.booking_url || '',
        vault_heading: data.settings?.vault_heading || '',
        vault_subheading: data.settings?.vault_subheading || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/offers?entity=settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save settings');

      flashSuccess('Portal settings saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!newOffer.title.trim() || !newOffer.slug.trim()) return;

    setError(null);
    try {
      const response = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: newOffer.title.trim(),
          slug: newOffer.slug.trim(),
          kind: newOffer.kind,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create offer');

      setNewOffer({ title: '', slug: '', kind: 'course' });
      setIsCreating(false);
      flashSuccess('Offer created — add its details next');
      navigate(`/admin/offers/${data.offer.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteOffer = async (offer) => {
    if (
      !confirm(
        `Delete "${offer.title}"? This removes its resources and revokes it from every member who has it.`
      )
    ) {
      return;
    }

    setError(null);
    try {
      const response = await fetch(`/api/admin/offers?id=${offer.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete offer');

      flashSuccess(`"${offer.title}" deleted`);
      fetchOffers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (offer) => {
    setError(null);
    const next = !offer.is_active;
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, is_active: next } : o)));

    try {
      const response = await fetch(`/api/admin/offers?id=${offer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ is_active: next }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update offer');
    } catch (err) {
      setError(err.message);
      fetchOffers();
    }
  };

  const handleReorder = async (offerId, direction) => {
    const currentIndex = offers.findIndex((o) => o.id === offerId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= offers.length) return;

    const reordered = [...offers];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setOffers(reordered);

    try {
      const response = await fetch('/api/admin/offers?entity=reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ offerIds: reordered.map((o) => o.id) }),
      });

      if (!response.ok) throw new Error('Failed to reorder offers');
    } catch (err) {
      setError(err.message);
      fetchOffers();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const slugify = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#111] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-white">Offer Vault</h2>
            <p className="text-gray-400">
              What members see when they sign in — offers, links and access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOffers}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <HiRefresh className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              New Offer
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

        {/* Portal settings */}
        <form
          onSubmit={handleSaveSettings}
          className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <HiCalendar className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-semibold text-white">Portal Settings</h3>
          </div>
          <p className="text-sm text-gray-400 mb-5">
            The call booking link is the calendar members land on after paying for the
            &ldquo;1 Hour Consultation Call with Anirudh&rdquo; banner in the vault. Leave it
            empty and they get the funnel&rsquo;s default booking calendar.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="booking_url" className="block text-sm font-medium text-gray-300 mb-2">
                Call booking link
              </label>
              <div className="relative">
                <HiLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="booking_url"
                  type="url"
                  value={settings.booking_url}
                  onChange={(e) => setSettings({ ...settings, booking_url: e.target.value })}
                  placeholder="https://cal.com/your-handle/strategy-call"
                  className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vault_heading" className="block text-sm font-medium text-gray-300 mb-2">
                  Vault heading
                </label>
                <input
                  id="vault_heading"
                  type="text"
                  value={settings.vault_heading}
                  onChange={(e) => setSettings({ ...settings, vault_heading: e.target.value })}
                  placeholder="Your Offer Vault"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label htmlFor="vault_subheading" className="block text-sm font-medium text-gray-300 mb-2">
                  Vault subheading
                </label>
                <input
                  id="vault_subheading"
                  type="text"
                  value={settings.vault_subheading}
                  onChange={(e) => setSettings({ ...settings, vault_subheading: e.target.value })}
                  placeholder="Everything you've unlocked — and what's next."
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {isSavingSettings ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HiSave className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>

        {/* Create offer */}
        {isCreating && (
          <div className="mb-6 p-6 bg-[#111] border border-gray-800 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Offer</h3>
            <form onSubmit={handleCreateOffer} className="grid sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label htmlFor="new_offer_title" className="block text-sm font-medium text-gray-300 mb-2">
                  Offer title
                </label>
                <input
                  id="new_offer_title"
                  type="text"
                  value={newOffer.title}
                  onChange={(e) =>
                    setNewOffer((prev) => ({
                      ...prev,
                      title: e.target.value,
                      slug: prev.slug || slugify(e.target.value),
                    }))
                  }
                  placeholder="e.g. LinkedIn Outbound Sprint"
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="new_offer_slug" className="block text-sm font-medium text-gray-300 mb-2">
                  Slug
                </label>
                <input
                  id="new_offer_slug"
                  type="text"
                  value={newOffer.slug}
                  onChange={(e) => setNewOffer({ ...newOffer, slug: slugify(e.target.value) })}
                  placeholder="linkedin-sprint"
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label htmlFor="new_offer_kind" className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  id="new_offer_kind"
                  value={newOffer.kind}
                  onChange={(e) => setNewOffer({ ...newOffer, kind: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                >
                  {Object.entries(KIND_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewOffer({ title: '', slug: '', kind: 'course' });
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Offers list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 border border-gray-800 rounded-xl bg-[#111]">
            <HiAcademicCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No offers yet</h3>
            <p className="text-gray-400 mb-6">Create the first offer members will see in the vault</p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className="bg-[#111] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleReorder(offer.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <HiChevronUp className="w-5 h-5" />
                    </button>
                    <span className="text-gray-500 text-sm font-mono">{index + 1}</span>
                    <button
                      onClick={() => handleReorder(offer.id, 'down')}
                      disabled={index === offers.length - 1}
                      title="Move down"
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <HiChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-white truncate">{offer.title}</h3>
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-xs font-mono">
                        {offer.slug}
                      </span>
                      {!offer.is_active && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-xs font-medium">
                          Hidden
                        </span>
                      )}
                      {offer.unlocked_by_default && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          <HiLockOpen className="w-3 h-3" />
                          Free for all members
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-400 flex-wrap">
                      <span>{KIND_LABELS[offer.kind] || offer.kind}</span>
                      <span>{offer.resource_count || 0} resources</span>
                      {offer.primary_video_url && <span className="text-green-400">Video added</span>}
                      {offer.landing_page_url ? (
                        <span className="text-gray-500 truncate max-w-[220px]">
                          LP: {offer.landing_page_url}
                        </span>
                      ) : (
                        // Only actionable for offers that can actually render
                        // locked — the others never show a "Get Access" button.
                        offer.kind !== 'consult' &&
                        !offer.unlocked_by_default && (
                          <span className="text-yellow-500">No landing page URL</span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(offer)}
                      title={offer.is_active ? 'Hide from vault' : 'Show in vault'}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {offer.is_active ? (
                        <HiEye className="w-5 h-5" />
                      ) : (
                        <HiEyeOff className="w-5 h-5" />
                      )}
                    </button>
                    <Link
                      to={`/admin/offers/${offer.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <HiPencil className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteOffer(offer)}
                      title="Delete offer"
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-sm text-gray-500">
          Grant or revoke access for individual members from{' '}
          <Link to="/admin/members" className="text-gold hover:underline">
            Members
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
