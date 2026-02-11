# Sentry Seer Setup Guide

This guide explains how to set up and use Sentry Seer (AI-powered error analysis) with this project.

## What is Sentry Seer?

Sentry Seer is Sentry's AI-powered assistant that provides:
- **Automated Root Cause Analysis**: Identifies why errors occur
- **Fix Suggestions**: Recommends solutions based on error context
- **Intelligent Grouping**: Groups related errors using AI
- **Issue Summaries**: Natural language summaries of error patterns
- **Code Context**: Links errors to specific code locations

---

## Prerequisites

1. **Sentry Account**: Active Sentry project (already configured)
2. **DSN Configured**: `NEXT_PUBLIC_SENTRY_DSN` set in `.env.local`
3. **Code Deployed**: Application running and sending errors to Sentry

---

## Step 1: Enable Seer in Sentry Dashboard

### Via Sentry UI

1. **Navigate to your project**:
   - Go to: https://sentry.io/organizations/your-org/projects/customer-profile/

2. **Enable AI Features**:
   - Click **Settings** (left sidebar)
   - Select **General Settings**
   - Scroll to **AI & ML Features** section
   - Toggle ON:
     - ✅ **Autofix** - AI-powered fix suggestions
     - ✅ **Issue Summaries** - Natural language error summaries
     - ✅ **Suggested Assignees** - AI suggests who should fix the issue

3. **Configure Issue Grouping**:
   - Go to **Settings** → **Issue Grouping**
   - Enable **AI-Powered Grouping** (if available)

---

## Step 2: Enhanced Error Context (Already Implemented)

We've added `sentryContext.ts` which provides rich context for Seer analysis:

```typescript
// Capture errors with enhanced context
captureErrorWithContext(
  error,
  {
    feature: 'url-analysis',
    action: 'analyze_url',
    url: 'https://example.com',
    timestamp: new Date().toISOString(),
  },
  {
    requestCount: 42,
    duration: 1234,
    phase: 'analysis',
  }
);
```

### What Gets Sent to Seer

1. **Environment Context**:
   - User agent
   - Viewport size
   - Browser information

2. **Navigation Context**:
   - Current URL
   - Previous URL
   - Navigation history

3. **Application Context**:
   - Feature name
   - Action being performed
   - Request metadata

4. **Error Context**:
   - Error message
   - Stack trace
   - Breadcrumb trail
   - Custom fingerprint

---

## Step 3: Upload Source Maps (Optional but Recommended)

Source maps help Seer provide better context by showing original TypeScript code.

### Configure Source Maps Upload

1. **Add to `.env.local`**:
```env
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=customer-profile
```

2. **Get Auth Token**:
   - Go to: https://sentry.io/settings/account/api/auth-tokens/
   - Click **Create New Token**
   - Scopes needed:
     - `project:releases`
     - `project:write`
     - `org:read`
   - Copy token to `.env.local`

3. **Source maps upload automatically on build**:
```bash
npm run build  # Uploads source maps if SENTRY_AUTH_TOKEN is set
```

---

## Step 4: Test Seer Features

### Test 1: Trigger an Error

1. Open http://localhost:3000
2. Click **"Test Sentry"** button
3. Or analyze 3 URLs (3rd one fails)

### Test 2: View in Sentry

1. Go to: https://sentry.io/organizations/your-org/issues/
2. Click on an error
3. Look for:
   - **💡 Suggested Fix** (Autofix section)
   - **📝 Issue Summary** (AI-generated summary)
   - **🔍 Root Cause** (AI analysis)

### Test 3: Ask Seer Questions

In the Sentry issue page:
1. Look for **"Ask Seer"** or **"AI Assistant"** button
2. Ask questions like:
   - "What caused this error?"
   - "How do I fix this?"
   - "What code should I change?"
   - "Are there similar issues?"

---

## Using Enhanced Error Context

### Example 1: Capture with User Context

```typescript
import { captureErrorWithContext, setUserContext } from '@/lib/sentryContext';

// Set user context at login
setUserContext('user-123', 'user@example.com', 'john_doe');

// Later when error occurs
try {
  // ... your code
} catch (error) {
  captureErrorWithContext(
    error,
    {
      feature: 'authentication',
      action: 'login',
      userId: 'user-123',
    },
    {
      loginAttempt: 3,
      provider: 'google',
    }
  );
}
```

### Example 2: Track Performance for Seer

```typescript
import { trackPerformance } from '@/lib/sentryContext';

const startTime = Date.now();

// ... perform operation

trackPerformance('data-fetch', startTime, {
  endpoint: '/api/customers',
  recordCount: 150,
});
```

### Example 3: Add Custom Context

```typescript
import { setCustomContext } from '@/lib/sentryContext';

setCustomContext('subscription', {
  plan: 'enterprise',
  features: ['sso', 'api-access'],
  trialEndDate: '2024-12-31',
});
```

---

## Seer Features in Action

### 1. Autofix
When an error occurs, Seer analyzes:
- Error message and stack trace
- Code context around the error
- Similar resolved issues
- Common patterns

**Provides**:
- Specific code changes to fix
- Explanation of why it failed
- Link to documentation

### 2. Issue Summaries
Natural language summary of:
- What the error is
- Which users are affected
- When it started happening
- Potential impact

### 3. Intelligent Grouping
AI groups errors by:
- Root cause (not just stack trace)
- User impact
- Semantic similarity
- Code paths

---

## Best Practices for Seer

### 1. Provide Rich Context

❌ **Bad**: Generic errors
```typescript
throw new Error('Something went wrong');
```

✅ **Good**: Specific, contextual errors
```typescript
throw new Error(`Failed to analyze URL ${url}: API timeout after ${duration}ms`);
```

### 2. Use Breadcrumbs

```typescript
Sentry.addBreadcrumb({
  category: 'ui',
  message: 'User clicked analyze button',
  level: 'info',
  data: { url: userInput },
});
```

### 3. Set User Context

```typescript
Sentry.setUser({
  id: userId,
  email: userEmail,
  username: username,
  subscription: 'premium',
});
```

### 4. Add Custom Tags

```typescript
Sentry.setTag('feature', 'url-analysis');
Sentry.setTag('environment', 'production');
Sentry.setTag('version', '1.2.3');
```

---

## Monitoring Seer Performance

### Metrics to Track

1. **Time to Resolution**:
   - Before Seer: Average days to resolve
   - After Seer: Should decrease significantly

2. **Fix Success Rate**:
   - Track if Seer suggestions actually fix issues

3. **Developer Satisfaction**:
   - Survey team on Seer helpfulness

### Dashboard Queries

**Issues with AI Suggestions**:
```
is:unresolved has:autofix
```

**Most Impactful Issues**:
```
is:unresolved sort:freq
```

**User-Affecting Errors**:
```
is:unresolved has:user-impact
```

---

## Troubleshooting

### Seer Not Showing Suggestions

1. **Check AI is enabled**:
   - Settings → General → AI Features = ON

2. **Verify error context**:
   - Errors need stack traces and context
   - Source maps help significantly

3. **Wait for analysis**:
   - First occurrence: ~1 minute
   - Subsequent: Near instant

### Suggestions Not Helpful

1. **Add more context**:
   - Use `captureErrorWithContext`
   - Add breadcrumbs
   - Set user context

2. **Upload source maps**:
   - Helps Seer see original code

3. **Provide feedback**:
   - Mark suggestions as helpful/not helpful
   - Improves AI over time

---

## Advanced Configuration

### Custom AI Prompts (Enterprise)

If on Enterprise plan, you can customize Seer prompts:

1. Go to **Settings** → **AI Configuration**
2. Add custom instructions:
```
When analyzing errors in the url-analysis feature,
consider that we use a third-party API that may timeout.
Suggest retry logic and exponential backoff.
```

### Integration with GitHub

1. **Settings** → **Integrations** → **GitHub**
2. Link repository
3. Seer will:
   - Create issues automatically
   - Suggest code changes in PRs
   - Link errors to commits

---

## Cost Considerations

Seer usage is typically included in:
- **Team Plan**: Limited AI features
- **Business Plan**: Full Autofix and summaries
- **Enterprise Plan**: Custom AI configuration

Check your plan at: https://sentry.io/orgredirect/organizations/:orgslug/settings/billing/

---

## Resources

- [Sentry Seer Documentation](https://docs.sentry.io/product/issues/issue-details/autofix/)
- [AI-Powered Grouping](https://docs.sentry.io/product/data-management-settings/event-grouping/)
- [Source Maps Upload](https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/)
- [Error Context Best Practices](https://docs.sentry.io/platforms/javascript/enriching-events/)

---

## Quick Reference

### Enable Seer
```
Settings → General Settings → AI Features → Enable All
```

### Test Error
```bash
# In browser
Click "Test Sentry" button
```

### View AI Suggestions
```
Issues → Click Error → Look for 💡 Autofix section
```

### Enhanced Error Capture
```typescript
import { captureErrorWithContext } from '@/lib/sentryContext';

captureErrorWithContext(error, { feature, action, url }, metadata);
```

---

**Your project is now set up for Sentry Seer!** 🎉

Trigger some errors and check your Sentry dashboard to see AI-powered insights.
