import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer, Download } from 'lucide-react';
import { generateDailySummaryPDF } from '../utils/pdfExport';
import toast from 'react-hot-toast';

const DailySummaryReport = () => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/reports/daily-closing-summary?date=${reportDate}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to fetch daily summary report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, [reportDate]);

  const handleExportPDF = () => {
    if (!data) return;
    generateDailySummaryPDF(data);
    toast.success('PDF generated successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !data) {
    return <div className="flex justify-center items-center h-64">Loading report...</div>;
  }

  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-300 shadow-sm text-black print:p-0 print:border-none print:shadow-none font-sans min-h-screen">
      
      {/* Action Bar (Hidden on Print) */}
      <div className="flex justify-between items-center mb-6 print:hidden border-b pb-4">
        <div className="flex items-center gap-4">
          <label className="font-bold">Select Date:</label>
          <input
            type="date"
            className="border border-gray-400 px-2 py-1"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex items-center gap-1 bg-gray-200 px-4 py-1 border border-black hover:bg-gray-300 text-sm">
            <Printer className="w-4 h-4"/> Print
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1 bg-red-600 text-white px-4 py-1 border border-black hover:bg-red-700 text-sm">
            <Download className="w-4 h-4"/> Export PDF
          </button>
        </div>
      </div>

      {/* REPORT CONTENT - Mimics the PDF / Paper Exactly */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase text-red-600 tracking-wider">Belwin Bankers</h1>
        <h2 className="text-lg font-semibold mt-1 text-gray-800">Daily Summary Report</h2>
      </div>

      <div className="flex justify-between items-end mb-2 font-bold text-sm">
        <div>Date : {data.date.split('-').reverse().join('-')}</div>
        <div></div>
      </div>

      <div className="flex justify-between items-end mb-4 font-bold text-sm border-b-2 border-black pb-2">
        <div>OPENING BALANCE : {data.openingBalance}</div>
        <div>CLOSING BALANCE : {data.closingBalance}</div>
      </div>

      {/* Side by Side Ledger */}
      <div className="grid grid-cols-2 gap-0 border-2 border-black text-sm mb-4">
        {/* Left Side: INCOME */}
        <div className="border-r-2 border-black">
          <div className="grid grid-cols-[1fr_80px] border-b border-black font-bold">
            <div className="p-2 text-center border-r border-black">TITLE</div>
            <div className="p-2 text-center">Amt.</div>
          </div>
          <div className="min-h-[250px]">
            {data.income.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_80px] border-b border-gray-300">
                <div className="p-1 pl-2 border-r border-gray-300 truncate">{item.title}</div>
                <div className="p-1 pr-2 text-right">{item.amount || ''}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: EXPENSE */}
        <div>
          <div className="grid grid-cols-[1fr_80px] border-b border-black font-bold">
            <div className="p-2 border-r border-black">EXPENSE TITLE</div>
            <div className="p-2 text-center">AMOUNT</div>
          </div>
          <div className="min-h-[250px]">
            {data.expense.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_80px] border-b border-gray-300">
                <div className="p-1 pl-2 border-r border-gray-300 truncate">{item.title}</div>
                <div className="p-1 pr-2 text-right">{item.amount || ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Totals Row */}
      <div className="grid grid-cols-2 gap-0 font-bold text-sm mb-8">
        <div className="pl-2 uppercase">TOTAL INCOME RS. {data.income.total}</div>
        <div className="pl-2 uppercase text-right pr-4">TOTAL EXPENSE AMOUNT RS. {data.expense.total}</div>
      </div>

      {/* Denominations & Signature */}
      <div className="grid grid-cols-2 gap-8 text-sm mb-8">
        <div>
          <div className="font-bold mb-2 uppercase">Cash Denomination</div>
          {['2000', '500', '200', '100', '50', '20', '10', '5', '2', '1'].map((note) => {
            const count = data.denominations.notes[note]?.count || '';
            const amount = data.denominations.notes[note]?.amount || '';
            return (
              <div key={note} className="flex mb-1">
                <div className="w-16">{note} x</div>
                <div className="w-12 text-center">{count}</div>
                <div className="w-4">=</div>
                <div className="w-24 text-right">{amount}</div>
              </div>
            );
          })}
          <div className="flex mb-1">
            <div className="w-16">Coins</div>
            <div className="w-12 text-center"></div>
            <div className="w-4">=</div>
            <div className="w-24 text-right">{data.denominations.notes['Coins']?.amount || ''}</div>
          </div>
          <div className="border-t border-black w-60 mt-2 mb-1"></div>
          <div className="flex font-bold">
            <div className="w-28">Total :</div>
            <div className="w-32 text-right">{data.denominations.total}</div>
          </div>
          <div className="border-t border-black w-60 mt-1"></div>
        </div>

        <div className="flex flex-col justify-end items-end pb-4 pr-10 relative">
          <div className="w-40 h-40 border-2 border-blue-800 rounded-full flex items-center justify-center opacity-30 absolute top-0 right-32 rotate-[-15deg] pointer-events-none">
            <div className="text-center text-blue-800 font-bold text-xs uppercase">
              <div className="tracking-widest mb-4">BELWIN BANKERS</div>
              <div className="border-t-2 border-b-2 border-blue-800 py-1">PUDUKKOTTAI-1</div>
              <div className="mt-4">★ ★ ★</div>
            </div>
          </div>
          <div className="mt-20">
            <div className="text-xl italic text-blue-900 -rotate-12 mr-10">{data.date.split('-').reverse().join('/')}</div>
          </div>
        </div>
      </div>

      {/* Gold Stock */}
      <div className="text-sm">
        <div className="font-bold mb-2">Branch Stock :</div>
        <table className="border-collapse border border-black w-64">
          <tbody>
            {data.goldStock.map((stock, idx) => (
              <tr key={idx}>
                <td className="border border-black px-2 py-1 uppercase">{stock.loanId}-{stock.customerName}</td>
                <td className="border border-black px-2 py-1 text-right">{stock.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default DailySummaryReport;
