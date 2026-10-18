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

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact our support team.</p>
        </div>
      </main>
    </div>
  );
}

export default Privacy;
