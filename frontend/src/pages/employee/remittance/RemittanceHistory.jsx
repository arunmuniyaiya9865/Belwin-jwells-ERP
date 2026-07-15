import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { FileText, FileDown } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../../utils/exportUtils';

const RemittanceHistory = () => {
  const [remittances, setRemittances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRemittances();
  }, []);

  const fetchRemittances = async () => {
    try {
      const response = await api.get('/remittances');
      if (response.data.success) {
        setRemittances(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch remittance history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const handleExportExcel = () => {
    const headers = ['Date', 'Remittance No', 'Type', 'Amount', 'From Person', 'To Person', 'Mode', 'Ref No', 'Status', 'Entered By'];
    const mapper = r => [
      r.date ? new Date(r.date).toLocaleDateString() : '',
      r.remittanceNo || '',
      r.remittanceType || '',
      r.amount || 0,
      r.fromPerson || '',
      r.toPerson || '',
      r.paymentMode || '',
      r.referenceNo || '',
      r.status || '',
      r.enteredBy || ''
    ];
    exportToExcel(remittances, headers, mapper, `Remittance_History_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPDF = () => {
    const headers = ['Date', 'Remittance No', 'Type', 'Amount', 'From Person', 'To Person', 'Mode', 'Ref No', 'Status'];
    const mapper = r => [
      r.date ? new Date(r.date).toLocaleDateString() : '',
      r.remittanceNo || '',
      r.remittanceType || '',
      r.amount || 0,
      r.fromPerson || '',
      r.toPerson || '',
      r.paymentMode || '',
      r.referenceNo || '',
      r.status || ''
    ];
    exportToPDF(remittances, headers, mapper, 'Remittance History', `Remittance_History_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-black">Remittance History</h2>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors text-sm">
            <FileText size={16} /> PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-erp-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm">
            <FileDown size={16} /> Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-erp-dark border-b border-erp-green-dark">
              <th className="p-4 text-text-secondary font-medium">Date</th>
              <th className="p-4 text-text-secondary font-medium">Remittance No</th>

              <th className="p-4 text-text-secondary font-medium">Type</th>
              <th className="p-4 text-text-secondary font-medium">Amount</th>
              <th className="p-4 text-text-secondary font-medium">From Person</th>
              <th className="p-4 text-text-secondary font-medium">To Person</th>
              <th className="p-4 text-text-secondary font-medium">Mode</th>
              <th className="p-4 text-text-secondary font-medium">Reference No</th>
              <th className="p-4 text-text-secondary font-medium">Status</th>
              <th className="p-4 text-text-secondary font-medium">Entered By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center p-4 text-text-secondary">Loading...</td>
              </tr>
            ) : remittances.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center p-4 text-text-secondary">No remittances found.</td>
              </tr>
            ) : (
              remittances.map((remittance) => (
                <tr key={remittance._id} className="border-b border-erp-green-dark hover:bg-erp-dark/50 transition-colors">
                  <td className="p-4 text-text-primary whitespace-nowrap">{formatDate(remittance.date)}</td>
                  <td className="p-4 text-text-primary font-medium">{remittance.remittanceNo}</td>

                  <td className="p-4 text-text-primary">
                    <span className="px-2 py-1 bg-black border border-black text-white text-xs rounded-full whitespace-nowrap">
                      {remittance.remittanceType}
                    </span>
                  </td>
                  <td className="p-4 text-green-400 font-semibold">₹{remittance.amount.toLocaleString()}</td>
                  <td className="p-4 text-text-primary">{remittance.fromPerson}</td>
                  <td className="p-4 text-text-primary">{remittance.toPerson}</td>
                  <td className="p-4 text-text-primary">{remittance.paymentMode}</td>
                  <td className="p-4 text-text-primary">{remittance.referenceNo || '-'}</td>
                  <td className="p-4 text-text-primary">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        remittance.status === 'Completed' ? 'bg-green-900/30 text-green-400 border border-green-700' :
                        'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                    }`}>
                        {remittance.status}
                    </span>
                  </td>
                  <td className="p-4 text-text-primary">{remittance.enteredBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RemittanceHistory;
