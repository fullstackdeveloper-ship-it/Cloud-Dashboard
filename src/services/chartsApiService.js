import apiService from './api.js';

class ChartsApiService {
  // Get all chart configurations
  async getAllCharts() {
    try {
      const response = await apiService.get('/api/v1/config');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching charts:', error);
      throw error;
    }
  }

  // Get specific chart configuration
  async getChart(configName) {
    try {
      const response = await apiService.get(`/api/v1/config/${configName}`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching chart:', error);
      throw error;
    }
  }

  // Update chart configuration
  async updateChart(configName, chartData) {
    try {
      const response = await apiService.post(`/config/${configName}`, chartData);
      return response.data || response;
    } catch (error) {
      console.error('Error updating chart:', error);
      throw error;
    }
  }

  // Delete chart configuration
  async deleteChart(configName) {
    try {
      const response = await apiService.post(`/config/${configName}/delete`);
      return response.data || response;
    } catch (error) {
      console.error('Error deleting chart:', error);
      throw error;
    }
  }
}

export default new ChartsApiService();
