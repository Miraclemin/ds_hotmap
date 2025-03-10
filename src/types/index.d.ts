export interface NewsItem {
  id: number;
  title: string;
  url: string;
  source?: string;
  publish_date?: string;
  publishDate?: string;
  content: string;
  locations?: string[];
  province?: string;
  city?: string;
  district?: string;
  location?: {
    province: string;
    city?: string;
    district?: string;
  };
  relevance?: number;
  deploymentInfo?: any;
}

export interface CityData {
  city?: string;
  name?: string;
  count: number;
  news?: NewsItem[];
  details?: any[];
  latitude?: number;
  longitude?: number;
}

export interface ProvinceData {
  id?: string | number;
  province?: string;
  name?: string;
  value?: number;
  count: number;
  cities?: CityData[];
  details?: {
    cities: CityData[];
    news?: NewsItem[];
  };
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
    }
  }
} 