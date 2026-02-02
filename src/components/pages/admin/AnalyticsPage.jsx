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
  HiChartBar,
  HiDownload,
  HiPrinter
} from 'react-icons/hi';

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  // Invoice generation
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isGeneratingInvoices, setIsGeneratingInvoices] = useState(false);
  const [invoiceMonth, setInvoiceMonth] = useState('');

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

  const generateInvoices = async () => {
    if (!invoiceMonth) {
      alert('Please select a month');
      return;
    }
    
    setIsGeneratingInvoices(true);
    try {
      const response = await fetch('/api/admin/generate-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ month: invoiceMonth })
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoices');
      }

      const data = await response.json();
      setInvoiceData(data);
      setShowInvoiceModal(true);
    } catch (err) {
      alert('Error generating invoices: ' + err.message);
    } finally {
      setIsGeneratingInvoices(false);
    }
  };

  // Generate HTML for a single invoice
  const generateInvoiceHTML = (invoice) => {
    return `
      <div class="invoice-page">
        <div class="header">
          <h1>TAX INVOICE</h1>
          <p><span class="type-badge ${invoice.type.toLowerCase()}">${invoice.type}</span></p>
        </div>
        
        <div class="invoice-details">
          <div>
            <h3>FROM (SELLER)</h3>
            <p><strong>${invoice.seller.name}</strong></p>
            <p><strong>GSTIN:</strong> ${invoice.seller.gstin}</p>
            <p>${invoice.seller.address}</p>
          </div>
          <div style="text-align: right;">
            <h3>INVOICE DETAILS</h3>
            <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoice.date}</p>
            <p><strong>Order Date:</strong> ${invoice.orderDate}</p>
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="buyer-section">
            <h3>BILL TO (BUYER)</h3>
            <p><strong>${invoice.customerName}</strong></p>
            ${invoice.customerGstin ? `<p class="buyer-gstin"><strong>GSTIN:</strong> ${invoice.customerGstin}</p>` : ''}
            <p><strong>Email:</strong> ${invoice.customerEmail}</p>
            <p><strong>Payment ID:</strong> ${invoice.customerId}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Description</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Outbound Training Course</td>
              <td style="text-align: right;">₹${invoice.baseAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td></td>
              <td>CGST @ 9%</td>
              <td style="text-align: right;">₹${invoice.cgst.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td></td>
              <td>SGST @ 9%</td>
              <td style="text-align: right;">₹${invoice.sgst.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="total-row">
              <td></td>
              <td><strong>Total</strong></td>
              <td style="text-align: right;"><strong>₹${invoice.amount.toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
    `;
  };

  // Common styles for invoice PDFs
  const getInvoiceStyles = () => `
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .invoice-page { page-break-after: always; padding: 20px 0; }
    .invoice-page:last-child { page-break-after: avoid; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .header h1 { margin: 0; color: #333; }
    .header p { margin: 5px 0; color: #666; }
    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .invoice-details div { flex: 1; }
    .invoice-details h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .invoice-details p { margin: 3px 0; font-size: 13px; color: #555; }
    .buyer-section { background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #ddd; }
    .buyer-gstin { color: #2e7d32; font-size: 14px !important; margin: 8px 0 !important; padding: 5px 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
    .total-row { font-weight: bold; background: #f9f9f9; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
    .type-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .b2c { background: #e3f2fd; color: #1565c0; }
    .b2b { background: #e8f5e9; color: #2e7d32; }
    .combined-header { text-align: center; margin-bottom: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; }
    .combined-header h1 { margin: 0 0 10px 0; }
    .combined-header p { margin: 5px 0; color: #666; }
    @media print { 
      body { padding: 0; } 
      .invoice-page { padding: 10px 0; }
    }
  `;

  // Print a single invoice
  const printInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>${getInvoiceStyles()}</style>
      </head>
      <body>
        ${generateInvoiceHTML(invoice)}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Print all invoices of a specific type (B2B or B2C) as combined PDF
  const printAllInvoices = (type) => {
    if (!invoiceData) return;
    
    const invoices = invoiceData.invoices.filter(inv => inv.type === type);
    if (invoices.length === 0) {
      alert(`No ${type} invoices found`);
      return;
    }

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalBase = invoices.reduce((sum, inv) => sum + inv.baseAmount, 0);
    const totalGst = invoices.reduce((sum, inv) => sum + inv.totalGst, 0);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${type} Invoices - ${invoiceData.month}</title>
        <style>${getInvoiceStyles()}</style>
      </head>
      <body>
        <div class="combined-header">
          <h1>${type} TAX INVOICES</h1>
          <p><strong>Period:</strong> ${invoiceData.month}</p>
          <p><strong>Total Invoices:</strong> ${invoices.length}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
          <p><strong>Base Amount:</strong> ₹${Math.round(totalBase * 100) / 100} | <strong>GST:</strong> ₹${Math.round(totalGst * 100) / 100}</p>
        </div>
        ${invoices.map(invoice => generateInvoiceHTML(invoice)).join('')}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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

        {/* Generate Invoices Section */}
        <div className="mb-6 p-4 bg-[#111] border border-gray-800 rounded-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <HiDocumentText className="w-5 h-5" />
              <span className="text-sm font-medium">Generate Monthly Invoices:</span>
            </div>
            
            <select
              value={invoiceMonth}
              onChange={(e) => setInvoiceMonth(e.target.value)}
              className="px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
            >
              <option value="">Select Month</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
            
            <button
              onClick={generateInvoices}
              disabled={!invoiceMonth || isGeneratingInvoices}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingInvoices ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <HiDownload className="w-4 h-4" />
                  Generate Invoices
                </>
              )}
            </button>
          </div>
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

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#111]">
              <div>
                <h3 className="text-xl font-bold text-white">Generated Invoices</h3>
                <p className="text-gray-400 text-sm">{invoiceData.month}</p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Summary */}
              <div className="mb-6 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
                <h4 className="text-lg font-semibold text-white mb-3">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-white font-bold">{invoiceData.summary.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">B2C Orders</p>
                    <p className="text-blue-400 font-bold">{invoiceData.summary.b2cOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">B2B Orders</p>
                    <p className="text-emerald-400 font-bold">{invoiceData.summary.b2bOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-gold font-bold">₹{invoiceData.summary.totalRevenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Base Amount</p>
                    <p className="text-white">₹{invoiceData.summary.totalBaseAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">CGST (9%)</p>
                    <p className="text-white">₹{invoiceData.summary.cgst.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">SGST (9%)</p>
                    <p className="text-white">₹{invoiceData.summary.sgst.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Invoice List */}
              {invoiceData.invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No domestic orders found for this month
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Print All Buttons */}
                  <div className="flex flex-wrap gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
                    <span className="text-gray-400 text-sm self-center">Download Combined PDF:</span>
                    <button
                      onClick={() => printAllInvoices('B2B')}
                      disabled={invoiceData.summary.b2bOrders === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiDownload className="w-4 h-4" />
                      All B2B Invoices ({invoiceData.summary.b2bOrders})
                    </button>
                    <button
                      onClick={() => printAllInvoices('B2C')}
                      disabled={invoiceData.summary.b2cOrders === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiDownload className="w-4 h-4" />
                      All B2C Invoices ({invoiceData.summary.b2cOrders})
                    </button>
                  </div>

                  <h4 className="text-lg font-semibold text-white">
                    Individual Invoices ({invoiceData.invoices.length})
                  </h4>
                  {invoiceData.invoices.map((invoice) => (
                    <div
                      key={invoice.invoiceNumber}
                      className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            invoice.type === 'B2C'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {invoice.type}
                        </span>
                        <div>
                          <p className="text-white font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-gray-400 text-sm">{invoice.customerName}</p>
                          {invoice.customerGstin && (
                            <p className="text-emerald-400 text-xs">GSTIN: {invoice.customerGstin}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-white font-medium">
                          ₹{invoice.amount.toLocaleString('en-IN')}
                        </p>
                        <button
                          onClick={() => printInvoice(invoice)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <HiPrinter className="w-4 h-4" />
                          Print
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
