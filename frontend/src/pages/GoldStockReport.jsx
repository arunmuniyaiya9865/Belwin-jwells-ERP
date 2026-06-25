import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Filter, Box, Scale, Tag, Gavel } from 'lucide-react';

const GoldStockReport = () => {
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState({
    totalArticles: 0,
    totalGrossWeight: 0,
    totalNetWeight: 0,
    auctionReadyArticles: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    stockId: '',
    loanId: '',
    customerId: '',
    status: '',
    fromDate: '',
    toDate: ''
  });

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`http://localhost:5000/api/gold-stocks/report?${queryParams.toString()}`);
      if (response.data.success) {
        setStocks(response.data.data);
        setSummary(response.data.summary);
      }
    } catch (error) {
      toast.error('Failed to fetch gold stock report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return 'text-blue-500 border-blue-500 bg-blue-500/10';
      case 'Released': return 'text-green-500 border-green-500 bg-green-500/10';
      case 'Auction Ready': return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      case 'Auctioned': return 'text-red-500 border-red-500 bg-red-500/10';
      default: return 'text-gray-400 border-gray-600 bg-gray-800';
    }
  };

  const inp = "w-full px-3 py-2 bg-erp-dark border border-erp-green-dark rounded-md text-text-primary focus:outline-none focus:border-black text-sm";
  const lbl = "block text-xs font-medium text-text-secondary mb-1";

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
          <Box className="w-6 h-6 text-black" />
          Gold Stock Ledger
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-gradient-to-br from-blue-900 to-blue-950 p-4 rounded-xl border border-blue-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Total Articles</p>
            <p className="text-2xl font-bold text-white">{summary.totalArticles}</p>
          </div>
          <div className="p-3 bg-blue-500/20 rounded-full border border-blue-400/30">
            <Tag className="w-6 h-6 text-blue-300" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900 to-purple-950 p-4 rounded-xl border border-purple-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-purple-200 text-sm font-medium mb-1">Gross Weight (g)</p>
            <p className="text-2xl font-bold text-white">{summary.totalGrossWeight}</p>
          </div>
          <div className="p-3 bg-purple-500/20 rounded-full border border-purple-400/30">
            <Scale className="w-6 h-6 text-purple-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-4 rounded-xl border border-emerald-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-emerald-200 text-sm font-medium mb-1">Net Weight (g)</p>
            <p className="text-2xl font-bold text-white">{summary.totalNetWeight}</p>
          </div>
          <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-400/30">
            <Scale className="w-6 h-6 text-emerald-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-900 to-amber-950 p-4 rounded-xl border border-amber-800 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-amber-200 text-sm font-medium mb-1">Auction Ready</p>
            <p className="text-2xl font-bold text-white">{summary.auctionReadyArticles}</p>
          </div>
          <div className="p-3 bg-amber-500/20 rounded-full border border-amber-400/30">
            <Gavel className="w-6 h-6 text-amber-300" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-erp-card rounded-lg shadow-lg p-5 shrink-0 border border-erp-green-dark">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary">Filter Ledger</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
          <div><label className={lbl}>Stock ID</label><input type="text" name="stockId" value={filters.stockId} onChange={handleFilterChange} className={inp} placeholder="GSTK..." /></div>
          <div><label className={lbl}>Loan ID</label><input type="text" name="loanId" value={filters.loanId} onChange={handleFilterChange} className={inp} placeholder="LOAN..." /></div>
          <div><label className={lbl}>Customer ID</label><input type="text" name="customerId" value={filters.customerId} onChange={handleFilterChange} className={inp} placeholder="CUST..." /></div>
          <div>
            <label className={lbl}>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className={inp}>
              <option value="">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Released">Released</option>
              <option value="Auction Ready">Auction Ready</option>
              <option value="Auctioned">Auctioned</option>
            </select>
          </div>
          <div><label className={lbl}>From Date</label><input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilterChange} className={inp} /></div>
          <div><label className={lbl}>To Date</label><input type="date" name="toDate" value={filters.toDate} onChange={handleFilterChange} className={inp} /></div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-erp-card rounded-lg shadow-lg overflow-x-auto flex-1 flex flex-col border border-erp-green-dark">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-erp-dark z-10 shadow-sm border-b border-erp-green-dark">
              <tr>
                <th className="p-3 text-text-secondary font-medium text-sm">Date</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Stock ID</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Loan ID</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Customer</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Article</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Gross (g)</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Net (g)</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Purity</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Appraised (₹)</th>
                <th className="p-3 text-text-secondary font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="text-center p-8 text-text-secondary"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div></td></tr>
              ) : stocks.length === 0 ? (
                <tr><td colSpan="10" className="text-center p-8 text-text-secondary font-medium">No stock records found matching filters.</td></tr>
              ) : (
                stocks.map((stock) => (
                  <tr key={stock._id} className="border-b border-erp-green-dark hover:bg-erp-dark/50 transition-colors text-sm">
                    <td className="p-3 text-text-primary">{formatDate(stock.stockDate)}</td>
                    <td className="p-3 text-black font-semibold">{stock.stockId}</td>
                    <td className="p-3 text-black font-semibold">{stock.loanId}</td>
                    <td className="p-3 text-text-primary">
                      <div className="font-medium text-black">{stock.customerName}</div>
                      <div className="text-xs text-text-secondary">{stock.customerId}</div>
                    </td>
                    <td className="p-3 text-text-primary">
                      <div className="font-medium">{stock.articleName}</div>
                      <div className="text-xs text-text-secondary">{stock.articleType}</div>
                    </td>
                    <td className="p-3 text-text-primary">{stock.grossWeight}</td>
                    <td className="p-3 text-text-primary">{stock.netWeight}</td>
                    <td className="p-3 text-text-primary">{stock.purity}</td>
                    <td className="p-3 text-text-primary">₹{stock.appraisedValue}</td>
                    <td className="p-3">
                       <span className={`px-2.5 py-1 border rounded-md text-xs font-semibold ${getStatusColor(stock.status)}`}>
                         {stock.status}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GoldStockReport;
