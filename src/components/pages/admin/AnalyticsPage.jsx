import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiRefresh,
  HiLogout,
  HiAcademicCap,
  HiCurrencyRupee,
  HiCurrencyDollar,
  HiGlobe,
  HiFlag,
  HiDocumentText,
  HiArrowLeft,
  HiFilter,
  HiCheck,
  HiX,
  HiChartBar
} from 'react-icons/hi';

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const { logout, adminEmail, getToken } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedRegion]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedRegion !== 'all') params.append('region', selectedRegion);

      const response = await fetch(`/api/admin/analytics?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setSummary(data.summary || null);
      setAvailableMonths(data.availableMonths || []);
      setDebugInfo(data.debug || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  const formatMonthLabel = (monthStr) => {
    if (!monthStr) return 'All Time';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
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
              <HiChartBar className="w-7 h-7 text-gold" />
              Sales Analytics
            </h2>
            <p className="text-gray-400">
              Track your sales performance and revenue
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <HiRefresh className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4 p-4 bg-[#111] border border-gray-800 rounded-xl">
          <div className="flex items-center gap-2 text-gray-400">
            <HiFilter className="w-5 h-5" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
            >
              <option value="">All Time</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
            >
              <option value="all">All Regions</option>
              <option value="INDIA">India (Domestic)</option>
              <option value="INTERNATIONAL">International</option>
            </select>
          </div>

          {(selectedMonth || selectedRegion !== 'all') && (
            <button
              onClick={() => {
                setSelectedMonth('');
                setSelectedRegion('all');
              }}
              className="text-sm text-gray-400 hover:text-white underline"
            >
              Clear filters
            </button>
          )}
        </div>

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

        {/* Debug Info (temporary) */}
        {debugInfo && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-400 font-medium mb-2">Debug Info:</p>
            <pre className="text-xs text-gray-400 overflow-x-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Orders */}
                <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                      <HiDocumentText className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-gray-400 text-sm">Total Orders</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{summary.totalOrders}</p>
                </div>

                {/* Domestic Revenue (INR) */}
                <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <HiCurrencyRupee className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-gray-400 text-sm">Domestic (INR)</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-400">
                    ₹{summary.totalRevenue.INR.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {summary.byRegion.INDIA.count} orders
                  </p>
                </div>

                {/* International Revenue (USD) */}
                <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <HiCurrencyDollar className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-gray-400 text-sm">International (USD)</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">
                    ${summary.totalRevenue.USD.toLocaleString('en-US')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {summary.byRegion.INTERNATIONAL?.count || 0} orders
                  </p>
                </div>

                {/* GST Invoices */}
                <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <HiFlag className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-gray-400 text-sm">GST Invoices</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">
                    {summary.gstInvoices.total}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {summary.gstInvoices.sent} sent
                  </p>
                </div>
              </div>
            )}

            {/* Region Breakdown */}
            {summary && (
              <div className="mb-8 bg-[#111] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HiGlobe className="w-5 h-5 text-gold" />
                  Revenue by Region
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0a0a0a] rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <HiFlag className="w-4 h-4 text-emerald-400" />
                      <p className="text-emerald-400 text-sm font-medium">India (Domestic)</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ₹{(summary.byRegion.INDIA?.revenue || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-gray-500">{summary.byRegion.INDIA?.count || 0} orders</p>
                  </div>
                  <div className="p-4 bg-[#0a0a0a] rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <HiGlobe className="w-4 h-4 text-blue-400" />
                      <p className="text-blue-400 text-sm font-medium">International</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      ${(summary.byRegion.INTERNATIONAL?.revenue || 0).toLocaleString('en-US')}
                    </p>
                    <p className="text-sm text-gray-500">{summary.byRegion.INTERNATIONAL?.count || 0} orders</p>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Table */}
            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  Orders {selectedMonth && `- ${formatMonthLabel(selectedMonth)}`}
                </h3>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <HiDocumentText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No orders found</p>
                  {(selectedMonth || selectedRegion !== 'all') && (
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800 bg-[#0a0a0a]">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Region
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          GST Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Coupon
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white text-sm font-medium">{order.customer_email}</p>
                            <p className="text-gray-500 text-xs">{order.customer_name || '-'}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-white font-medium">
                              {formatCurrency((order.amount || 0) / 100, order.currency)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.region === 'INDIA'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {order.region === 'INDIA' ? 'India' : 'International'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.has_gst ? (
                              <span
                                className={`inline-flex items-center gap-1 text-xs ${
                                  order.invoice_sent ? 'text-emerald-400' : 'text-yellow-400'
                                }`}
                              >
                                {order.invoice_sent ? (
                                  <>
                                    <HiCheck className="w-4 h-4" />
                                    Sent
                                  </>
                                ) : (
                                  <>
                                    <HiX className="w-4 h-4" />
                                    Pending
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {order.coupon_code || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
