import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  MapPin,
  Car,
  DollarSign,
  Award,
  AlertTriangle,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';
import { adminService } from '../../api/admin';

function DriverPerformance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const navigate = useNavigate();

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDriverPerformance();
      if (response.status === 'success') {
        setPerformanceData(response.data);
      }
    } catch (err) {
      console.error('Failed to load performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Driver Performance</h1>
                <p className="text-gray-600">Monitor and analyze driver performance metrics</p>
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
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter size={20} />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Overall Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="text-yellow-500" size={18} />
                <span className="text-sm text-gray-500">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold">{performanceData?.metrics?.averageRating}</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp size={14} />
                <span>{performanceData?.trends?.ratingChange}%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-blue-500" size={18} />
                <span className="text-sm text-gray-500">Avg Time</span>
              </div>
              <p className="text-2xl font-bold">{performanceData?.metrics?.averageCompletionTime}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <TrendingDown size={14} />
                <span>5.2%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-purple-500" size={18} />
                <span className="text-sm text-gray-500">Jobs Done</span>
              </div>
              <p className="text-2xl font-bold">{performanceData?.metrics?.totalJobsCompleted}</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp size={14} />
                <span>{performanceData?.trends?.completionChange}%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-green-500" size={18} />
                <span className="text-sm text-gray-500">Earnings</span>
              </div>
              <p className="text-2xl font-bold">₦{((performanceData?.metrics?.totalEarnings || 0) / 1000000).toFixed(1)}M</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp size={14} />
                <span>{performanceData?.trends?.earningsChange}%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-orange-500" size={18} />
                <span className="text-sm text-gray-500">Satisfaction</span>
              </div>
              <p className="text-2xl font-bold">{performanceData?.metrics?.customerSatisfaction}%</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp size={14} />
                <span>{performanceData?.trends?.satisfactionChange}%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-red-500" size={18} />
                <span className="text-sm text-gray-500">Response</span>
              </div>
              <p className="text-2xl font-bold">{performanceData?.metrics?.averageResponseTime}</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp size={14} />
                <span>8.7%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
                <Award className="text-yellow-500" size={20} />
              </div>
              <div className="space-y-3">
                {performanceData?.topPerformers?.map((driver, index) => (
                  <div key={driver.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{driver.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{driver.completedJobs} jobs</span>
                        <span>₦{(driver.occupations / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="font-medium">{driver.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">{driver.onTimeRate}% on-time</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Improvement */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Needs Improvement</h3>
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div className="space-y-3">
                {performanceData?.needsImprovement?.map((driver) => (
                  <div key={driver.id} className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle size={16} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{driver.name}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{driver.completedJobs} jobs</span>
                        <span>₦{(driver.earnings / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {driver.issues?.map((issue, i) => (
                          <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500" />
                        <span className="font-medium">{driver.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">{driver.onTimeRate}% on-time</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">45%</p>
                <p className="text-sm text-gray-600">Excellent (4.5+)</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">32%</p>
                <p className="text-sm text-gray-600">Good (4.0-4.4)</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">18%</p>
                <p className="text-sm text-gray-600">Average (3.5-3.9)</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">5%</p>
                <p className="text-sm text-gray-600">Poor (&lt;3.5)</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DriverPerformance;
