// Power Mix API service for fetching power mix data from backend
import api from './api';

class PowerMixService {
  /**
   * Fetch power mix data for the Power Mix chart - ALL DATA POINTS (no aggregation)
   * @param {Object} params - Query parameters
   * @param {string} params.controllerId - Controller ID
   * @param {string} params.start - Start time (ISO format)
   * @param {string} params.stop - Stop time (ISO format)
   * @returns {Promise<Object>} Power mix data
   */
  async getPowerMixData({ controllerId, start, stop }) {
    try {
      console.log('🔌 Fetching Power Mix data (all data points)...', { controllerId, start, stop });
      
      const response = await api.get('/api/v1/powerflow/mix', {
        controllerId,
        start,
        stop
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch power mix data');
      }

      console.log('Raw Power Mix data received:', response.data);

      // Transform the data to match chart format
      const transformedData = this.transformDataForChart(response.data.data);
      
      console.log('✅ Power Mix data fetched successfully', {
        originalDataPoints: response.data.data.length,
        transformedDataPoints: transformedData.length
      });

      return {
        data: transformedData,
        metadata: {
          controllerId: response.data.controllerId,
          window: 'all_data_points',
          start: response.data.start,
          stop: response.data.stop,
          totalDataPoints: transformedData.length
        }
      };
    } catch (error) {
      console.error('❌ Power Mix service error:', error);
      throw new Error(`Failed to fetch power mix data: ${error.message}`);
    }
  }

  /**
   * Transform InfluxDB data to chart-friendly format
   * @param {Array} rawData - Raw data from InfluxDB
   * @returns {Array} Transformed data for chart
   */
  transformDataForChart(rawData) {
    return rawData.map(item => ({
      time: this.formatTimeForChart(item.time),
      W_PV: this.convertToKW(item.W_PV),
      W_Grid: this.convertToKW(item.W_Grid),
      W_Gen: this.convertToKW(item.W_Gen),
      W_Load: this.convertToKW(item.W_Load),
      // Additional calculated fields for better chart visualization
      consumption: this.convertToKW(item.W_Load),
      solar: this.convertToKW(item.W_PV),
      grid: this.convertToKW(item.W_Grid),
      genset: this.convertToKW(item.W_Gen),
      // Raw values for tooltips
      raw: {
        W_PV: item.W_PV,
        W_Grid: item.W_Grid,
        W_Gen: item.W_Gen,
        W_Load: item.W_Load
      }
    }));
  }

  /**
   * Convert watts to kilowatts
   * @param {number} watts - Value in watts
   * @returns {number} Value in kilowatts
   */
  convertToKW(watts) {
    if (watts === null || watts === undefined) return 0;
    return Math.round((watts / 1000) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Format time for chart display
   * @param {string} timeString - ISO time string
   * @returns {string} Formatted time string
   */
  formatTimeForChart(timeString) {
    const date = new Date(timeString);
    // Return full ISO string for proper date handling
    return date.toISOString();
  }

  /**
   * Get default time range (last 24 hours) - ALL DATA POINTS
   * @returns {Object} Default time range
   */
  getDefaultTimeRange() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return {
      start: yesterday.toISOString(),
      stop: now.toISOString()
    };
  }

  /**
   * Get time range for last week - ALL DATA POINTS
   * @returns {Object} Last week time range
   */
  getLastWeekTimeRange() {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      start: lastWeek.toISOString(),
      stop: now.toISOString()
    };
  }

  /**
   * Get time range for last month - ALL DATA POINTS
   * @returns {Object} Last month time range
   */
  getLastMonthTimeRange() {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      start: lastMonth.toISOString(),
      stop: now.toISOString()
    };
  }
}

export default new PowerMixService();
