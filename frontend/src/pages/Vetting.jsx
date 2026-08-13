import React from 'react';

const Vetting = () => {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white font-sans">
      <div className="max-w-6xl mx-auto px-8 py-20">
        <h1 className="text-5xl font-bold mb-8 text-center">
          Ironclad Compliance & <span className="text-green-500">Vetting Standards</span>
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-green-400">Our Multi-Layer Verification Process</h2>
          
          <div className="space-y-8">
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold mb-2">1. FRSC License Verification</h3>
              <p className="text-gray-300">Every driver's Federal Road Safety Corps license is cross-referenced with the national database to ensure validity and current status.</p>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold mb-2">2. NIN Biometric Validation</h3>
              <p className="text-gray-300">National Identity Number verification with live facial recognition matching ensures the person behind the wheel is exactly who they claim to be.</p>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold mb-2">3. Triple-Layer Guarantor System</h3>
              <p className="text-gray-300">Three verified guarantors must legally sign off on each driver, providing personal liability and creating a robust safety net for all parties.</p>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold mb-2">4. Background Check Timeline</h3>
              <p className="text-gray-300">Comprehensive criminal, employment, and residence history verification completed within 48-72 hours of initial application.</p>
            </div>

            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-2xl font-bold mb-2">5. Continuous Monitoring</h3>
              <p className="text-gray-300">Ongoing compliance checks ensure drivers maintain their verification status throughout their tenure on the platform.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-green-400">Enterprise Trust Standards</h3>
            <ul className="space-y-3 text-gray-300">
              <li>✓ ISO 27001 Information Security</li>
              <li>✓ NDPR Compliance (Nigeria)</li>
              <li>✓ PCI DSS Payment Security</li>
              <li>✓ Regular Third-Party Audits</li>
              <li>✓ Insurance Coverage Verification</li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4 text-green-400">Verification Timeline</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Initial Application</span>
                <span className="text-green-400 font-bold">Day 0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Document Verification</span>
                <span className="text-green-400 font-bold">Day 1-2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Background Check</span>
                <span className="text-green-400 font-bold">Day 2-3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Guarantor Verification</span>
                <span className="text-green-400 font-bold">Day 3-4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Final Approval</span>
                <span className="text-green-400 font-bold">Day 4-5</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
            Start Your Secure Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default Vetting;
