/**
 * Interval Service - Manages automatic API calls based on selected interval
 */

class IntervalService {
  constructor() {
    this.intervals = new Map();
    this.callbacks = new Set();
    this.lastExecution = new Map(); // Track last execution time for debouncing
  }

  /**
   * Convert interval string to milliseconds
   * @param {string} interval - Interval string (e.g., '1m', '5m', '1h')
   * @returns {number} Milliseconds
   */
  getIntervalMs(interval) {
    const intervalMap = {
      '5s': 5 * 1000,         // 5 seconds
      '1m': 60 * 1000,        // 1 minute
      '5m': 5 * 60 * 1000,    // 5 minutes
      '15m': 15 * 60 * 1000,  // 15 minutes
      '30m': 30 * 60 * 1000,  // 30 minutes
      '1h': 60 * 60 * 1000,   // 1 hour
      '6h': 6 * 60 * 60 * 1000, // 6 hours
      '1d': 24 * 60 * 60 * 1000 // 1 day
    };
    return intervalMap[interval] || intervalMap['1h'];
  }

  /**
   * Start interval for a specific key
   * @param {string} key - Unique key for this interval
   * @param {string} interval - Interval string
   * @param {Function} callback - Function to call on each interval
   */
  start(key, interval, callback) {
    // Clear existing interval if it exists
    this.stop(key);

    const ms = this.getIntervalMs(interval);
    
    // Create debounced callback
    const debouncedCallback = () => {
      const now = Date.now();
      const lastExec = this.lastExecution.get(key) || 0;
      const timeSinceLastExec = now - lastExec;
      
      // Only execute if enough time has passed (debounce by 1 second minimum)
      if (timeSinceLastExec >= 1000) {
        this.lastExecution.set(key, now);
        callback();
      } else {
        console.log(`⏸️ Debouncing interval callback for ${key} (${timeSinceLastExec}ms since last execution)`);
      }
    };
    
    const intervalId = setInterval(debouncedCallback, ms);
    
    this.intervals.set(key, intervalId);
    this.callbacks.add(callback);

    console.log(`🔄 Started interval: ${key} (${interval}) - ${ms}ms`);
  }

  /**
   * Stop interval for a specific key
   * @param {string} key - Unique key for this interval
   */
  stop(key) {
    const intervalId = this.intervals.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(key);
      console.log(`⏹️ Stopped interval: ${key}`);
    }
  }

  /**
   * Stop all intervals
   */
  stopAll() {
    this.intervals.forEach((intervalId, key) => {
      clearInterval(intervalId);
      console.log(`⏹️ Stopped interval: ${key}`);
    });
    this.intervals.clear();
    this.callbacks.clear();
  }

  /**
   * Update interval for a specific key
   * @param {string} key - Unique key for this interval
   * @param {string} newInterval - New interval string
   * @param {Function} callback - Function to call on each interval
   */
  update(key, newInterval, callback) {
    this.start(key, newInterval, callback);
  }

  /**
   * Get all active intervals
   * @returns {Array} Array of active interval keys
   */
  getActiveIntervals() {
    return Array.from(this.intervals.keys());
  }
}

const intervalService = new IntervalService();
export default intervalService;
