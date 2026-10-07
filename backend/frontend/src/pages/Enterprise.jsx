import React from 'react';

const Enterprise = () => {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white font-sans">
      <div className="max-w-6xl mx-auto px-8 py-20">
        <h1 className="text-5xl font-bold mb-4 text-center">
          Enterprise <span className="text-green-500">Fleet Solutions</span>
        </h1>
        <p className="text-xl text-gray-400 text-center mb-12">
          Comprehensive driver management for multinational corporations
        </p>

        <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6">Why Enterprise Companies Choose Ogadriver.ng</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3 text-green-300">Security-First Approach</h3>
              <p className="text-gray-200">
                Our multi-layer verification process ensures every driver meets the highest security standards, 
                protecting your executives and assets with biometric validation and guarantor-backed accountability.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 text-green-300">Real-Time Visibility</h3>
              <p className="text-gray-200">
                Live GPS tracking with blackout detection provides complete oversight of your fleet operations, 
                from dispatch to drop-off, with instant alerts for route deviations.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 text-green-300">Direct Control</h3>
              <p className="text-gray-200">
                Propose your rates directly to verified drivers. No third-party markups, no hidden fees. 
                Complete control over your transportation budget and terms.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3 text-green-300">Scalable Operations</h3>
              <p className="text-gray-200">
                From single executive transport to full fleet management, our platform scales with your needs 
                through API integration and bulk booking capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-bold mb-2">Executive Transport</h3>
            <p className="text-gray-400">
              Luxury sedan and armored SUV options for VIP and executive transportation with verified, experienced drivers.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">Security Escorts</h3>
            <p className="text-gray-400">
              Armed and unarmed security escort services with drivers trained in defensive driving and threat assessment.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">🚛</div>
            <h3 className="text-xl font-bold mb-2">Commercial Fleet</h3>
            <p className="text-gray-400">
              Heavy-duty and light truck options for logistics, supply chain, and commercial transportation needs.
            </p>
          </div>
        </div>

        {/* API Integration */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-green-400">Enterprise API Integration</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-green-400 mr-3 text-xl">✓</span>
              <div>
                <h3 className="font-bold text-lg">Seamless ERP Integration</h3>
                <p className="text-gray-400">Connect with your existing enterprise resource planning systems for streamlined operations.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-green-400 mr-3 text-xl">✓</span>
              <div>
                <h3 className="font-bold text-lg">Bulk Booking Capabilities</h3>
                <p className="text-gray-400">Schedule multiple drivers and routes simultaneously through our bulk operations API.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-green-400 mr-3 text-xl">✓</span>
              <div>
                <h3 className="font-bold text-lg">Custom Webhooks</h3>
                <p className="text-gray-400">Receive real-time notifications for booking status, driver location, and completion events.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-green-400 mr-3 text-xl">✓</span>
              <div>
                <h3 className="font-bold text-lg">Advanced Analytics</h3>
                <p className="text-gray-400">Access comprehensive telemetry data and operational insights for optimization.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-green-400">Enterprise Compliance & Security</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-3">Data Protection</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• NDPR Compliant</li>
                <li>• ISO 27001 Certified</li>
                <li>• End-to-end encryption</li>
                <li>• Regular security audits</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">Operational Standards</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• 24/7 monitoring</li>
                <li>• Disaster recovery protocols</li>
                <li>• SLA guarantees</li>
                <li>• Dedicated support team</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Fleet Operations?</h2>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
              Schedule Demo
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all">
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;
