import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Settings, BarChart3 } from 'lucide-react';

const ChartsEdit = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0097b2]/5 via-[#198c1a]/5 to-[#0097b2]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/charts-management"
                className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Charts
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Edit Chart
                </h1>
                <p className="text-gray-600">
                  Configure chart settings and properties
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-[#0097b2] text-white rounded-lg hover:bg-[#0097b2]/90 transition-colors duration-200">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-[#0097b2] to-[#198c1a] rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chart Editor Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              The chart editing interface is currently under development. 
              This will include configuration options for chart types, data sources, 
              styling, and advanced settings.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Planned Features:</h4>
              <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
                <li>• Visual chart configuration interface</li>
                <li>• Data source selection and mapping</li>
                <li>• Chart type selection (Line, Bar, Area, etc.)</li>
                <li>• Color scheme and styling options</li>
                <li>• Axis configuration and formatting</li>
                <li>• Legend and tooltip customization</li>
                <li>• Real-time preview functionality</li>
                <li>• Import/Export chart configurations</li>
              </ul>
            </div>
            <div className="flex justify-center space-x-4">
              <Link
                to="/admin/charts-management"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Charts
              </Link>
              <button className="inline-flex items-center px-4 py-2 bg-[#0097b2] text-white rounded-lg hover:bg-[#0097b2]/90 transition-colors duration-200">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </button>
            </div>
          </div>
        </div>

        {/* Chart ID Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Chart ID:</strong> {id} | 
                <strong> Status:</strong> Edit mode active | 
                <strong> Last modified:</strong> Coming soon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsEdit;
