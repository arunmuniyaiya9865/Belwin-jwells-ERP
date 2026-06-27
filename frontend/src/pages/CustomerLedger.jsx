import React, { useState, useEffect } from 'react';
import { Search, Printer, Download, User, CreditCard, Banknote, Calendar, CheckCircle, Clock, History } from 'lucide-react';
import { getCustomerLedger } from '../services/ledgerService';
import toast from 'react-hot-toast';

const CustomerLedger = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [ledgerData, setLedgerData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            toast.error('Please enter a Customer ID');
            return;
        }

        setLoading(true);
        try {
            const response = await getCustomerLedger(searchTerm.trim());
            if (response.success && response.data) {
                setLedgerData(response.data);
                toast.success('Customer Ledger fetched successfully');
            } else {
                setLedgerData(null);
                toast.error(response.message || 'Customer Not Found');
            }
        } catch (error) {
            console.error(error);
            setLedgerData(null);
            toast.error(error.message || 'Customer Not Found');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        toast.success('PDF Export Feature Coming Soon');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '₹ 0.00';
        return `₹ ${Number(amount).toFixed(2)}`;
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto animation-fade-in pb-10">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-erp-card p-6 rounded-2xl shadow-sm border border-erp-card-border gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Customer Ledger</h1>
                    <p className="text-text-secondary text-sm mt-1">Complete financial history for a customer</p>
                </div>
                
                <form onSubmit={handleSearch} className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter Customer ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-erp-dark text-text-primary border border-gray-700 rounded-lg focus:outline-none focus:border-erp-gold focus:ring-1 focus:ring-erp-gold transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-erp-gold text-erp-dark font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {/* Content Area */}
            {ledgerData ? (
                <div className="space-y-6">
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 print:hidden">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                            <Printer className="w-4 h-4" /> Print Ledger
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-erp-gold text-erp-dark font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                    </div>

                    {/* Section 1 & Timeline Wrapper */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Section 1: Customer Info */}
                        <div className="lg:col-span-2 bg-erp-card p-6 rounded-2xl shadow-sm border border-erp-card-border">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-erp-gold" />
                                <h2 className="text-lg font-bold text-text-primary">Customer Information</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider">Customer ID</p>
                                    <p className="font-semibold text-text-primary mt-1">{ledgerData.customer.customerId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider">Customer Name</p>
                                    <p className="font-semibold text-text-primary mt-1">{ledgerData.customer.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider">Mobile Number</p>
                                    <p className="font-semibold text-text-primary mt-1">{ledgerData.customer.mobileNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider">Branch</p>
                                    <p className="font-semibold text-text-primary mt-1">{ledgerData.customer.branch}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider">Status</p>
                                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${ledgerData.customer.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {ledgerData.customer.status}
                                    </span>
                                </div>
                                <div className="md:col-span-3">
                                    <p className="text-xs text-text-secondary uppercase tracking-wider">Address</p>
                                    <p className="font-medium text-text-primary mt-1">{ledgerData.customer.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Loan Timeline */}
                        <div className="bg-erp-card p-6 rounded-2xl shadow-sm border border-erp-card-border">
                             <div className="flex items-center gap-2 mb-6">
                                <Clock className="w-5 h-5 text-erp-gold" />
                                <h2 className="text-lg font-bold text-text-primary">Loan Timeline</h2>
                            </div>
                            {ledgerData.loan ? (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-erp-gold/30 before:to-transparent">
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-erp-card-border bg-erp-dark shadow-sm">
                                            <h3 className="font-bold text-green-500 text-sm">Loan Created</h3>
                                            <p className="text-xs text-text-secondary mt-1">
                                                {ledgerData.loan.createdAt ? formatDate(ledgerData.loan.createdAt) : 'Date Not Tracked'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${ledgerData.loan.loanStatus !== 'Pending' ? 'is-active' : ''}`}>
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${ledgerData.loan.loanStatus !== 'Pending' ? 'bg-green-500' : 'bg-gray-600'}`}>
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-erp-card-border bg-erp-dark shadow-sm">
                                            <h3 className={`font-bold text-sm ${ledgerData.loan.loanStatus !== 'Pending' ? 'text-green-500' : 'text-gray-400'}`}>Admin Approved</h3>
                                            {ledgerData.loan.loanStatus !== 'Pending' ? (
                                                <p className="text-xs text-text-secondary mt-1">Status: {ledgerData.loan.loanStatus} (No distinct approval date in schema)</p>
                                            ) : (
                                                <p className="text-xs text-text-secondary mt-1">Approval Pending</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${ledgerData.loan.loanStartDate ? 'is-active' : ''}`}>
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${ledgerData.loan.loanStartDate ? 'bg-green-500' : 'bg-gray-600'}`}>
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-erp-card-border bg-erp-dark shadow-sm">
                                            <h3 className={`font-bold text-sm ${ledgerData.loan.loanStartDate ? 'text-green-500' : 'text-gray-400'}`}>Loan Started</h3>
                                            {ledgerData.loan.loanStartDate ? (
                                                <p className="text-xs text-text-secondary mt-1">{formatDate(ledgerData.loan.loanStartDate)}</p>
                                            ) : (
                                                <p className="text-xs text-text-secondary mt-1">Not Started</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${ledgerData.payments.length > 0 ? 'bg-green-500' : 'bg-gray-600'}`}>
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-erp-card-border bg-erp-dark shadow-sm">
                                            <h3 className={`font-bold text-sm ${ledgerData.payments.length > 0 ? 'text-green-500' : 'text-gray-400'}`}>First Payment</h3>
                                            {ledgerData.payments.length > 0 ? (
                                                <p className="text-xs text-text-secondary mt-1">{formatDate(ledgerData.payments[ledgerData.payments.length - 1].paymentDate)}</p>
                                            ) : (
                                                <p className="text-xs text-text-secondary mt-1">No Payments Yet</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${ledgerData.payments.length > 0 ? 'bg-green-500' : 'bg-gray-600'}`}>
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-erp-card-border bg-erp-dark shadow-sm">
                                            <h3 className={`font-bold text-sm ${ledgerData.payments.length > 0 ? 'text-green-500' : 'text-gray-400'}`}>Latest Payment</h3>
                                            {ledgerData.payments.length > 0 ? (
                                                <p className="text-xs text-text-secondary mt-1">{formatDate(ledgerData.payments[0].paymentDate)}</p>
                                            ) : (
                                                <p className="text-xs text-text-secondary mt-1">No Payments Yet</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${ledgerData.loan.loanStatus === 'Closed' ? 'bg-erp-gold' : 'bg-gray-600'}`}>
                                            <CheckCircle className={`w-5 h-5 ${ledgerData.loan.loanStatus === 'Closed' ? 'text-erp-dark' : 'text-white'}`} />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-erp-card-border bg-erp-dark shadow-sm">
                                            <h3 className={`font-bold text-sm ${ledgerData.loan.loanStatus === 'Closed' ? 'text-erp-gold' : 'text-gray-400'}`}>
                                                {ledgerData.loan.loanStatus === 'Closed' ? 'Loan Closed' : 'Not Closed'}
                                            </h3>
                                            {ledgerData.loan.loanStatus === 'Closed' && (
                                                <p className="text-xs text-text-secondary mt-1">
                                                    {ledgerData.loan.loanEndDate ? formatDate(ledgerData.loan.loanEndDate) : 'Date Not Tracked in Schema'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400 font-medium">No Loan Found</div>
                            )}
                        </div>
                    </div>

                    {/* Section 2 & 3: Gold Scheme & Loan Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Section 2: Gold Scheme */}
                        <div className="bg-erp-card p-6 rounded-2xl shadow-sm border border-erp-card-border">
                            <div className="flex items-center gap-2 mb-4">
                                <Banknote className="w-5 h-5 text-erp-gold" />
                                <h2 className="text-lg font-bold text-text-primary">Gold Scheme</h2>
                            </div>
                            {ledgerData.goldScheme ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Scheme ID</p>
                                        <p className="font-semibold text-text-primary mt-1">{ledgerData.goldScheme.schemeId}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Scheme Name</p>
                                        <p className="font-semibold text-text-primary mt-1">{ledgerData.goldScheme.schemeName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Interest %</p>
                                        <p className="font-semibold text-text-primary mt-1">{ledgerData.goldScheme.interestPercent}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Amount</p>
                                        <p className="font-semibold text-text-primary mt-1">{formatCurrency(ledgerData.goldScheme.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Gram Rate</p>
                                        <p className="font-semibold text-text-primary mt-1">{formatCurrency(ledgerData.goldScheme.gramRate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Min Gram</p>
                                        <p className="font-semibold text-text-primary mt-1">{ledgerData.goldScheme.minimumGram}g</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Mature Period</p>
                                        <p className="font-semibold text-text-primary mt-1">{ledgerData.goldScheme.maturePeriod} Months</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Doc Charges</p>
                                        <p className="font-semibold text-text-primary mt-1">{formatCurrency(ledgerData.goldScheme.documentCharges)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Penalty %</p>
                                        <p className="font-semibold text-text-primary mt-1">{ledgerData.goldScheme.penaltyPercent}%</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 font-medium">No Gold Scheme Found</div>
                            )}
                        </div>

                        {/* Section 3: Loan Info */}
                        <div className="bg-erp-card p-6 rounded-2xl shadow-sm border border-erp-card-border">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-erp-gold" />
                                <h2 className="text-lg font-bold text-text-primary">Loan Information</h2>
                            </div>
                            {ledgerData.loan ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Loan ID</p>
                                        <p className="font-semibold text-text-primary mt-1">{ledgerData.loan.loanId}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Loan Amount</p>
                                        <p className="font-semibold text-text-primary mt-1">{formatCurrency(ledgerData.loan.loanAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Remaining Balance</p>
                                        <p className="font-bold text-red-400 mt-1">{formatCurrency(ledgerData.loan.remainingLoanAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Start Date</p>
                                        <p className="font-semibold text-text-primary mt-1">{formatDate(ledgerData.loan.loanStartDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">End Date</p>
                                        <p className="font-semibold text-text-primary mt-1">{formatDate(ledgerData.loan.loanEndDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Status</p>
                                        <p className={`font-bold mt-1 ${ledgerData.loan.loanStatus === 'Closed' ? 'text-green-500' : 'text-erp-gold'}`}>{ledgerData.loan.loanStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Approval Date</p>
                                        <p className="font-semibold text-text-primary mt-1 text-gray-500 italic">Not Tracked in Schema</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-text-secondary uppercase tracking-wider">Approved By</p>
                                        <p className="font-semibold text-text-primary mt-1">{ledgerData.loan.approvedBy}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 font-medium">No Loan Found</div>
                            )}
                        </div>
                    </div>

                    {/* Section 4: Financial Summary Cards */}
                    <div className="bg-erp-card p-6 rounded-2xl shadow-sm border border-erp-card-border">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-erp-gold" />
                            <h2 className="text-lg font-bold text-text-primary">Financial Summary</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[
                                { title: 'Loan Amount', value: ledgerData.financialSummary.originalLoanAmount, type: 'currency' },
                                { title: 'Remaining Balance', value: ledgerData.financialSummary.currentRemainingLoanAmount, type: 'currency', highlight: true },
                                { title: 'Total Amount Paid', value: ledgerData.financialSummary.totalAmountCollected, type: 'currency', highlightSuccess: true },
                                { title: 'Principal Paid', value: ledgerData.financialSummary.totalPrincipalCollected, type: 'currency' },
                                { title: 'Interest Paid', value: ledgerData.financialSummary.totalInterestCollected, type: 'currency' },
                                { title: 'Penalty Paid', value: ledgerData.financialSummary.totalPenaltyCollected, type: 'currency' },
                                { title: 'Number of Payments', value: ledgerData.financialSummary.numberOfPayments, type: 'number' },
                                { title: 'Last Payment Date', value: ledgerData.financialSummary.lastPaymentDate, type: 'date' },
                                { title: 'Next Due Date', value: ledgerData.financialSummary.nextDueDate, type: 'date' },
                            ].map((item, index) => (
                                <div key={index} className={`p-4 rounded-xl border border-gray-700 bg-erp-dark transition-all hover:border-erp-gold/50 ${item.highlight ? 'border-red-500/30 bg-red-500/5' : ''} ${item.highlightSuccess ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider">{item.title}</p>
                                    <p className={`text-lg font-bold mt-2 ${item.highlight ? 'text-red-400' : ''} ${item.highlightSuccess ? 'text-green-500' : 'text-white'}`}>
                                        {item.type === 'currency' ? formatCurrency(item.value) : 
                                         item.type === 'date' ? formatDate(item.value) : 
                                         item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 5: Payment History Table */}
                    <div className="bg-erp-card p-6 rounded-2xl shadow-sm border border-erp-card-border overflow-hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-erp-gold" />
                            <h2 className="text-lg font-bold text-text-primary">Payment History</h2>
                        </div>
                        
                        {ledgerData.payments && ledgerData.payments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-erp-dark text-text-secondary text-xs uppercase tracking-wider border-b border-gray-700">
                                            <th className="p-4 font-semibold rounded-tl-lg">Receipt No</th>
                                            <th className="p-4 font-semibold">Date</th>
                                            <th className="p-4 font-semibold">Mode</th>
                                            <th className="p-4 font-semibold text-right">Interest</th>
                                            <th className="p-4 font-semibold text-right">Principal</th>
                                            <th className="p-4 font-semibold text-right">Penalty</th>
                                            <th className="p-4 font-semibold text-right text-green-400">Total Paid</th>
                                            <th className="p-4 font-semibold text-right text-red-400">Balance</th>
                                            <th className="p-4 font-semibold rounded-tr-lg">Collected By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {ledgerData.payments.map((payment, index) => (
                                            <tr key={index} className="hover:bg-erp-dark/50 transition-colors text-sm">
                                                <td className="p-4 font-medium">{payment.receiptNo}</td>
                                                <td className="p-4">{formatDate(payment.paymentDate)}</td>
                                                <td className="p-4">
                                                    <span className="inline-block px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-medium">
                                                        {payment.paymentMode || 'Cash'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">{formatCurrency(payment.interestPaid)}</td>
                                                <td className="p-4 text-right">{formatCurrency(payment.principalPaid)}</td>
                                                <td className="p-4 text-right">{formatCurrency(payment.penaltyPaid)}</td>
                                                <td className="p-4 text-right font-bold text-green-400">{formatCurrency(payment.totalPaid)}</td>
                                                <td className="p-4 text-right font-bold text-red-400">{formatCurrency(payment.remainingBalance)}</td>
                                                <td className="p-4 truncate max-w-[120px]">{payment.collectedBy || 'Admin'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-erp-dark rounded-xl border border-dashed border-gray-700">
                                <p className="text-gray-400 font-medium">No Payment History Available</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-erp-card rounded-2xl p-16 flex flex-col items-center justify-center border border-dashed border-gray-700 text-center">
                    <User className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-300">No Customer Selected</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">Enter a valid Customer ID in the search bar above to view their complete financial ledger.</p>
                </div>
            )}
        </div>
    );
};

export default CustomerLedger;
