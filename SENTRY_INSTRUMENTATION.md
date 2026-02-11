# Sentry Instrumentation Documentation

This document describes the comprehensive Sentry logging and metrics implementation in the Customer Analytics Dashboard.

## Overview

The application uses Sentry for:
- **Error Tracking**: Automatic and explicit exception capturing
- **Structured Logging**: Key events throughout the application lifecycle
- **Custom Metrics**: Business and technical performance indicators

---

## 🔍 Structured Logging

### Page Views & Sessions
**Location**: `src/app/page.tsx`

```typescript
// Page view tracking
Sentry.logger.info('Dashboard page viewed')
Sentry.logger.debug('Viewport information')
```

**Events**:
- Dashboard page views
- Session starts
- Viewport dimensions

---

### URL Analysis Flow
**Location**: `src/hooks/useAnalysis.ts`

```typescript
// Analysis lifecycle
Sentry.logger.info('URL analysis started')
Sentry.logger.warn('URL validation failed')
Sentry.logger.error('Simulated analysis service failure')
Sentry.logger.info('URL analysis completed successfully')
Sentry.logger.error('URL analysis failed')
```

**Logged Information**:
- URL being analyzed
- Request count
- Validation errors
- Analysis duration
- Success/failure status
- Business metrics (YoY Growth, NRR, DAU)

---

### Search Interactions
**Location**: `src/components/dashboard/SearchBar.tsx`

```typescript
// Search form events
Sentry.logger.info('Search form submitted')
Sentry.logger.error('Search submission failed')
```

**Tracked Data**:
- URL submitted
- URL length
- Protocol presence
- Success/failure status

---

### History Management
**Location**: `src/context/AnalysisContext.tsx`

```typescript
// History operations
Sentry.logger.info('AnalysisContext initialized')
Sentry.logger.info('Analysis added to history')
Sentry.logger.warn('Failed analysis added to history')
Sentry.logger.info('History item selected')
Sentry.logger.warn('History cleared')
```

**Tracked Events**:
- Context initialization
- History size
- Item additions (success/error)
- Item selections
- History clearing

---

### History List Rendering
**Location**: `src/components/sidebar/HistoryList.tsx`

```typescript
// History list events
Sentry.logger.debug('History list rendered')
Sentry.logger.info('History item clicked')
```

**Statistics Logged**:
- Total items
- Success count
- Error count
- Success rate
- Item click position

---

### Metrics Display
**Location**: `src/components/dashboard/MetricsGrid.tsx`

```typescript
// Metrics display
Sentry.logger.info('Metrics grid displayed')
Sentry.logger.debug('Metrics health score calculated')
```

**Logged Metrics**:
- All KPI values
- Health score calculation
- Performance indicators

---

## 📊 Custom Metrics

### Counter Metrics

#### Analysis Metrics
```typescript
// Analysis lifecycle counters
Sentry.metrics.increment('analysis.request', 1)
Sentry.metrics.increment('analysis.validation_failed', 1)
Sentry.metrics.increment('analysis.simulated_failure', 1)
Sentry.metrics.increment('analysis.success', 1)
Sentry.metrics.increment('analysis.failed', 1)
```

**Tags**:
- `status`: started, completed, failed
- `error_type`: validation, simulated, unknown
- `reason`: invalid_url, third_request

---

#### Search Metrics
```typescript
// Search form interactions
Sentry.metrics.increment('search.submitted', 1)
Sentry.metrics.increment('search.completed', 1)
```

**Tags**:
- `has_protocol`: yes, no
- `status`: success, failed

---

#### History Metrics
```typescript
// History operations
Sentry.metrics.increment('history.item_added', 1)
Sentry.metrics.increment('history.item_selected', 1)
Sentry.metrics.increment('history.item_clicked', 1)
Sentry.metrics.increment('history.cleared', 1)
```

**Tags**:
- `status`: success, error
- `source`: sidebar
- `is_active`: yes, no
- `items_cleared`: count

---

#### Page Metrics
```typescript
// Page views and sessions
Sentry.metrics.increment('page.view', 1)
Sentry.metrics.increment('session.started', 1)
```

**Tags**:
- `page`: dashboard
- `route`: /

---

### Distribution Metrics

#### Performance Metrics
```typescript
// Timing measurements
Sentry.metrics.distribution('analysis.api_delay_ms', delayMs)
Sentry.metrics.distribution('analysis.duration_ms', duration)
Sentry.metrics.distribution('analysis.failure_duration_ms', duration)
```

**Units**: millisecond
**Tags**: type, status

---

#### Business Metrics
```typescript
// KPI distributions
Sentry.metrics.distribution('metrics.yoy_growth_displayed', value)
Sentry.metrics.distribution('metrics.nrr_displayed', value)
Sentry.metrics.distribution('metrics.dau_displayed', value)
Sentry.metrics.distribution('metrics.csat_displayed', value)
Sentry.metrics.distribution('metrics.nps_displayed', value)
```

**Tags**: component

---

### Gauge Metrics

#### Analysis Gauges
```typescript
// Business metric snapshots
Sentry.metrics.gauge('analysis.yoy_growth', value)
Sentry.metrics.gauge('analysis.nrr', value)
Sentry.metrics.gauge('analysis.dau', value)
```

**Tags**: company name

---

#### History Gauges
```typescript
// History state
Sentry.metrics.gauge('history.size', count)
Sentry.metrics.gauge('history.success_count', count)
Sentry.metrics.gauge('history.error_count', count)
```

**Tags**: context, action, component

---

#### Health Metrics
```typescript
// Overall health indicator
Sentry.metrics.gauge('metrics.health_score', score)
```

Calculated from:
- YoY Growth > 50%
- NRR >= 100%
- CSAT >= 80%
- NPS > 30%

---

#### UI Metrics
```typescript
// Viewport tracking
Sentry.metrics.gauge('viewport.width', width)
Sentry.metrics.gauge('search.input_length', length)
```

**Tags**: page, milestone

---

## 🚨 Exception Capturing

### Explicit Exception Capture

#### Analysis Errors
```typescript
Sentry.captureException(error, {
  tags: {
    feature: 'url-analysis',
    error_type: 'simulated_failure',
  },
  contexts: {
    analysis: {
      url,
      requestCount,
      pattern: 'every_third_request',
    },
  },
  level: 'error',
  fingerprint: ['analysis-error', url],
});
```

**Context Included**:
- URL being analyzed
- Request count
- Duration
- Analysis phase
- Error type
- Custom fingerprint for grouping

---

### Automatic Exception Capture

All uncaught errors are automatically captured by Sentry with:
- Full stack traces
- User session data
- Browser information
- Current route
- Session replays (on error)

---

## 📈 Monitoring Dashboard Queries

### Key Queries to Create in Sentry

1. **Analysis Success Rate**
   ```
   sum(analysis.success) / sum(analysis.request) * 100
   ```

2. **Average Analysis Duration**
   ```
   avg(analysis.duration_ms) by status
   ```

3. **History Size Over Time**
   ```
   avg(history.size) by action
   ```

4. **Search Conversion Rate**
   ```
   sum(search.completed{status:success}) / sum(search.submitted) * 100
   ```

5. **Validation Failure Rate**
   ```
   sum(analysis.validation_failed) / sum(analysis.request) * 100
   ```

6. **Health Score Trend**
   ```
   avg(metrics.health_score) over time
   ```

7. **Error Distribution**
   ```
   count() by error_type
   ```

---

## 🎯 Alert Recommendations

### Critical Alerts

1. **High Error Rate**
   - Condition: `analysis.failed / analysis.request > 0.5`
   - Action: Page on-call engineer

2. **Slow Analysis**
   - Condition: `p95(analysis.duration_ms) > 5000`
   - Action: Send Slack notification

3. **Low Health Score**
   - Condition: `avg(metrics.health_score) < 50`
   - Action: Email product team

### Warning Alerts

1. **High Validation Failure**
   - Condition: `analysis.validation_failed / analysis.request > 0.3`
   - Action: Log to monitoring channel

2. **History Size Growing**
   - Condition: `history.size > 100`
   - Action: Monitor storage usage

---

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=customer-profile
SENTRY_AUTH_TOKEN=your-token
```

### Sample Rate Configuration

**Client Config** (`sentry.client.config.ts`):
```typescript
tracesSampleRate: 1.0          // 100% of transactions
replaysOnErrorSampleRate: 1.0   // 100% of error sessions
replaysSessionSampleRate: 0.1   // 10% of normal sessions
```

**Server Config** (`sentry.server.config.ts`):
```typescript
tracesSampleRate: 1.0           // 100% of server transactions
```

---

## 🧪 Testing Instrumentation

### Manual Testing

1. **Test Logging**: Check browser console for Sentry logs
2. **Test Metrics**: Verify in Sentry Metrics dashboard
3. **Test Errors**: Use "Test Sentry" button or trigger 3rd request failure

### Verification Checklist

- [ ] Page view logged on dashboard load
- [ ] Search submission logged with URL details
- [ ] Analysis metrics incremented on request
- [ ] Success metrics tracked on completion
- [ ] Error metrics tracked on failure
- [ ] History operations logged correctly
- [ ] Business metrics recorded with proper values
- [ ] Exceptions captured with full context
- [ ] Performance timings recorded accurately
- [ ] Health scores calculated correctly

---

## 📚 Best Practices

1. **Log Levels**:
   - `debug`: Verbose internal state
   - `info`: Normal operational events
   - `warn`: Unexpected but handled situations
   - `error`: Failures requiring attention

2. **Metric Naming**:
   - Use dot notation: `feature.metric_name`
   - Be specific: `analysis.duration_ms` not `duration`
   - Include units: `_ms`, `_count`, `_percent`

3. **Tags**:
   - Keep tag cardinality low (< 100 unique values)
   - Use meaningful names
   - Consistent casing (snake_case)

4. **Context**:
   - Include relevant business context
   - Add user journey information
   - Attach timing data

---

## 🎓 Training Resources

- [Sentry Logging Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/enriching-events/)
- [Sentry Metrics Docs](https://docs.sentry.io/product/metrics/)
- [Custom Instrumentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/custom-instrumentation/)
