import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiArrowLeft,
  HiSave,
  HiPlus,
  HiTrash,
  HiCheck,
  HiX,
  HiExternalLink,
  HiLink,
} from 'react-icons/hi';

const KIND_OPTIONS = [
  { value: 'course', label: 'Full course' },
  { value: 'micro_course', label: 'Micro-course' },
  { value: 'consult', label: 'Call / consult' },
];

const ACCENT_OPTIONS = [
  { value: 'cyan', label: 'Cyan' },
  { value: 'amber', label: 'Amber' },
  { value: 'purple', label: 'Purple' },
  { value: 'emerald', label: 'Emerald' },
];

const RESOURCE_TYPES = [
  { value: 'link', label: 'Link' },
  { value: 'tool', label: 'Tool' },
  { value: 'whimsical', label: 'Whimsical' },
  { value: 'drive', label: 'Google Drive' },
  { value: 'doc', label: 'Document' },
  { value: 'notion', label: 'Notion' },
  { value: 'video', label: 'Video' },
  { value: 'file', label: 'File' },
];

const EMPTY_RESOURCE = { title: '', url: '', type: 'link', description: '' };

const inputClass =
  'w-full px-4 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold';

function Field({ label, hint, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}

export default function OfferEditor() {
  const { id: offerId } = useParams();
  const { getToken } = useAdminAuth();

  const [form, setForm] = useState(null);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState(EMPTY_RESOURCE);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [resourceDraft, setResourceDraft] = useState(EMPTY_RESOURCE);

  useEffect(() => {
    fetchOffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  const flashSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const authHeaders = (json = false) => ({
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchOffer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/offers?id=${offerId}`, { headers: authHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch offer');

      const offer = data.offer;
      setForm({
        title: offer.title || '',
        slug: offer.slug || '',
        subtitle: offer.subtitle || '',
        description: offer.description || '',
        kind: offer.kind || 'course',
        badge: offer.badge || '',
        duration_label: offer.duration_label || '',
        accent: offer.accent || 'cyan',
        highlights: (offer.highlights || []).join('\n'),
        portal_path: offer.portal_path || '',
        landing_page_url: offer.landing_page_url || '',
        cta_url: offer.cta_url || '',
        cta_label: offer.cta_label || '',
        locked_cta_label: offer.locked_cta_label || '',
        primary_video_url: offer.primary_video_url || '',
        primary_video_title: offer.primary_video_title || '',
        unlocked_by_default: !!offer.unlocked_by_default,
        is_active: !!offer.is_active,
      });
      setResources(data.resources || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setError('Title and slug are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/offers?id=${offerId}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({
          ...form,
          highlights: form.highlights
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save offer');

      flashSuccess('Offer saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.url.trim()) return;

    setError(null);
    try {
      const response = await fetch('/api/admin/offers?entity=resource', {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify({ ...newResource, offer_id: offerId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add resource');

      setResources((prev) => [...prev, data.resource]);
      setNewResource(EMPTY_RESOURCE);
      setIsAddingResource(false);
      flashSuccess('Resource added');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateResource = async (resourceId) => {
    if (!resourceDraft.title.trim() || !resourceDraft.url.trim()) return;

    setError(null);
    try {
      const response = await fetch(`/api/admin/offers?entity=resource&id=${resourceId}`, {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify(resourceDraft),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update resource');

      setResources((prev) => prev.map((r) => (r.id === resourceId ? data.resource : r)));
      setEditingResourceId(null);
      flashSuccess('Resource updated');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!confirm(`Delete resource "${resource.title}"?`)) return;

    setError(null);
    try {
      const response = await fetch(`/api/admin/offers?entity=resource&id=${resource.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete resource');

      setResources((prev) => prev.filter((r) => r.id !== resource.id));
      flashSuccess('Resource deleted');
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{error || 'Offer not found'}</p>
          <Link to="/admin/offers" className="text-gold hover:underline">
            ← Back to Offers
          </Link>
        </div>
      </div>
    );
  }

  const isConsult = form.kind === 'consult';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#111] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                to="/admin/offers"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <HiArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div className="h-6 w-px bg-gray-700 flex-shrink-0" />
              <h1 className="text-lg font-bold text-white truncate">{form.title || 'Edit Offer'}</h1>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HiSave className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-2">
            <HiCheck className="w-5 h-5" />
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

        <form onSubmit={handleSave} className="space-y-8">
          {/* Card copy */}
          <section className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Vault Card</h2>
            <p className="text-sm text-gray-400 mb-5">
              How this offer reads on the vault. Keep pricing out of it — the vault never shows
              prices.
            </p>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Offer title" htmlFor="title">
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    className={inputClass}
                    placeholder="Outbound Micro-Course"
                  />
                </Field>
                <Field label="Slug" htmlFor="slug" hint="Used in links and access records. Change with care.">
                  <input
                    id="slug"
                    type="text"
                    value={form.slug}
                    onChange={(e) => update('slug', e.target.value)}
                    className={inputClass}
                    placeholder="outbound-micro-course"
                  />
                </Field>
              </div>

              <Field label="Subtitle" htmlFor="subtitle">
                <input
                  id="subtitle"
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => update('subtitle', e.target.value)}
                  className={inputClass}
                  placeholder="The 2-Hour Marathon"
                />
              </Field>

              <Field label="Description" htmlFor="description">
                <textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  className={`${inputClass} resize-none`}
                  placeholder="What this offer does for the member..."
                />
              </Field>

              <Field
                label="Highlights"
                htmlFor="highlights"
                hint="One bullet per line. These show as ticks on the card."
              >
                <textarea
                  id="highlights"
                  rows={4}
                  value={form.highlights}
                  onChange={(e) => update('highlights', e.target.value)}
                  className={`${inputClass} resize-none font-mono text-sm`}
                  placeholder={'Launch a full cold email campaign\nThe exact infrastructure setup'}
                />
              </Field>

              <div className="grid sm:grid-cols-4 gap-4">
                <Field label="Badge" htmlFor="badge">
                  <input
                    id="badge"
                    type="text"
                    value={form.badge}
                    onChange={(e) => update('badge', e.target.value)}
                    className={inputClass}
                    placeholder="MICRO-COURSE"
                  />
                </Field>
                <Field label="Duration label" htmlFor="duration_label">
                  <input
                    id="duration_label"
                    type="text"
                    value={form.duration_label}
                    onChange={(e) => update('duration_label', e.target.value)}
                    className={inputClass}
                    placeholder="2 hours"
                  />
                </Field>
                <Field label="Type" htmlFor="kind">
                  <select
                    id="kind"
                    value={form.kind}
                    onChange={(e) => update('kind', e.target.value)}
                    className={inputClass}
                  >
                    {KIND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Accent colour" htmlFor="accent">
                  <select
                    id="accent"
                    value={form.accent}
                    onChange={(e) => update('accent', e.target.value)}
                    className={inputClass}
                  >
                    {ACCENT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </section>

          {/* Links */}
          <section className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Links & Buttons</h2>
            <p className="text-sm text-gray-400 mb-5">
              Unlocked members go to the portal path. Locked members go to the landing page — leave
              it empty and the button stays disabled rather than dead.
            </p>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Portal path (unlocked)"
                  htmlFor="portal_path"
                  hint="In-app route, e.g. /micro-course or /course"
                >
                  <input
                    id="portal_path"
                    type="text"
                    value={form.portal_path}
                    onChange={(e) => update('portal_path', e.target.value)}
                    className={inputClass}
                    placeholder="/micro-course"
                  />
                </Field>
                <Field
                  label="Landing page URL (locked)"
                  htmlFor="landing_page_url"
                  hint="Sales page members are sent to when they don't have access."
                >
                  <input
                    id="landing_page_url"
                    type="url"
                    value={form.landing_page_url}
                    onChange={(e) => update('landing_page_url', e.target.value)}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Unlocked button label" htmlFor="cta_label">
                  <input
                    id="cta_label"
                    type="text"
                    value={form.cta_label}
                    onChange={(e) => update('cta_label', e.target.value)}
                    className={inputClass}
                    placeholder="Start the Marathon"
                  />
                </Field>
                <Field label="Locked button label" htmlFor="locked_cta_label">
                  <input
                    id="locked_cta_label"
                    type="text"
                    value={form.locked_cta_label}
                    onChange={(e) => update('locked_cta_label', e.target.value)}
                    className={inputClass}
                    placeholder="Get Access"
                  />
                </Field>
              </div>

              <Field
                label="Direct CTA URL"
                htmlFor="cta_url"
                hint={
                  isConsult
                    ? 'Overrides the portal-wide booking link for this call offer. Leave empty to use Portal Settings.'
                    : 'Optional external URL used instead of the portal path.'
                }
              >
                <div className="relative">
                  <HiLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="cta_url"
                    type="url"
                    value={form.cta_url}
                    onChange={(e) => update('cta_url', e.target.value)}
                    className={`${inputClass} pl-11`}
                    placeholder="https://cal.com/..."
                  />
                </div>
              </Field>
            </div>
          </section>

          {/* Main video */}
          <section className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Main Video</h2>
            <p className="text-sm text-gray-400 mb-5">
              The primary Loom (or YouTube) embed shown at the top of this offer&apos;s page. Only
              members with access can see it.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Video URL" htmlFor="primary_video_url">
                <input
                  id="primary_video_url"
                  type="url"
                  value={form.primary_video_url}
                  onChange={(e) => update('primary_video_url', e.target.value)}
                  className={inputClass}
                  placeholder="https://www.loom.com/share/..."
                />
              </Field>
              <Field label="Video title" htmlFor="primary_video_title">
                <input
                  id="primary_video_title"
                  type="text"
                  value={form.primary_video_title}
                  onChange={(e) => update('primary_video_title', e.target.value)}
                  className={inputClass}
                  placeholder="Full 2-Hour Marathon"
                />
              </Field>
            </div>
          </section>

          {/* Access */}
          <section className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Access & Visibility</h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.unlocked_by_default}
                  onChange={(e) => update('unlocked_by_default', e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#00D4FF]"
                />
                <span>
                  <span className="block text-sm font-medium text-white">
                    Unlocked for every member
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Off means members only see it unlocked once you grant access on the Members page.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => update('is_active', e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#00D4FF]"
                />
                <span>
                  <span className="block text-sm font-medium text-white">Show in the vault</span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Turn off to hide this offer from members entirely.
                  </span>
                </span>
              </label>
            </div>
          </section>
        </form>

        {/* Resources */}
        <section className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden mt-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-800 gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-white">Resources</h2>
              <p className="text-sm text-gray-400">
                {resources.length} link{resources.length === 1 ? '' : 's'} shown to members with
                access. Use type &ldquo;Tool&rdquo; for software links.
              </p>
            </div>
            <button
              onClick={() => setIsAddingResource(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Add Resource
            </button>
          </div>

          {isAddingResource && (
            <form onSubmit={handleAddResource} className="p-6 border-b border-gray-800 bg-gray-900/50 space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Title" htmlFor="new_resource_title">
                  <input
                    id="new_resource_title"
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className={inputClass}
                    placeholder="Instantly.ai — Cold email sending"
                    autoFocus
                  />
                </Field>
                <Field label="URL" htmlFor="new_resource_url">
                  <input
                    id="new_resource_url"
                    type="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </Field>
                <Field label="Type" htmlFor="new_resource_type">
                  <select
                    id="new_resource_type"
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className={inputClass}
                  >
                    {RESOURCE_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Description (optional)" htmlFor="new_resource_description">
                <input
                  id="new_resource_description"
                  type="text"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  className={inputClass}
                  placeholder="What this is for..."
                />
              </Field>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingResource(false);
                    setNewResource(EMPTY_RESOURCE);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          {resources.length === 0 ? (
            <div className="p-12 text-center">
              <HiLink className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No resources yet</p>
              <button
                onClick={() => setIsAddingResource(true)}
                className="mt-4 text-gold hover:underline"
              >
                Add the first resource
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {resources.map((resource) =>
                editingResourceId === resource.id ? (
                  <div key={resource.id} className="p-6 bg-gray-900/50 space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Field label="Title" htmlFor={`edit_title_${resource.id}`}>
                        <input
                          id={`edit_title_${resource.id}`}
                          type="text"
                          value={resourceDraft.title}
                          onChange={(e) =>
                            setResourceDraft({ ...resourceDraft, title: e.target.value })
                          }
                          className={inputClass}
                        />
                      </Field>
                      <Field label="URL" htmlFor={`edit_url_${resource.id}`}>
                        <input
                          id={`edit_url_${resource.id}`}
                          type="url"
                          value={resourceDraft.url}
                          onChange={(e) =>
                            setResourceDraft({ ...resourceDraft, url: e.target.value })
                          }
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Type" htmlFor={`edit_type_${resource.id}`}>
                        <select
                          id={`edit_type_${resource.id}`}
                          value={resourceDraft.type}
                          onChange={(e) =>
                            setResourceDraft({ ...resourceDraft, type: e.target.value })
                          }
                          className={inputClass}
                        >
                          {RESOURCE_TYPES.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="Description" htmlFor={`edit_description_${resource.id}`}>
                      <input
                        id={`edit_description_${resource.id}`}
                        type="text"
                        value={resourceDraft.description || ''}
                        onChange={(e) =>
                          setResourceDraft({ ...resourceDraft, description: e.target.value })
                        }
                        className={inputClass}
                      />
                    </Field>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditingResourceId(null)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <HiX className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateResource(resource.id)}
                        className="flex items-center gap-2 px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
                      >
                        <HiCheck className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={resource.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-900/50 transition-colors"
                  >
                    <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs font-medium uppercase tracking-wide flex-shrink-0">
                      {resource.type}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{resource.title}</p>
                      <p className="text-xs text-gray-500 truncate">{resource.url}</p>
                      {resource.description && (
                        <p className="text-sm text-gray-400 truncate mt-0.5">
                          {resource.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open link"
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <HiExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          setEditingResourceId(resource.id);
                          setResourceDraft({
                            title: resource.title,
                            url: resource.url,
                            type: resource.type,
                            description: resource.description || '',
                          });
                        }}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResource(resource)}
                        title="Delete resource"
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
