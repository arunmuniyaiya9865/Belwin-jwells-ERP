const fs = require('fs');
const file = 'd:/MWT/Belwin Employee/frontend/src/pages/employee/payment/ReceivePayment.jsx';
let content = fs.readFileSync(file, 'utf8');

// I am just going to rewrite the entire JSX block for selectedLoan that got mangled.
// Let's first extract everything before "Financial Summary Grid" and everything after "Right Side: Payment Form".

const topPart = content.split('                {/* ── Financial Summary Grid ─────────────────────── */}')[0];
const bottomPart = content.split('                <div>\n                  <label className={lbl}>Amount Received <span className="text-red-500">*</span></label>')[1];

const fixedMiddle = `                {/* ── Financial Summary Grid ─────────────────────── */}
                <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Financial Summary
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Total Loan</span>
                      <span className="text-sm font-bold text-gray-800">₹{(selectedLoan.loanAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Remaining Principal</span>
                      <span className="text-sm font-bold text-red-600">₹{(selectedLoan.remainingLoanAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Interest Paid</span>
                      <span className="text-sm font-bold text-green-700">₹{(selectedLoan.totalPaidInterestAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Remaining Interest</span>
                      <span className="text-sm font-bold text-amber-600">₹{(selectedLoan.remainingInterestAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Loan Period</span>
                      <span className="text-sm font-bold text-gray-700">{selectedLoan.totalNoOfDays ?? 0} days</span>
                    </div>
                    <div className="px-3 py-2.5">
                      <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Remaining Days</span>
                      <span className={\`text-sm font-bold \${(selectedLoan.remainingDays ?? 0) < 0 ? 'text-red-600' : 'text-gray-700'}\`}>
                        {selectedLoan.remainingDays ?? 0} days
                      </span>
                    </div>
                    <div className="col-span-2 px-3 py-2.5 bg-emerald-50">
                      <span className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Full Settlement Amount</span>
                      <span className="text-base font-extrabold text-emerald-800">₹{(selectedLoan.fullSettlementAmount ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="w-[65%] flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Payment Details */}
            <div className={card}>
              <h3 className={sec}><IndianRupee className="w-4 h-4" /> Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl}>Payment Type</label>
                  <select className={inp} value={form.paymentType} onChange={e => setForm(p => ({ ...p, paymentType: e.target.value }))}>
                    <option>Interest Payment</option>
                    <option>Principal Payment</option>
                    <option>Part Payment</option>
                    <option>Full Settlement</option>
                    <option>Penalty Payment</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Amount Received <span className="text-red-500">*</span></label>`;

fs.writeFileSync(file, topPart + fixedMiddle + bottomPart, 'utf8');
console.log('Fixed file');
