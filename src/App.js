import React, { useState } from 'react';
import { 
  Landmark, 
  Send, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  History, 
  ArrowRightLeft,
  CreditCard,
  Activity,
  PieChart,
  AlertCircle
} from 'lucide-react';

// --- UTILS ---

const generateTxId = () => 'TXN-' + Math.floor(Math.random() * 1000000000).toString();
const generateHash = () => '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

// --- CONFIG ---

const INITIAL_USERS = {
  seller: { id: 'ACC_SELLER_01', name: 'Siva Electronics Ltd.', balance: 1000, role: 'Seller' },
  investor: { id: 'ACC_INVEST_99', name: 'Lakshmi Capital Corp.', balance: 50000, role: 'Investor' },
  buyer: { id: 'ACC_BUYER_55', name: 'Rahul Retailers Inc.', balance: 5000, role: 'Buyer' }
};

const STATUS = {
  CREATED: 'Pending Financing',
  OFFER_MADE: 'Offer Received',
  FINANCED: 'Financed (Cash Received)',
  PAID: 'Settled (Closed)'
};

export default function RokkamApp() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState('seller');
  const [balances, setBalances] = useState({
    seller: 1000,
    investor: 50000,
    buyer: 5000
  });
  
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2024-001',
      amount: 10000,
      seller: 'Siva Electronics Ltd.',
      buyer: 'Rahul Retailers Inc.',
      desc: 'Q4 Circuit Board Supply',
      status: STATUS.CREATED,
      dueDate: '2025-12-01',
      offers: [] 
    }
  ]);

  const [auditLog, setAuditLog] = useState([
    { id: generateTxId(), hash: generateHash(), event: 'System Init', detail: 'Ledger Genesis Block' }
  ]);

  const [amountInput, setAmountInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [offerInput, setOfferInput] = useState('');
  const [notification, setNotification] = useState(null);

  // --- ACTIONS ---

  const logTransaction = (event, detail) => {
    setAuditLog(prev => [{
      id: generateTxId(),
      hash: generateHash(),
      event,
      detail
    }, ...prev]);
  };

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 1. Register Invoice (Seller)
  const registerInvoice = () => {
    if (!amountInput || !descInput) return;
    
    const newInv = {
      id: `INV-2024-${(invoices.length + 1).toString().padStart(3, '0')}`,
      amount: parseFloat(amountInput),
      seller: INITIAL_USERS.seller.name,
      buyer: INITIAL_USERS.buyer.name,
      desc: descInput,
      status: STATUS.CREATED,
      dueDate: '2025-12-15',
      offers: []
    };

    setInvoices([newInv, ...invoices]);
    logTransaction('Invoice Registered', `ID: ${newInv.id} | Val: ₹${newInv.amount}`);
    setAmountInput('');
    setDescInput('');
    notify('Invoice registered on Digital Ledger');
  };

  // 2. Make Financing Offer (Investor)
  const makeOffer = (invId, offerVal) => {
    if (!offerVal) return;
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invId) {
        return { ...inv, status: STATUS.OFFER_MADE, offers: [{ investor: INITIAL_USERS.investor.name, amount: parseFloat(offerVal) }] };
      }
      return inv;
    });
    setInvoices(updatedInvoices);
    logTransaction('Term Sheet Issued', `Ref: ${invId} | Offer: ₹${offerVal}`);
    setOfferInput('');
    notify('Financing offer sent to Seller');
  };

  // 3. Accept Financing (Seller)
  const acceptFinancing = (invoice) => {
    const offer = invoice.offers[0];
    
    setBalances(prev => ({
      ...prev,
      seller: prev.seller + offer.amount,
      investor: prev.investor - offer.amount
    }));

    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoice.id) {
        return { ...inv, status: STATUS.FINANCED, financedAmount: offer.amount };
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    logTransaction('Capital Disbursed', `From: Investor -> Seller | Amt: ₹${offer.amount}`);
    notify(`₹${offer.amount} credited to your account.`);
  };

  // 4. Settle Invoice (Buyer)
  const settleInvoice = (invoice) => {
    if (balances.buyer < invoice.amount) {
      notify("Insufficient funds in operating account", 'error');
      return;
    }

    setBalances(prev => ({
      ...prev,
      buyer: prev.buyer - invoice.amount,
      investor: prev.investor + invoice.amount 
    }));

    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoice.id) {
        return { ...inv, status: STATUS.PAID };
      }
      return inv;
    });

    setInvoices(updatedInvoices);
    logTransaction('Invoice Settled', `From: Buyer -> Investor | Amt: ₹${invoice.amount}`);
    notify('Payment processed successfully');
  };

  // --- UI COMPONENTS ---

  const AccountHeader = () => (
    <div className="bg-white p-6 border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <Landmark size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rokkam Money</h1>
            <p className="text-xs text-gray-500">Supply Chain Finance Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-xs text-gray-400 uppercase font-semibold">Operating As</p>
             <p className="text-sm font-bold text-gray-800">{INITIAL_USERS[currentUser].name}</p>
           </div>
           <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200">
             {currentUser === 'seller' && <Briefcase size={20} />}
             {currentUser === 'investor' && <TrendingUp size={20} />}
             {currentUser === 'buyer' && <Building2 size={20} />}
           </div>
        </div>
      </div>
    </div>
  );

  const BalanceCard = () => (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">Available INR Balance</p>
          <h2 className="text-4xl font-bold tracking-tight">
            ₹ {balances[currentUser].toLocaleString('en-IN')}
          </h2>
        </div>
        <div className="bg-white/10 p-2 rounded-lg">
          <CreditCard className="text-white" size={24} />
        </div>
      </div>
      <div className="flex gap-4 text-xs text-slate-400 font-mono border-t border-slate-700/50 pt-4">
        <span>ACC: {INITIAL_USERS[currentUser].id}</span>
        <span>•</span>
        <span className="text-green-400 flex items-center gap-1">
          <CheckCircle size={12} /> Verified Entity
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      <AccountHeader />

      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Role Selector (For Demo) */}
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex">
          {Object.keys(INITIAL_USERS).map(role => (
            <button
              key={role}
              onClick={() => setCurrentUser(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentUser === role ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {INITIAL_USERS[role].role} View
            </button>
          ))}
        </div>

        {notification && (
          <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce-in text-white z-50 ${notification.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {notification.msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: MAIN ACTIONS */}
          <div className="lg:col-span-2">
            <BalanceCard />

            {/* SELLER DASHBOARD */}
            {currentUser === 'seller' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={20} /></div>
                    <h3 className="text-lg font-bold">Register New Invoice</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Invoice Value (INR)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">₹</span>
                        <input 
                          type="number" 
                          value={amountInput}
                          onChange={(e) => setAmountInput(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
                          placeholder="0.00" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                      <input 
                        type="text" 
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="e.g. Batch #4022" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={registerInvoice}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                  >
                    Register Invoice
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Active Invoices</h3>
                  {invoices.map(inv => (
                    <div key={inv.id} className="bg-white p-5 mb-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-mono text-gray-400">{inv.id}</span>
                             <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                               inv.status === STATUS.PAID ? 'bg-green-100 text-green-700' : 
                               inv.status === STATUS.FINANCED ? 'bg-blue-100 text-blue-700' : 
                               'bg-orange-100 text-orange-700'
                             }`}>
                               {inv.status}
                             </span>
                          </div>
                          <h4 className="font-bold text-lg">{inv.desc}</h4>
                          <p className="text-sm text-gray-500">Billed to: {inv.buyer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">₹{inv.amount.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* INCOMING OFFER UI */}
                      {inv.status === STATUS.OFFER_MADE && (
                        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
                           <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                             <TrendingUp size={18} /> New Financing Offer
                           </div>
                           <div className="flex justify-between items-end">
                             <div>
                               <p className="text-sm text-amber-900">
                                 {inv.offers[0].investor} offers <span className="font-bold text-lg">₹{inv.offers[0].amount.toLocaleString()}</span>
                               </p>
                               <p className="text-xs text-amber-700 mt-1">Immediate disbursement upon acceptance.</p>
                             </div>
                             <button 
                               onClick={() => acceptFinancing(inv)}
                               className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 shadow-sm"
                             >
                               Accept Funds
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INVESTOR DASHBOARD */}
            {currentUser === 'investor' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-gray-800">Marketplace</h3>
                   <span className="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">Live Opportunities</span>
                </div>
                
                {invoices.filter(inv => inv.status !== STATUS.PAID).map(inv => (
                  <div key={inv.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex gap-4">
                         <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                           {inv.seller.charAt(0)}
                         </div>
                         <div>
                           <h4 className="font-bold text-lg">{inv.seller}</h4>
                           <p className="text-sm text-gray-500">Client: {inv.buyer}</p>
                           <p className="text-xs text-gray-400 mt-1 font-mono">{inv.id}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-xs text-gray-400 uppercase">Invoice Value</p>
                         <p className="text-2xl font-bold text-gray-900">₹{inv.amount.toLocaleString()}</p>
                       </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      {inv.status === STATUS.CREATED ? (
                         <div className="flex gap-3">
                           <input 
                             type="number" 
                             value={offerInput}
                             onChange={(e) => setOfferInput(e.target.value)}
                             placeholder="Enter Offer (e.g. 9800)"
                             className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                           />
                           <button 
                             onClick={() => makeOffer(inv.id, offerInput)}
                             className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
                           >
                             Send Term Sheet
                           </button>
                         </div>
                      ) : inv.status === STATUS.OFFER_MADE ? (
                        <p className="text-center text-sm text-gray-500 font-medium italic">Offer Pending Acceptance</p>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                          <CheckCircle size={18} /> Financed - Awaiting Repayment
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BUYER DASHBOARD */}
            {currentUser === 'buyer' && (
              <div className="space-y-6">
                 <h3 className="text-lg font-bold text-gray-800">Payable Invoices</h3>
                 {invoices.map(inv => (
                   <div key={inv.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                      {inv.status === STATUS.PAID && (
                        <div className="absolute right-0 top-0 bg-emerald-500 text-white px-8 py-1 text-xs font-bold transform rotate-45 translate-x-8 translate-y-4">PAID</div>
                      )}
                      
                      <div className="flex justify-between mb-6">
                        <div>
                          <p className="text-sm text-gray-500">Payable To</p>
                          <div className="font-bold text-lg flex items-center gap-2">
                            {inv.status === STATUS.FINANCED ? (
                              <>
                                <Building2 size={18} className="text-indigo-600" />
                                {INITIAL_USERS.investor.name}
                              </>
                            ) : (
                              <>
                                <Briefcase size={18} className="text-gray-600" />
                                {INITIAL_USERS.seller.name}
                              </>
                            )}
                          </div>
                          {inv.status === STATUS.FINANCED && (
                            <p className="text-xs text-indigo-600 mt-1 bg-indigo-50 px-2 py-1 rounded inline-block">
                              Invoice Factored - Pay Investor
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Amount Due</p>
                          <p className="text-3xl font-bold text-gray-900">₹{inv.amount.toLocaleString()}</p>
                        </div>
                      </div>

                      {inv.status !== STATUS.PAID && (
                        <button 
                          onClick={() => settleInvoice(inv)}
                          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                          <ShieldCheck size={18} />
                          Authorize Payment
                        </button>
                      )}
                   </div>
                 ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AUDIT LOG */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full max-h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <History size={18} className="text-indigo-500" />
                  Audit Ledger
                </h3>
                <p className="text-xs text-gray-400 mt-1">Immutable blockchain records</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {auditLog.map((log) => (
                  <div key={log.id} className="relative pl-4 pb-4 border-l-2 border-gray-200 last:border-0">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 bg-indigo-500 rounded-full ring-4 ring-white"></div>
                    <div className="text-xs font-mono text-gray-400 mb-1">{log.id}</div>
                    <div className="font-bold text-sm text-gray-800">{log.event}</div>
                    <div className="text-xs text-gray-500 mt-1">{log.detail}</div>
                    <div className="text-[10px] text-gray-300 mt-1 font-mono truncate max-w-[200px]">Hash: {log.hash}</div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck size={12} />
                Secured by Smart Contracts
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}