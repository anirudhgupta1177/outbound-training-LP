import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiPlus,
  HiRefresh,
  HiSearch,
  HiMail,
  HiTrash,
  HiLogout,
  HiAcademicCap,
  HiUsers,
  HiX,
  HiCheck,
  HiArrowLeft
} from 'react-icons/hi';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // New member form state
  const [newMember, setNewMember] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: ''
  });

  const { logout, adminEmail, getToken } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    // Filter members based on search query
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(
        members.filter(
          m =>
            m.email?.toLowerCase().includes(query) ||
            m.first_name?.toLowerCase().includes(query) ||
            m.last_name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, members]);

  const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/members', {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data.members || []);
      setFilteredMembers(data.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.email.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(newMember)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      setSuccessMessage(`Member added! Welcome email sent to ${newMember.email}`);
      setNewMember({ email: '', first_name: '', last_name: '', phone: '' });
      setIsAddingMember(false);
      fetchMembers();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async (member) => {
    if (!confirm(`Resend credentials to ${member.email}? This will generate a new password.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          action: 'resend',
          user_id: member.id,
          email: member.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email');
      }

      setSuccessMessage(`New credentials sent to ${member.email}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMember = async (member) => {
    if (
      !confirm(
        `Are you sure you want to delete ${member.email}? This will remove their account and all progress data.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/members?id=${member.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      setSuccessMessage(`Member ${member.email} has been deleted`);
      fetchMembers();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <HiUsers className="w-7 h-7 text-gold" />
              Members
            </h2>
            <p className="text-gray-400">
              {members.length} total members
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMembers}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <HiRefresh className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsAddingMember(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Add Member
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-3">
            <HiCheck className="w-5 h-5 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Add Member Modal */}
        {isAddingMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border border-gray-800 rounded-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">Add New Member</h3>
                <button
                  onClick={() => {
                    setIsAddingMember(false);
                    setNewMember({ email: '', first_name: '', last_name: '', phone: '' });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="member@example.com"
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={newMember.first_name}
                      onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                      placeholder="John"
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={newMember.last_name}
                      onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>

                <p className="text-sm text-gray-500">
                  A welcome email with login credentials will be sent to the member.
                </p>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingMember(false);
                      setNewMember({ email: '', first_name: '', last_name: '', phone: '' });
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <HiPlus className="w-5 h-5" />
                        Add Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-12 pr-4 py-3 bg-[#111] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>

        {/* Members Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20">
            <HiUsers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No members found' : 'No members yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first member to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddingMember(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
              >
                <HiPlus className="w-5 h-5" />
                Add First Member
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Member
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Progress
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Last Active
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{member.email}</p>
                          <p className="text-sm text-gray-500">
                            {[member.first_name, member.last_name].filter(Boolean).join(' ') ||
                              'No name'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-300">{formatDate(member.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {member.lessons_completed}
                          </span>
                          <span className="text-gray-500">lessons</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">
                          {formatDateTime(member.last_accessed || member.last_sign_in)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResendEmail(member)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Resend credentials"
                          >
                            <HiMail className="w-4 h-4" />
                            Resend
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete member"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
