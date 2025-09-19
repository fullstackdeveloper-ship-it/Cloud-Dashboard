/**
 * API Call Manager - Prevents duplicate API calls and manages request queuing
 */

class ApiCallManager {
  constructor() {
    this.activeCalls = new Map(); // Track active API calls
    this.callQueue = new Map(); // Queue for pending calls
    this.callHistory = new Map(); // Track call history for debugging
    this.maxConcurrentCalls = 5; // Maximum concurrent API calls
    this.callTimeout = 30000; // 30 seconds timeout
  }

  /**
   * Generate a unique key for an API call
   */
  generateCallKey(controllerId, dataType, startTime, stopTime, globalRefreshTrigger) {
    return `${controllerId}-${dataType}-${startTime || 'null'}-${stopTime || 'null'}-${globalRefreshTrigger || 0}`;
  }

  /**
   * Check if a call is already in progress
   */
  isCallInProgress(callKey) {
    return this.activeCalls.has(callKey);
  }

  /**
   * Add a call to the active calls map
   */
  addActiveCall(callKey, promise) {
    this.activeCalls.set(callKey, {
      promise,
      startTime: Date.now(),
      timeout: setTimeout(() => {
        this.removeActiveCall(callKey);
      }, this.callTimeout)
    });
  }

  /**
   * Remove a call from the active calls map
   */
  removeActiveCall(callKey) {
    const call = this.activeCalls.get(callKey);
    if (call) {
      clearTimeout(call.timeout);
      this.activeCalls.delete(callKey);
    }
  }

  /**
   * Get or create a promise for an API call
   */
  async getOrCreateCall(callKey, apiFunction) {
    // If call is already in progress, return the existing promise
    if (this.isCallInProgress(callKey)) {
      console.log(`⏸️ API call already in progress: ${callKey}`);
      const existingCall = this.activeCalls.get(callKey);
      return existingCall.promise;
    }

    // Check if we have a recent successful call (within last 5 seconds)
    const recentCall = this.callHistory.get(callKey);
    if (recentCall && recentCall.success && (Date.now() - new Date(recentCall.timestamp).getTime()) < 5000) {
      console.log(`⏸️ Using recent successful call data: ${callKey}`);
      // Return a promise that resolves with the recent data
      return Promise.resolve(recentCall.data || {});
    }

    // Create new API call
    console.log(`🔄 Starting new API call: ${callKey}`);
    
    const callPromise = this.executeApiCall(callKey, apiFunction);
    this.addActiveCall(callKey, callPromise);

    try {
      const result = await callPromise;
      this.logCallSuccess(callKey);
      return result;
    } catch (error) {
      this.logCallError(callKey, error);
      throw error;
    } finally {
      this.removeActiveCall(callKey);
    }
  }

  /**
   * Execute the actual API call
   */
  async executeApiCall(callKey, apiFunction) {
    const startTime = Date.now();
    
    try {
      const result = await apiFunction();
      const duration = Date.now() - startTime;
      
      // Log successful call
      this.callHistory.set(callKey, {
        success: true,
        duration,
        timestamp: new Date().toISOString(),
        error: null,
        data: result
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failed call
      this.callHistory.set(callKey, {
        success: false,
        duration,
        timestamp: new Date().toISOString(),
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Log successful call
   */
  logCallSuccess(callKey) {
    console.log(`✅ API call completed: ${callKey}`);
  }

  /**
   * Log failed call
   */
  logCallError(callKey, error) {
    console.error(`❌ API call failed: ${callKey}`, error.message);
  }

  /**
   * Get call statistics
   */
  getCallStats() {
    const stats = {
      activeCalls: this.activeCalls.size,
      totalHistory: this.callHistory.size,
      recentCalls: Array.from(this.callHistory.entries())
        .slice(-10) // Last 10 calls
        .map(([key, data]) => ({ key, ...data }))
    };
    
    return stats;
  }

  /**
   * Clear old call history (keep only last 100 calls)
   */
  cleanupHistory() {
    if (this.callHistory.size > 100) {
      const entries = Array.from(this.callHistory.entries());
      const toKeep = entries.slice(-100);
      this.callHistory.clear();
      toKeep.forEach(([key, value]) => {
        this.callHistory.set(key, value);
      });
    }
  }

  /**
   * Cancel all active calls
   */
  cancelAllCalls() {
    console.log(`🛑 Cancelling ${this.activeCalls.size} active API calls`);
    
    this.activeCalls.forEach((call, key) => {
      clearTimeout(call.timeout);
      console.log(`🛑 Cancelled call: ${key}`);
    });
    
    this.activeCalls.clear();
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      activeCalls: Array.from(this.activeCalls.keys()),
      callHistory: this.getCallStats(),
      maxConcurrentCalls: this.maxConcurrentCalls,
      callTimeout: this.callTimeout
    };
  }
}

// Create singleton instance
const apiCallManager = new ApiCallManager();

export default apiCallManager;
