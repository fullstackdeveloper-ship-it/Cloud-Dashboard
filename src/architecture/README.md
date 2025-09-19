# Scalable Data Architecture

This document outlines the clean, scalable architecture for managing data across all charts and KPIs in the GFE Cloud Dashboard.

## 🏗️ Architecture Overview

### 1. **DataProvider** (`/src/contexts/DataProvider.js`)
- **Single source of truth** for all data
- **Unified refresh system** for all charts and KPIs
- **Centralized loading and error states**
- **Easy to extend** with new data sources

### 2. **Custom Hooks** (`/src/hooks/useData.js`)
- **`useData()`** - Access to all data and functions
- **`useDataSource(name)`** - Access specific data source
- **`useRefresh()`** - Access refresh functionality

### 3. **Base Components** (`/src/components/common/`)
- **`BaseChart`** - Reusable chart wrapper with loading/error states
- **`LoadingState`** - Consistent loading UI
- **`ErrorState`** - Consistent error UI

## 🚀 How to Add New Charts/KPIs

### Step 1: Create Data Hook
```javascript
// /src/hooks/useKpiData.js
import { useState, useEffect, useCallback } from 'react';
import kpiService from '../services/kpiService';

const useKpiData = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // Your API call logic
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refreshData };
};

export default useKpiData;
```

### Step 2: Add to DataProvider
```javascript
// In /src/contexts/DataProvider.js
import useKpiData from '../hooks/useKpiData';

export const DataProvider = ({ children }) => {
  const kpiData = useKpiData();
  
  const refreshKpi = useCallback(async () => {
    await kpiData.refreshData();
  }, [kpiData.refreshData]);

  const contextValue = {
    kpi: kpiData,
    refreshKpi,
    // ... other data
  };
};
```

### Step 3: Create Chart Component
```javascript
// /src/components/KpiChart.jsx
import BaseChart from './common/BaseChart';
import { useDataSource } from '../../hooks/useData';

const KpiChart = ({ className }) => {
  const { data, isLoading, error, refreshData } = useDataSource('kpi');

  return (
    <BaseChart
      className={className}
      title="KPI Performance"
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={refreshData}
    >
      {/* Your chart content */}
    </BaseChart>
  );
};
```

## 🔄 Refresh System

### Unified Refresh
- **Single refresh button** refreshes ALL data
- **Individual refresh** for specific charts
- **Loading states** synchronized across all components

### Usage
```javascript
// Refresh all data
const { refreshAll } = useRefresh();
await refreshAll();

// Refresh specific data
const { refreshKpi } = useRefresh();
await refreshKpi();
```

## 📊 Benefits

### ✅ **Scalability**
- Easy to add new charts/KPIs
- Consistent patterns across all components
- Centralized data management

### ✅ **Performance**
- Single API call per data source
- Efficient re-renders
- Optimized loading states

### ✅ **Maintainability**
- Clean separation of concerns
- Reusable components
- Easy to test and debug

### ✅ **User Experience**
- Consistent loading/error states
- Unified refresh functionality
- Professional UI patterns

## 🎯 Best Practices

1. **Always use BaseChart** for new charts
2. **Follow the data hook pattern** for new data sources
3. **Use useDataSource()** to access data in components
4. **Keep components pure** - no direct API calls
5. **Test individual data hooks** in isolation

## 🔧 File Structure

```
src/
├── contexts/
│   └── DataProvider.js          # Main data provider
├── hooks/
│   ├── useData.js              # Data access hooks
│   ├── usePowerMixData.js      # Power mix data
│   └── useKpiData.js           # KPI data (example)
├── components/
│   ├── common/
│   │   ├── BaseChart.jsx       # Reusable chart wrapper
│   │   ├── LoadingState.jsx    # Loading component
│   │   └── ErrorState.jsx      # Error component
│   ├── PowerMixChart.jsx       # Power mix chart
│   └── KpiChart.jsx            # KPI chart (example)
└── services/
    ├── powerMixService.js      # Power mix API
    └── kpiService.js           # KPI API (example)
```

This architecture ensures your codebase remains clean, scalable, and maintainable as you add more charts and KPIs! 🚀
