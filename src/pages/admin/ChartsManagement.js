import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Edit, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import chartsApiService from '../../services/chartsApiService';
import ChartPreviewModal from '../../components/ChartPreviewModal';

const ChartsManagement = () => {
  const [charts, setCharts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);

  // Fetch real chart configurations from backend
  const fetchCharts = useCallback(async () => {
    try {
      setError(null);
      const response = await chartsApiService.getAllCharts();
      
      // Transform backend data to match our UI structure
      const transformedCharts = response.map((config, index) => ({
        id: index + 1,
        name: config.displayName || config.name,
        type: getChartTypeFromConfig(config),
        description: config.description || 'Chart configuration',
        creationDate: new Date(config.lastModified).toLocaleDateString(),
        lastModified: new Date(config.lastModified).toLocaleDateString(),
        status: 'Active', // All configs are considered active
        author: 'System',
        configPath: `/configs/${config.name}.json`,
        chartsCount: config.charts || 0,
        originalConfig: config // Store the full original config object
      }));
      
      setCharts(transformedCharts);
    } catch (error) {
      console.error('Error fetching charts:', error);
      setError('Failed to load chart configurations. Please check your connection.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Determine chart type from configuration
  const getChartTypeFromConfig = (config) => {
    if (config.charts && config.charts.length > 0) {
      const firstChart = config.charts[0];
      if (firstChart.type) {
        return firstChart.type;
      }
      if (firstChart.series && firstChart.series.length > 0) {
        const firstSeries = firstChart.series[0];
        if (firstSeries.type) {
          return firstSeries.type === 'line' ? 'Time Series' : 
                 firstSeries.type === 'bar' ? 'Bar Chart' : 
                 firstSeries.type === 'area' ? 'Area Chart' : 'Line Chart';
        }
      }
    }
    return 'Time Series'; // Default type
  };

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCharts();
  };

  // Handle chart preview
  const handleViewChart = (chart) => {
    setSelectedChart(chart);
    setIsPreviewModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
    setSelectedChart(null);
  };

  const filteredCharts = charts.filter(chart => {
    const matchesSearch = chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || chart.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Time Series':
        return '📈';
      case 'Line Chart':
        return '📊';
      case 'Bar Chart':
        return '📊';
      case 'Gauge Chart':
        return '⏱️';
      case 'Area Chart':
        return '📈';
      default:
        return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0097b2] border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Chart Configurations</h3>
          <p className="text-gray-600">Fetching data from backend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200/50">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Charts</h3>
          <p className="text-gray-600 mb-6 text-lg">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white rounded-xl hover:from-[#0097b2]/90 hover:to-[#198c1a]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0097b2] to-[#198c1a] flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Charts Management
                </h1>
                <p className="text-gray-600">
                  Manage and configure all dashboard charts and visualizations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-all duration-200 disabled:opacity-50 shadow-lg border border-gray-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/admin/charts-management/create"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white rounded-lg hover:from-[#0097b2]/90 hover:to-[#198c1a]/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Chart
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search charts by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2] transition-all duration-200"
              >
                <option value="all">All Types</option>
                <option value="time">Time Series</option>
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="gauge">Gauge Chart</option>
                <option value="area">Area Chart</option>
              </select>
              <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:border-[#0097b2]">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Charts Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-[#0097b2]/10 to-[#198c1a]/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Chart Configuration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredCharts.map((chart) => (
                  <tr key={chart.id} className="hover:bg-gradient-to-r hover:from-[#0097b2]/5 hover:to-[#198c1a]/5 transition-all duration-300 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0097b2] to-[#198c1a] flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-bold text-gray-900 group-hover:text-[#0097b2] transition-colors duration-300">
                            {chart.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {chart.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {chart.chartsCount} chart{chart.chartsCount !== 1 ? 's' : ''} configured
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getTypeIcon(chart.type)}</span>
                        <span className="text-sm font-semibold text-gray-900">{chart.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(chart.status)}`}>
                        {chart.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-[#0097b2]" />
                        {chart.creationDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/charts-management/edit/${chart.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#0097b2] to-[#198c1a] text-white rounded-lg hover:from-[#0097b2]/90 hover:to-[#198c1a]/90 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleViewChart(chart)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredCharts.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No charts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first chart.'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <div className="mt-6">
                <Link
                  to="/admin/charts-management/create"
                  className="inline-flex items-center px-4 py-2 bg-[#0097b2] text-white rounded-lg hover:bg-[#0097b2]/90 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Chart
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
      
      {/* Chart Preview Modal */}
      <ChartPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={handleCloseModal}
        chartConfig={selectedChart?.originalConfig}
        configName={selectedChart?.originalConfig?.name}
      />
    </div>
  );
};

export default ChartsManagement;
