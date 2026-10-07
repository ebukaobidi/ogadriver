import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  Save,
  Globe,
  FileText,
  Image as ImageIcon,
  Layout,
  Type,
  CheckCircle,
  Edit,
  Eye,
  AlignLeft
} from 'lucide-react';
import { adminService } from '../../api/admin';

function SiteContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [content, setContent] = useState({
    heroTitle: 'Your Trusted Driver Service in Nigeria',
    heroSubtitle: 'Professional drivers for all your transportation needs - airport transfers, city tours, corporate events, and more.',
    heroButtonText: 'Book a Driver',
    aboutTitle: 'About OGA Driver',
    aboutContent: 'OGA Driver is Nigeria\'s premier driver service platform, connecting you with professional, vetted drivers for all your transportation needs. Whether you need an airport transfer, city tour, corporate event transportation, or personal chauffeur service, our experienced drivers are ready to provide safe, reliable, and comfortable journeys.',
    featuresTitle: 'Why Choose Us',
    features: [
      { title: 'Professional Drivers', description: 'All our drivers are thoroughly vetted and trained' },
      { title: 'Safe & Reliable', description: 'Your safety is our top priority with GPS tracking' },
      { title: '24/7 Availability', description: 'Book drivers anytime, anywhere in Nigeria' },
      { title: 'Competitive Pricing', description: 'Transparent pricing with no hidden fees' }
    ],
    contactEmail: 'info@ogadriver.ng',
    contactPhone: '+234 800 123 4567',
    socialFacebook: 'https://facebook.com/ogadriver',
    socialTwitter: 'https://twitter.com/ogadriver',
    socialInstagram: 'https://instagram.com/ogadriver'
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await adminService.getSiteContent();
      if (response.status === 'success') {
        setContent(response.data);
      }
    } catch (err) {
      console.error('Failed to load site content:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await adminService.updateSiteContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save site content:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Site Content</h1>
                <p className="text-gray-600">Manage website content and pages</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  <Eye size={20} />
                  Preview Site
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
            {saved && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-green-800">Content saved successfully!</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('hero')}
                className={`px-6 py-3 font-medium ${activeTab === 'hero' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Hero Section
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-3 font-medium ${activeTab === 'about' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                About Section
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-6 py-3 font-medium ${activeTab === 'features' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-3 font-medium ${activeTab === 'contact' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Contact Info
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`px-6 py-3 font-medium ${activeTab === 'social' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Social Media
              </button>
            </div>
          </div>

          {/* Content Forms */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layout size={20} className="text-blue-600" />
                  Hero Section Content
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                  <input
                    type="text"
                    name="heroTitle"
                    value={content.heroTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                  <textarea
                    name="heroSubtitle"
                    value={content.heroSubtitle}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Button Text</label>
                  <input
                    type="text"
                    name="heroButtonText"
                    value={content.heroButtonText}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={20} className="text-green-600" />
                  About Section Content
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About Title</label>
                  <input
                    type="text"
                    name="aboutTitle"
                    value={content.aboutTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About Content</label>
                  <textarea
                    name="aboutContent"
                    value={content.aboutContent}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Type size={20} className="text-purple-600" />
                  Features Section
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features Title</label>
                  <input
                    type="text"
                    name="featuresTitle"
                    value={content.featuresTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-4">
                  {content.features.map((feature, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Feature {index + 1}</span>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Edit size={16} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...content.features];
                            newFeatures[index].title = e.target.value;
                            setContent(prev => ({ ...prev, features: newFeatures }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Feature title"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...content.features];
                            newFeatures[index].description = e.target.value;
                            setContent(prev => ({ ...prev, features: newFeatures }));
                          }}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Feature description"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Globe size={20} className="text-orange-600" />
                  Contact Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={content.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={content.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon size={20} className="text-pink-600" />
                  Social Media Links
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    name="socialFacebook"
                    value={content.socialFacebook}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                  <input
                    type="url"
                    name="socialTwitter"
                    value={content.socialTwitter}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    name="socialInstagram"
                    value={content.socialInstagram}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SiteContent;
