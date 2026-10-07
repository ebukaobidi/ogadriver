import React from 'react';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-[#0a0b10] text-white font-sans">
      <div className="max-w-6xl mx-auto px-8 py-20">
        <h1 className="text-5xl font-bold mb-4 text-center">
          Transparent <span className="text-green-500">Pricing Structure</span>
        </h1>
        <p className="text-xl text-gray-400 text-center mb-12">
          No hidden fees. No third-party markups. You control the pricing.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Driver Subscription */}
          <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-lg p-8 border-2 border-green-500">
            <h2 className="text-3xl font-bold mb-2">Driver Subscription</h2>
            <p className="text-green-200 mb-6">Join the elite driver network</p>
            
            <div className="mb-6">
              <span className="text-5xl font-bold">₦5,000</span>
              <span className="text-xl text-green-200">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Basic tier access
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Profile visibility to verified hirers
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Direct booking invitations
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Direct payments to drivers
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Rating and review system
              </li>
            </ul>

            <button className="w-full bg-white text-green-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all">
              Start as Driver
            </button>
          </div>

          {/* Corporate Access */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-8 border-2 border-gray-600">
            <h2 className="text-3xl font-bold mb-2">Corporate Platform Access</h2>
            <p className="text-gray-400 mb-6">Enterprise fleet solutions</p>
            
            <div className="mb-6">
              <span className="text-5xl font-bold">Custom</span>
              <span className="text-xl text-gray-400">/pricing</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Unlimited driver searches
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Direct driver proposals
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Real-time tracking dashboard
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                API integration access
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Dedicated account manager
              </li>
            </ul>

            <button className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-all">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Pricing Model Explanation */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-green-400">How Our Pricing Works</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-xl font-bold mb-2">Direct Proposal Model</h3>
              <p className="text-gray-300">
                Unlike traditional platforms that take commissions, Ogadriver.ng allows you to propose your rate directly to drivers. 
                No third-party markups, no hidden fees - just transparent, fair pricing that you control.
              </p>
            </div>

            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-xl font-bold mb-2">Direct Payment System</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                When a driver accepts your proposal, you pay them directly. You only pay a one-time platform access fee to use OgaDriver.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">Flexible Pricing Options</h3>
              <p className="text-gray-300">
                Choose from hourly, daily, trip-based, or distance-based pricing models. 
                Set your budget and terms - drivers respond to proposals that work for them.
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-semibold mb-6 text-green-400">Driver Subscription Tiers</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Basic Oga</h3>
              <p className="text-green-400 text-2xl font-bold mb-4">₦5,000/mo</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Standard profile visibility</li>
                <li>• Basic booking access</li>
                <li>• Standard support</li>
              </ul>
            </div>

            <div className="bg-gray-700 rounded-lg p-6 border-2 border-green-500">
              <h3 className="text-xl font-bold mb-2">Oga Premium</h3>
              <p className="text-green-400 text-2xl font-bold mb-4">₦10,000/mo</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Priority visibility</li>
                <li>• Interstate job access</li>
                <li>• 15-min priority window</li>
                <li>• Premium support</li>
              </ul>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Enterprise Elite</h3>
              <p className="text-green-400 text-2xl font-bold mb-4">Custom</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• API integration</li>
                <li>• Bulk operations</li>
                <li>• Custom solutions</li>
                <li>• Dedicated support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
