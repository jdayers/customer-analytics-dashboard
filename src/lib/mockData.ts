import { AnalysisResult, HistoryItem } from './types';

// Constants for mock data generation
const INDUSTRIES = [
  'Software & Technology',
  'Financial Services',
  'Healthcare',
  'E-commerce',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Telecommunications',
  'Media & Entertainment',
  'Professional Services'
];

const EMPLOYEE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10000+'
];

const REVENUE_RANGES = [
  '$1M-$5M',
  '$5M-$10M',
  '$10M-$50M',
  '$50M-$100M',
  '$100M-$500M',
  '$500M-$1B',
  '$1B+'
];

const CITIES = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Los Angeles, CA',
  'Chicago, IL',
  'Denver, CO',
  'Portland, OR',
  'Atlanta, GA'
];

// Simple hash function for deterministic random generation
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Seeded random generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Linear congruential generator
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.range(0, array.length - 1)];
  }
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Convert domain to company name
function domainToCompanyName(domain: string): string {
  // Remove TLD and capitalize
  const name = domain.split('.')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate mock analysis result based on URL
export function generateMockAnalysis(url: string): AnalysisResult {
  const hash = hashString(url);
  const random = new SeededRandom(hash);

  const domain = extractDomain(url);
  const companyName = domainToCompanyName(domain);

  // Generate realistic metrics
  const yoyGrowth = random.range(5, 150);
  const nrr = random.range(85, 130);
  const dau = random.range(100, 50000);
  const csat = random.range(60, 95);
  const nps = random.range(-10, 70);
  const currentCustomers = random.range(50, 10000);

  return {
    id: generateId(),
    url,
    timestamp: new Date(),
    status: 'success',
    metrics: {
      yoyGrowth,
      nrr,
      dau,
      csat,
      nps,
      currentCustomers
    },
    firmographics: {
      companyName,
      industry: random.pick(INDUSTRIES),
      employeeCount: random.pick(EMPLOYEE_RANGES),
      foundedYear: random.range(1990, 2023),
      headquarters: random.pick(CITIES),
      revenue: random.pick(REVENUE_RANGES),
      website: url
    }
  };
}

// Generate initial history with fake data
export function generateInitialHistory(): HistoryItem[] {
  const fakeUrls = [
    'https://salesforce.com',
    'https://slack.com',
    'https://notion.so',
    'https://figma.com',
    'https://stripe.com',
    'https://zoom.us',
    'https://asana.com',
    'https://dropbox.com'
  ];

  return fakeUrls.map((url, index) => {
    const analysis = generateMockAnalysis(url);
    const daysAgo = index;
    const timestamp = new Date(Date.now() - (daysAgo * 86400000)); // Spread over days

    return {
      id: analysis.id,
      url,
      timestamp,
      status: 'success' as const,
      preview: analysis.firmographics.companyName
    };
  });
}

// Delay helper for simulating API calls
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
