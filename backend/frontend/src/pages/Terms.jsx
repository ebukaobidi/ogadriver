import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

function Terms() {
  return (
    <div className="min-h-screen bg-corporateNavy text-slate-300 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-brandMint" />
          <span className="text-2xl font-black text-white tracking-tight">OGA<span className="text-brandMint">DRIVER</span></span>
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-8 py-16">
        <h1 className="text-4xl font-black text-white mb-8">Terms of Service</h1>
        <div className="space-y-6 text-slate-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms & Corporate Entity</h2>
          <p>OgaDriver (accessible via ogadriver.ng and the OgaDriver mobile applications) is a proprietary technological product owned, maintained, and operated by <strong>Cejmart Island Int'l Ltd</strong>, a company incorporated under the laws of the Federal Republic of Nigeria, with its corporate registered office located at <strong>No. 14, Dutsen Street, Gbazango Extension, Kubwa, Abuja-FCT, Nigeria</strong>. By accessing or using OgaDriver, you agree to be bound by these Terms of Service.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Driver Requirements and Vetting</h2>
          <p>Drivers must provide accurate, up-to-date information and consent to our background verification process. Falsifying documents or driving histories will result in immediate termination of your account and potential legal action.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Employer Responsibilities</h2>
          <p>Employers (Hirers) agree to use the platform solely for the purpose of hiring verified drivers. Employers must comply with local labor laws and maintain a safe working environment for the drivers they hire through OgaDriver.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Platform Fees</h2>
          <p>Access to advanced platform features requires payment of specific fees (such as verification fees or subscription plans). All payments are final and non-refundable unless legally required.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Limitation of Liability</h2>
          <p>OgaDriver acts as a marketplace connecting employers with vetted drivers. While we conduct rigorous vetting, we are not liable for the actions, omissions, or damages caused by any user of the platform.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Corporate Contact & Inquiries</h2>
          <p>All legal notices, questions, or compliance concerns regarding OgaDriver should be addressed to: <strong>Cejmart Island Int'l Ltd</strong>, No. 14, Dutsen Street, Gbazango Extension, Kubwa, Abuja-FCT, Nigeria. Telephone: +234 805 404 4980 / +234 812 729 0420. Email: support@ogadriver.ng.</p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-800 pt-8">
            <button 
                onClick={() => window.history.back()} 
                className="w-full sm:w-auto px-8 py-3 bg-brandMint text-slate-950 font-bold rounded-xl hover:bg-brandMint/90 transition-colors"
            >
                OK, I Understand & Return
            </button>
            <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-3 bg-transparent border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-center"
            >
                Back to Registration
            </Link>
        </div>
      </main>
    </div>
  );
}

export default Terms;
