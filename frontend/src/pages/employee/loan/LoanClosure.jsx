import React, { useState } from 'react';
import { Search, Printer, FileText, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { getClosureDetails, processClosure } from '../../../services/loanClosureService';
import { useLoanSearch } from '../../../hooks/useLoanSearch';
import LoanSearchBox from '../../../components/shared/LoanSearchBox';
import LoanSelectionList from '../../../components/shared/LoanSelectionList';
import toast from 'react-hot-toast';

const LoanClosure = () => {
    const { searchLoans, loading: isSearchingLoans, results, clearSearch } = useLoanSearch();
    const [isLoading, setIsLoading] = useState(false);
    const [closureData, setClosureData] = useState(null);

    // Form State
    const [closureType, setClosureType] = useState('Normal Closure');
    const [closureRemarks, setClosureRemarks] = useState('');
    
    // We mock "Closed By" from logged-in employee context, defaulting to Admin for now.
    const closedBy = 'Admin'; 

    const handleSearch = async (searchValue) => {
        setClosureData(null);
        const data = await searchLoans(searchValue);
        if (data && data.count === 1) {
            handleSelectLoan(data.results[0].loan.loanId);
        }
    };

    const handleSelectLoan = async (loanIdStr) => {
        setIsLoading(true);
        setClosureData(null);
        try {
            const res = await getClosureDetails(loanIdStr.toUpperCase());
            if (res.success) {
                setClosureData(res.data);
                if (res.data.closureEligibility.existingClosure) {
                    toast.success('Found existing closure record.');
                } else if (!res.data.closureEligibility.isEligible) {
                    toast.error('Loan is not eligible for closure.');
                } else {
                    toast.success('Loan verification complete. Ready for closure.');
                }
            }
        } catch (error) {
            toast.error(error.message || 'Error fetching loan details');
            setClosureData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClosure = async () => {
        if (!closureData || !closureData.closureEligibility.isEligible) return;

        const payload = {
            closureType,
            closureRemarks,
            closedBy,
            closureDate: new Date(),
            branch: closureData.customer.branch,
            employeeName: closedBy
        };

        try {
            const res = await processClosure(closureData.loan.loanId, payload);
            if (res.success) {
                toast.success('Loan successfully closed!');
                // Refetch to get the updated state (existingClosure populated)
                handleSearch({ preventDefault: () => {} });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to close loan');
        }
    };

    const handlePrintReceipt = () => {
        // Just triggering browser print. CSS will handle what gets printed.
        window.print();
    };

    // Helper functions for formatting
    const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB'); // dd/MM/yyyy format
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* NO-PRINT HEADER */}
            <div className="mb-6 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                    Loan Closure
                </h1>
                <p className="text-gray-500 mt-1">Verify zero-balance loans and perform formal closure.</p>
            </div>

            {/* SEARCH BAR (NO-PRINT) */}
            <div className="mb-6 print:hidden">
                {!closureData && (
                    <>
                        <LoanSearchBox onSearch={handleSearch} loading={isSearchingLoans} />
                        {results.length > 1 && (
                            <LoanSelectionList results={results} onSelectLoan={handleSelectLoan} />
                        )}
                    </>
                )}
                {isLoading && (
                    <div className="text-sm font-semibold text-gray-500 py-4">Verifying loan...</div>
                )}
                {closureData && (
                    <button
                        onClick={() => { setClosureData(null); clearSearch(); }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                        Change Loan
                    </button>
                )}
            </div>

            {closureData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 print:block">
                    
                    {/* LEFT COLUMN: Data Sections */}
                    <div className="lg:col-span-2 space-y-6 print:w-full">
                        
                        {/* Section 1: Customer Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 font-semibold text-gray-700">
                                Section 1: Customer Details
                            </div>
                            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 block">Customer ID</span><span className="font-medium">{closureData.customer.customerId}</span></div>
                                <div><span className="text-gray-500 block">Customer Name</span><span className="font-medium">{closureData.customer.customerName}</span></div>
                                <div><span className="text-gray-500 block">Mobile Number</span><span className="font-medium">{closureData.customer.mobileNumber}</span></div>
                                <div><span className="text-gray-500 block">Branch</span><span className="font-medium">{closureData.customer.branch}</span></div>
                            </div>
                        </div>

                        {/* Section 2: Loan Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 font-semibold text-gray-700">
                                Section 2: Loan Details
                            </div>
                            <div className="p-5 grid grid-cols-3 gap-4 text-sm">
                                <div><span className="text-gray-500 block">Loan ID</span><span className="font-bold text-gray-800">{closureData.loan.loanId}</span></div>
                                <div><span className="text-gray-500 block">Loan Amount</span><span className="font-medium">{formatCurrency(closureData.loan.loanAmount)}</span></div>
                                <div><span className="text-gray-500 block">Remaining Balance</span>
                                    <span className={`font-bold ${closureData.loan.remainingLoanAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatCurrency(closureData.loan.remainingLoanAmount)}
                                    </span>
                                </div>
                                <div><span className="text-gray-500 block">Start Date</span><span className="font-medium">{formatDate(closureData.loan.loanStartDate)}</span></div>
                                <div><span className="text-gray-500 block">End Date</span><span className="font-medium">{formatDate(closureData.loan.loanEndDate)}</span></div>
                                <div><span className="text-gray-500 block">Status</span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                                        {closureData.loan.loanStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Payment Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 font-semibold text-gray-700">
                                Section 3: Payment Summary
                            </div>
                            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><span className="text-gray-500 block">Original Loan</span><span className="font-medium">{formatCurrency(closureData.paymentSummary.originalLoanAmount)}</span></div>
                                <div><span className="text-gray-500 block">Total Principal Paid</span><span className="font-medium">{formatCurrency(closureData.paymentSummary.totalPrincipalPaid)}</span></div>
                                <div><span className="text-gray-500 block">Total Interest Paid</span><span className="font-medium">{formatCurrency(closureData.paymentSummary.totalInterestPaid)}</span></div>
                                <div><span className="text-gray-500 block">Total Amount Paid</span><span className="font-bold text-green-700">{formatCurrency(closureData.paymentSummary.totalAmountPaid)}</span></div>
                            </div>
                        </div>

                        {/* Section 4: Gold Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 font-semibold text-gray-700">
                                Section 4: Gold Details
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">Article</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">Gross Wt</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">Net Wt</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">Value</th>
                                            <th className="px-4 py-2 text-center font-medium text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {closureData.goldDetails.map((gold, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2">{gold.articleName}</td>
                                                <td className="px-4 py-2">{gold.grossWeight}g</td>
                                                <td className="px-4 py-2">{gold.netWeight}g</td>
                                                <td className="px-4 py-2">{formatCurrency(gold.appraisedValue)}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${gold.status === 'Released' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {gold.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {closureData.goldDetails.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">No gold articles linked to this loan.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Closure Action (NO-PRINT) */}
                    <div className="print:hidden">
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden sticky top-24">
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4 text-white">
                                <h3 className="font-bold flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Closure Action
                                </h3>
                            </div>
                            
                            <div className="p-5 space-y-5">
                                {/* Status Messages */}
                                {closureData.closureEligibility.existingClosure ? (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3 text-blue-800 text-sm">
                                        <CheckCircle className="w-5 h-5 shrink-0" />
                                        <div>
                                            <p className="font-bold mb-1">Loan is already closed</p>
                                            <p>Closure ID: {closureData.closureEligibility.existingClosure.closureId}</p>
                                            <p>Closed On: {formatDate(closureData.closureEligibility.existingClosure.closureDate)}</p>
                                        </div>
                                    </div>
                                ) : !closureData.closureEligibility.isEligible ? (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        <p className="font-bold mb-2">Closure Blocked:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {!closureData.closureEligibility.isBalanceZero && <li>Remaining balance must be zero.</li>}
                                            {!closureData.closureEligibility.isStatusClosed && <li>Loan status is not 'Closed'.</li>}
                                            {!closureData.closureEligibility.allGoldReleased && <li>Not all gold articles are released.</li>}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm font-medium">
                                        <CheckCircle className="w-5 h-5" />
                                        Eligible for closure.
                                    </div>
                                )}

                                {/* Closure Form */}
                                {!closureData.closureEligibility.existingClosure && closureData.closureEligibility.isEligible && (
                                    <div className="space-y-4 pt-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Closure Type</label>
                                            <select
                                                value={closureType}
                                                onChange={e => setClosureType(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                                            >
                                                <option>Normal Closure</option>
                                                <option>Early Closure</option>
                                                <option>Settlement</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
                                            <textarea
                                                value={closureRemarks}
                                                onChange={e => setClosureRemarks(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm resize-none"
                                                rows="3"
                                                placeholder="Enter closure remarks..."
                                            ></textarea>
                                        </div>
                                        <button
                                            onClick={handleClosure}
                                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck className="w-5 h-5" />
                                            Perform Closure
                                        </button>
                                    </div>
                                )}

                                {/* Print Buttons (Only if existing closure is present) */}
                                {closureData.closureEligibility.existingClosure && (
                                    <div className="space-y-3 pt-2">
                                        <button onClick={handlePrintReceipt} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2 text-sm">
                                            <Printer className="w-4 h-4" /> Print Receipt
                                        </button>
                                        <button onClick={handlePrintReceipt} className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2 text-sm">
                                            <FileText className="w-4 h-4" /> Generate NOC
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PRINT-ONLY DOCUMENTS */}
            {closureData && closureData.closureEligibility.existingClosure && (
                <div className="hidden print:block space-y-10 mt-10">
                    {/* RECEIPT */}
                    <div className="p-8 border-2 border-gray-800 rounded-lg page-break-after">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold">BELWIN GROUPS</h2>
                            <h3 className="text-xl font-semibold">LOAN CLOSURE RECEIPT</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                            <div><span className="font-semibold">Receipt No:</span> {closureData.closureEligibility.existingClosure.closureId}</div>
                            <div><span className="font-semibold">Date:</span> {formatDate(closureData.closureEligibility.existingClosure.closureDate)}</div>
                            <div><span className="font-semibold">Customer:</span> {closureData.customer.customerName}</div>
                            <div><span className="font-semibold">Loan ID:</span> {closureData.loan.loanId}</div>
                        </div>
                        <table className="w-full text-sm border-collapse border border-gray-800 mb-6">
                            <tbody>
                                <tr>
                                    <td className="border border-gray-800 p-2 font-semibold">Original Loan Amount</td>
                                    <td className="border border-gray-800 p-2">{formatCurrency(closureData.paymentSummary.originalLoanAmount)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-800 p-2 font-semibold">Total Amount Paid</td>
                                    <td className="border border-gray-800 p-2">{formatCurrency(closureData.paymentSummary.totalAmountPaid)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-800 p-2 font-semibold">Closure Type</td>
                                    <td className="border border-gray-800 p-2">{closureData.closureEligibility.existingClosure.closureType}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="mt-12 flex justify-between">
                            <div className="text-center">
                                <div className="border-t border-gray-800 pt-2 px-6">Customer Signature</div>
                            </div>
                            <div className="text-center">
                                <div className="border-t border-gray-800 pt-2 px-6">Authorized Signatory</div>
                                <div className="text-xs mt-1">({closureData.closureEligibility.existingClosure.closedBy})</div>
                            </div>
                        </div>
                    </div>

                    {/* NOC */}
                    <div className="p-10 border-2 border-gray-800 rounded-lg">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold">BELWIN GROUPS</h2>
                            <p className="text-sm mt-1">Main Branch</p>
                        </div>
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold underline">NO OBJECTION CERTIFICATE</h3>
                        </div>
                        <div className="text-right mb-8">
                            <span className="font-semibold">Date:</span> {formatDate(closureData.closureEligibility.existingClosure.closureDate)}
                        </div>
                        <div className="text-justify leading-loose mb-12">
                            This is to certify that <strong>{closureData.customer.customerName}</strong> has successfully closed the gold loan account bearing Loan ID <strong>{closureData.loan.loanId}</strong> with our institution. 
                            <br/><br/>
                            All outstanding dues, including principal and interest, have been fully settled as of <strong>{formatDate(closureData.closureEligibility.existingClosure.closureDate)}</strong>. We confirm that there are no pending liabilities or obligations against this loan account.
                            <br/><br/>
                            All pledged gold articles have been successfully released to the customer.
                        </div>
                        <div className="mt-20">
                            <div className="inline-block text-center float-right">
                                <div className="border-t-2 border-gray-800 pt-2 px-8 font-semibold">Authorized Signatory</div>
                                <div className="text-sm mt-1">Belwin Groups</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanClosure;
