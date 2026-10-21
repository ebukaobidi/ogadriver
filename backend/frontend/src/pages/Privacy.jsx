import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

function Privacy() {
  return (
    <div className="min-h-screen bg-corporateNavy text-slate-300 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-brandMint" />
          <span className="text-2xl font-black text-white tracking-tight">OGA<span className="text-brandMint">DRIVER</span></span>
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-8 py-16">
        <h1 className="text-4xl font-black text-white mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-slate-400">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including your name, email address, phone number, and physical address. For drivers, we also collect sensitive verification documents such as driver's licenses, biometric data, and guarantor information.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and provide the features of OgaDriver. This includes verifying driver identities, connecting employers with drivers, processing payments, and sending administrative emails.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Security and Sharing</h2>
          <p>We implement strict security measures to protect your personal data. We do not sell your personal information. Driver profiles (excluding highly sensitive identity documents) may be shared with prospective employers on the platform for hiring purposes.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Cookies and Telemetry</h2>
          <p>We use cookies and tracking technologies to improve our platform's performance and analyze user interactions. We may also collect device and location telemetry from drivers while active on the job, subject to the driver's consent.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Your Rights & Data Protection</h2>
          <p>Under applicable Nigerian data protection regulations (including the NDPA/NDPR), you have the right to access, rectify, or request the deletion of your personal information. If you wish to exercise any of these rights, please contact our Data Protection Compliance Office.</p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Data Controller & Corporate Details</h2>
          <p>OgaDriver is owned, developed, and operated by <strong>Cejmart Island Int'l Ltd</strong>, which serves as the data controller for the platform. For privacy-related inquiries, legal notifications, or compliance requests, please reach out to us at:</p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-3 space-y-2 text-sm text-slate-300">
            <p><strong>Corporate Entity:</strong> Cejmart Island Int'l Ltd</p>
            <p><strong>Head Office:</strong> No. 14, Dutsen Street, Gbazango Extension, Kubwa, Abuja-FCT, Nigeria</p>
            <p><strong>Official Phone Lines:</strong> +234 805 404 4980 / +234 812 729 0420</p>
            <p><strong>Official Email:</strong> support@ogadriver.ng | info@ogadriver.ng</p>
            <p><strong>Website:</strong> https://ogadriver.ng</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-800 pt-8">
            <button 
                onClick={() => window.history.back()} 
                className="w-full sm:w-auto px-8 py-3 bg-brandMint text-slate-950 font-bold rounded-xl hover:bg-brandMint/90 transition-colors"
            >
                OK, I Understand & Return
            </button>
            <Link 
                to="/terms" 
                className="w-full sm:w-auto px-8 py-3 bg-transparent border border-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-center"
            >
                View Terms of Service
            </Link>
        </div>
      </main>
    </div>
  );
}

export default Privacy;
