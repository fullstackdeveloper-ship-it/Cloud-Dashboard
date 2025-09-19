// Unified API service for all KPI data fetching
import api from './api.js';

class KpiApiService {
  /**
   * Fetch real-time power flow data from InfluxDB
   * @param {string} controllerId - The controller ID
   * @returns {Promise<Object>} Power flow data with W_PV, W_Grid, W_Gen, W_Load
   */
  async fetchPowerFlowData(controllerId) {
    try {
      console.log('🔄 Fetching current power flow data...', { controllerId });
      
      const response = await api.get('/api/v1/powerflow/current', {
        controllerId
      });
      
      console.log('✅ Power flow data received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch power flow data:', error);
      throw new Error(`Failed to fetch power flow data: ${error.message}`);
    }
  }

  /**
   * Fetch historical power mix data for charts
   * @param {string} controllerId - The controller ID
   * @param {string} start - Start time (ISO string)
   * @param {string} stop - Stop time (ISO string)
   * @returns {Promise<Object>} Power mix data with time series
   */
  async fetchPowerMixData(controllerId, start, stop) {
    try {
      console.log('🔄 Fetching power mix data...', { controllerId, start, stop });
      
      const params = { controllerId, start, stop };
      
      const response = await api.get('/api/v1/powerflow/mix', params);
      
      console.log('✅ Power mix data received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch power mix data:', error);
      throw new Error(`Failed to fetch power mix data: ${error.message}`);
    }
  }


  /**
   * Get default/fallback data for when API calls fail
   * @returns {Object} Default data
   */
  getDefaultPowerFlow() {
    return {
      W_PV: 0,
      W_Grid: 0,
      W_Gen: 0,
      W_Load: 0,
      updatedAt: new Date().toISOString(),
      status: 'offline'
    };
  }


  getDefaultPowerMixData() {
    return {
      data: [],
      controllerId: null,
      window: 'all_data_points',
      start: null,
      stop: null
    };
  }
}

const kpiApiService = new KpiApiService();
export default kpiApiService;
