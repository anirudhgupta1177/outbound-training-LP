import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiRefresh,
  HiLogout,
  HiAcademicCap,
  HiCheck,
  HiArrowLeft,
  HiDocumentText,
  HiExclamation,
} from 'react-icons/hi';

export default function ChatbotKBPage() {
  const [content, setContent] = useState('');
  const [pristine, setPristine] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { logout, adminEmail, getToken } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoc();
  }, []);

  const fetchDoc = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/chatbot-kb', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to load knowledge base (${res.status})`);

      const text = data.doc?.content || '';
      setContent(text);
      setPristine(text);
      setUpdatedAt(data.doc?.updated_at || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isDirty = content !== pristine;

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Knowledge base content cannot be empty');
      return;
    }
    setError(null);
    setWarning('');
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/chatbot-kb', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save knowledge base');

      const saved = data.doc?.content ?? content;
      setContent(saved);
      setPristine(saved);
      setUpdatedAt(data.doc?.updated_at || null);
      if (data.warning) setWarning(data.warning);
      setSuccessMessage('Knowledge base updated — live in the chatbot within ~60 seconds');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setContent(pristine);
    setWarning('');
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <HiDocumentText className="w-7 h-7 text-gold" />
              Chatbot Knowledge Base
            </h2>
            <p className="text-gray-400 mt-1">
              The prose the assistant ("Ani") answers from — policies, FAQs, results, instructor, support.
            </p>
          </div>
          <button
            onClick={fetchDoc}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-[#111] border border-gray-800 rounded-xl text-sm text-gray-400">
          <p className="font-semibold text-gray-300 mb-1">What this controls</p>
          <ul className="list-disc list-inside space-y-1">
            <li>This Markdown is the editable prose the chatbot uses. Edits go live in the bot within ~60 seconds.</li>
            <li><span className="text-gray-300">Price</span> (from <code className="text-gold">Pricing</code>), the <span className="text-gray-300">module/lesson curriculum</span>, and the <span className="text-gray-300">included resources</span> are pulled <em>live</em> from the course platform and appended automatically — don't hardcode them here.</li>
            <li>Never paste discount/coupon codes here.</li>
          </ul>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-3">
            <HiCheck className="w-5 h-5 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {warning && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-start gap-3">
            <HiExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{warning}</div>
            <button onClick={() => setWarning('')} className="underline hover:no-underline">
              Dismiss
            </button>
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
          <div className="bg-[#111] border border-gray-800 rounded-xl p-4 sm:p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              placeholder="The chatbot knowledge base (Markdown)…"
              className="w-full min-h-[60vh] px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-gray-100 font-mono text-sm leading-relaxed focus:border-gold focus:ring-1 focus:ring-gold resize-y"
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-gray-500">
                {content.length.toLocaleString()} characters
                {updatedAt ? ` · Last updated: ${new Date(updatedAt).toLocaleString()}` : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  disabled={!isDirty || isSaving}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  className="px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
