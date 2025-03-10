// 省份数据类型
export interface ProvinceData {
  id: string;
  name: string;
  value: number;
  count: number;
  details?: {
    cities: CityData[];
    news?: NewsItem[];
  };
}

// 城市数据类型
export interface CityData {
  name: string;
  count: number;
  details?: string[];
  news?: NewsItem[];
}

// 新闻数据类型
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  url: string;
  publishDate: string;
  location: {
    province: string;
    city?: string;
    district?: string;
  };
  relevance: number; // 与DeepSeek相关度
  deploymentInfo?: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
} 