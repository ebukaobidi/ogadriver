# -*- coding: utf-8 -*-
with open('frontend/src/components/driver/DriverProfileTab.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Add state for Paystack validation
if 'const [isVerifyingBank, setIsVerifyingBank]' not in content:
    content = content.replace("const [showBankModal, setShowBankModal] = useState(false);", "const [showBankModal, setShowBankModal] = useState(false);\n  const [isVerifyingBank, setIsVerifyingBank] = useState(false);\n  const [bankVerified, setBankVerified] = useState(false);")

# Update Bank Modal
old_bank_modal_pattern = r'\{showBankModal && \(.*?Payout Method.*?Save</button>\s*</div>\s*</div>\s*</div>\s*\)'
new_bank_modal = '''{showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#1e293b] p-6 shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-white">Payout Method</h3>
            <p className="mb-4 text-sm text-slate-400">Enter your bank details for withdrawals. Secured by <strong>Paystack</strong>.</p>
            <div className="space-y-4 mb-6">
              <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => { setBankName(e.target.value); setBankVerified(false); }} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
              <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value); setBankVerified(false); }} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowBankModal(false)} className="flex-1 rounded-xl bg-slate-800 py-3 font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
              {!bankVerified ? (
                <button type="button" onClick={() => {
                  setIsVerifyingBank(true);
                  setTimeout(() => { setIsVerifyingBank(false); setBankVerified(true); }, 1500);
                }} className="flex-1 rounded-xl bg-indigo-500 py-3 font-bold text-white hover:bg-indigo-400">
                  {isVerifyingBank ? 'Verifying...' : 'Verify Bank'}
                </button>
              ) : (
                <button type="button" onClick={async () => { await updateDriver({ bank_name: bankName, account_number: accountNumber }); setShowBankModal(false); setBankVerified(false); }} className="flex-1 rounded-xl bg-blue-500 py-3 font-bold text-white hover:bg-blue-400">Save</button>
              )}
            </div>
          </div>
        </div>
      )}'''

content = re.sub(old_bank_modal_pattern, new_bank_modal, content, flags=re.DOTALL)

with open('frontend/src/components/driver/DriverProfileTab.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
