/**
 * localStorage utility functions for GFE Dashboard
 */

const STORAGE_KEYS = {
  REFRESH_INTERVAL: 'gfe-refresh-interval',
  SELECTED_SITE: 'gfe-selected-site',
  THEME: 'gfe-theme',
  LANGUAGE: 'gfe-language',
  DATE_RANGE: 'gfe-date-range',
  USER_PREFERENCES: 'gfe-user-preferences'
};

class LocalStorageManager {
  /**
   * Get value from localStorage with fallback
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Set value in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
    }
  }

  /**
   * Remove value from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }

  /**
   * Clear all GFE-related localStorage items
   */
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Get refresh interval from localStorage
   * @returns {string} Refresh interval (default: '1h')
   */
  getRefreshInterval() {
    return this.get(STORAGE_KEYS.REFRESH_INTERVAL, '1h');
  }

  /**
   * Set refresh interval in localStorage
   * @param {string} interval - Interval string
   */
  setRefreshInterval(interval) {
    this.set(STORAGE_KEYS.REFRESH_INTERVAL, interval);
  }

  /**
   * Get selected site from localStorage
   * @returns {string} Selected site (default: 'dubai')
   */
  getSelectedSite() {
    return this.get(STORAGE_KEYS.SELECTED_SITE, 'dubai');
  }

  /**
   * Set selected site in localStorage
   * @param {string} site - Site ID
   */
  setSelectedSite(site) {
    this.set(STORAGE_KEYS.SELECTED_SITE, site);
  }

  /**
   * Get theme from localStorage
   * @returns {string} Theme (default: 'light')
   */
  getTheme() {
    return this.get(STORAGE_KEYS.THEME, 'light');
  }

  /**
   * Set theme in localStorage
   * @param {string} theme - Theme ('light' or 'dark')
   */
  setTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme);
  }

  /**
   * Get language from localStorage
   * @returns {string} Language (default: 'en')
   */
  getLanguage() {
    return this.get(STORAGE_KEYS.LANGUAGE, 'en');
  }

  /**
   * Set language in localStorage
   * @param {string} language - Language code
   */
  setLanguage(language) {
    this.set(STORAGE_KEYS.LANGUAGE, language);
  }

  /**
   * Get date range from localStorage
   * @returns {object} Date range object
   */
  getDateRange() {
    return this.get(STORAGE_KEYS.DATE_RANGE, {
      fromDateTime: null,
      endDateTime: null,
      isUsingTodayDefault: true
    });
  }

  /**
   * Set date range in localStorage
   * @param {object} dateRange - Date range object
   */
  setDateRange(dateRange) {
    this.set(STORAGE_KEYS.DATE_RANGE, dateRange);
  }

  /**
   * Get user preferences from localStorage
   * @returns {object} User preferences
   */
  getUserPreferences() {
    return this.get(STORAGE_KEYS.USER_PREFERENCES, {
      sidebarCollapsed: false,
      notificationsEnabled: true,
      autoRefresh: true,
      defaultView: 'overview'
    });
  }

  /**
   * Set user preferences in localStorage
   * @param {object} preferences - User preferences
   */
  setUserPreferences(preferences) {
    this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const localStorageManager = new LocalStorageManager();

export default localStorageManager;
export { STORAGE_KEYS };
