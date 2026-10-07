import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Car
} from 'lucide-react';
import { adminService } from '../../api/admin';

function RevenueAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');
  const navigate = useNavigate();

  useEffect(() => {
    loadRevenueData();
  }, [timeRange]);

  const loadRevenueData = async () => {
    try {
      const response = await adminService.getRevenueAnalytics();
      if (response.status === 'success') {
        setRevenueData(response.data);
      }
    } catch (err) {
      console.error('Failed to load revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
                <p className="text-gray-600">Detailed revenue analysis and insights</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                  <Download size={20} />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div className={`flex items-center gap-1 ${revenueData?.summary?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueData?.summary?.growth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  <span className="text-sm font-medium">{Math.abs(revenueData?.summary?.growth || 0)}%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">₦{((revenueData?.summary?.totalRevenue || 0) / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={20} />
                  <span className="text-sm font-medium">+15.2%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">₦{((revenueData?.summary?.averageMonthlyRevenue || 0) / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-500">Avg Monthly</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="text-purple-600" size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={20} />
                  <span className="text-sm font-medium">+12.8%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">₦{((revenueData?.summary?.projectedRevenue || 0) / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-gray-500">Projected</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="text-yellow-600" size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={20} />
                  <span className="text-sm font-medium">+18.5%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">47,100</p>
              <p className="text-sm text-gray-500">Total Jobs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Revenue Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Monthly Revenue Trend</h3>
                <BarChart3 className="text-gray-400" size={20} />
              </div>
              <div className="space-y-3">
                {revenueData?.monthlyBreakdown?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-12">{item.month}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">₦{(item.revenue / 1000000).toFixed(0)}M</span>
                        <span className={`text-xs font-medium ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${item.growth >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                          style={{ width: `${(item.revenue / 62000000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Category */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Revenue by Category</h3>
                <PieChart className="text-gray-400" size={20} />
              </div>
              <div className="space-y-4">
                {revenueData?.revenueByCategory?.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">₦{(item.revenue / 1000000).toFixed(0)}M</span>
                        <span className="text-xs text-gray-500">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Car size={12} />
                      <span>{item.jobs.toLocaleString()} jobs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Performing Drivers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Top Performing Drivers</h3>
                <TrendingUp className="text-gray-400" size={20} />
              </div>
              <div className="space-y-3">
                {revenueData?.topPerformers?.map((driver, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-400' :
                      'bg-blue-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{driver.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{driver.jobs} jobs</span>
                        <span>₦{(driver.avgPerJob).toLocaleString()}/job</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₦{(driver.revenue / 1000000).toFixed(1)}M</p>
                      <div className={`flex items-center gap-1 text-xs ${driver.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {driver.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        <span>{driver.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Region */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Revenue by Region</h3>
                <PieChart className="text-gray-400" size={20} />
              </div>
              <div className="space-y-3">
                {revenueData?.revenueByRegion?.map((region, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{region.region}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">₦{(region.revenue / 1000000).toFixed(0)}M</span>
                        <span className="text-xs text-gray-500">({region.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${region.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Insights */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-600" size={20} />
                  <span className="font-medium text-green-800">Highest Growth</span>
                </div>
                <p className="text-sm text-green-700">December showed 29.17% growth due to holiday season demand</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="text-blue-600" size={20} />
                  <span className="font-medium text-blue-800">Top Category</span>
                </div>
                <p className="text-sm text-blue-700">Airport Transfers contribute 27.4% of total revenue</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-purple-600" size={20} />
                  <span className="font-medium text-purple-800">Top Region</span>
                </div>
                <p className="text-sm text-purple-700">Lagos accounts for 53.7% of total revenue</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RevenueAnalytics;
