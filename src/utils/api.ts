import axios from 'axios';
import { ApiResponse, ProvinceData, NewsItem } from '@/types';

// 基本API URL，使用相对路径避免跨域问题
const API_BASE_URL = '/api';

/**
 * 获取地图数据
 */
export async function getMapData(): Promise<ProvinceData[]> {
  try {
    const response = await axios.get<ApiResponse<ProvinceData[]>>(`${API_BASE_URL}/data`);
    return response.data.data;
  } catch (error) {
    console.error('获取地图数据失败:', error);
    return getMockData(); // 开发环境使用模拟数据
  }
}

/**
 * 获取最新新闻数据
 */
export async function getLatestNews(limit: number = 10): Promise<NewsItem[]> {
  try {
    const response = await axios.get<ApiResponse<NewsItem[]>>(`${API_BASE_URL}/news?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('获取新闻数据失败:', error);
    return [];
  }
}

/**
 * 获取省份详情数据
 */
export async function getProvinceDetail(provinceId: string): Promise<ProvinceData | null> {
  try {
    const response = await axios.get<ApiResponse<ProvinceData>>(`${API_BASE_URL}/province/${provinceId}`);
    return response.data.data;
  } catch (error) {
    console.error(`获取省份${provinceId}详情失败:`, error);
    return null;
  }
}

/**
 * 生成模拟数据（开发环境使用）
 */
function getMockData(): ProvinceData[] {
  // 确保省份名称与GeoJSON中的名称完全匹配
  const provinces = [
    { id: '11', name: '北京市', value: 95, count: 42 },
    { id: '12', name: '天津市', value: 82, count: 23 },
    { id: '13', name: '河北省', value: 78, count: 31 },
    { id: '14', name: '山西省', value: 67, count: 19 },
    { id: '15', name: '内蒙古自治区', value: 55, count: 12 },
    { id: '21', name: '辽宁省', value: 74, count: 27 },
    { id: '22', name: '吉林省', value: 68, count: 18 },
    { id: '23', name: '黑龙江省', value: 65, count: 17 },
    { id: '31', name: '上海市', value: 93, count: 39 },
    { id: '32', name: '江苏省', value: 88, count: 35 },
    { id: '33', name: '浙江省', value: 86, count: 34 },
    { id: '34', name: '安徽省', value: 72, count: 24 },
    { id: '35', name: '福建省', value: 76, count: 25 },
    { id: '36', name: '江西省', value: 63, count: 16 },
    { id: '37', name: '山东省', value: 85, count: 32 },
    { id: '41', name: '河南省', value: 75, count: 28 },
    { id: '42', name: '湖北省', value: 77, count: 29 },
    { id: '43', name: '湖南省', value: 73, count: 26 },
    { id: '44', name: '广东省', value: 90, count: 37 },
    { id: '45', name: '广西壮族自治区', value: 66, count: 18 },
    { id: '46', name: '海南省', value: 62, count: 14 },
    { id: '50', name: '重庆市', value: 79, count: 30 },
    { id: '51', name: '四川省', value: 80, count: 31 },
    { id: '52', name: '贵州省', value: 64, count: 17 },
    { id: '53', name: '云南省', value: 67, count: 19 },
    { id: '54', name: '西藏自治区', value: 30, count: 5 },
    { id: '61', name: '陕西省', value: 71, count: 23 },
    { id: '62', name: '甘肃省', value: 58, count: 13 },
    { id: '63', name: '青海省', value: 45, count: 8 },
    { id: '64', name: '宁夏回族自治区', value: 52, count: 10 },
    { id: '65', name: '新疆维吾尔自治区', value: 48, count: 9 },
    { id: '71', name: '台湾省', value: 56, count: 12 },
    { id: '81', name: '香港特别行政区', value: 69, count: 20 },
    { id: '82', name: '澳门特别行政区', value: 60, count: 15 }
  ];

  // 为部分省份添加城市数据和新闻
  return provinces.map(province => {
    // 为重点省份添加详细信息
    if (['北京市', '上海市', '广东省', '山西省', '四川省'].includes(province.name)) {
      // 生成城市数据
      const cities = generateMockCities(province.name);
      
      // 生成新闻数据
      const news = generateMockNews(province.name, 3);
      
      return {
        ...province,
        details: {
          cities,
          news
        }
      };
    }
    
    // 为其他省份添加简单城市数据
    if (province.count > 20) {
      return {
        ...province,
        details: {
          cities: generateMockCities(province.name, 3)
        }
      };
    }
    
    return province;
  });
}

/**
 * 生成模拟城市数据
 */
function generateMockCities(provinceName: string, count: number = 5): any[] {
  const citiesMap: Record<string, string[]> = {
    '北京市': ['朝阳区', '海淀区', '丰台区', '石景山区', '通州区'],
    '上海市': ['静安区', '徐汇区', '黄浦区', '浦东新区', '长宁区'],
    '广东省': ['广州市', '深圳市', '珠海市', '佛山市', '东莞市'],
    '山西省': ['太原市', '大同市', '晋中市', '长治市', '运城市'],
    '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市', '自贡市'],
  };
  
  const defaultCities = ['城市1', '城市2', '城市3', '城市4', '城市5'];
  const cities = citiesMap[provinceName] || defaultCities;
  
  return cities.slice(0, count).map((city, index) => {
    const cityCount = Math.floor(Math.random() * 10) + 1;
    const hasCityNews = Math.random() > 0.5;
    
    const cityData: any = {
      name: city,
      count: cityCount,
      details: Array(cityCount).fill(0).map((_, i) => `${provinceName}${city}部署点${i+1}`)
    };
    
    // 为部分城市添加新闻
    if (hasCityNews) {
      cityData.news = generateMockNews(provinceName, 1, city);
    }
    
    return cityData;
  });
}

/**
 * 生成模拟新闻数据
 */
function generateMockNews(provinceName: string, count: number = 3, cityName?: string): any[] {
  const deploymentTypes = [
    'DeepSeek-V2大模型',
    'DeepSeek-Coder编程助手',
    'DeepSeek-Math数学模型',
    'DeepSeek-VL视觉大模型',
    'DeepSeek-MoE混合专家模型'
  ];
  
  const scenarios = [
    '政务服务',
    '智慧医疗',
    '金融风控',
    '教育科研',
    '智能客服',
    '内容创作',
    '代码开发',
    '智慧交通'
  ];
  
  const institutions = [
    '科技园',
    '研究院',
    '大学',
    '医院',
    '政务中心',
    '数据中心',
    '企业总部',
    '产业园区'
  ];
  
  return Array(count).fill(0).map((_, index) => {
    const deploymentType = deploymentTypes[Math.floor(Math.random() * deploymentTypes.length)];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const institution = institutions[Math.floor(Math.random() * institutions.length)];
    const randomDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    const dateStr = randomDate.toISOString().split('T')[0];
    
    return {
      id: `news-${provinceName}-${index}`,
      title: `${provinceName}${cityName ? cityName : ''}${institution}成功部署${deploymentType}`,
      content: `${dateStr}，${provinceName}${cityName ? cityName : ''}${institution}宣布成功部署${deploymentType}，将应用于${scenario}场景，预计每年可节省人力成本约XXX万元，提升工作效率XX%。该项目是DeepSeek在${provinceName}的重要落地项目之一，标志着人工智能技术在当地的实际应用进入新阶段。`,
      url: `https://example.com/news/${provinceName.toLowerCase()}-${index}`,
      publishDate: dateStr,
      location: {
        province: provinceName,
        city: cityName
      },
      relevance: Math.floor(Math.random() * 40) + 60,
      deploymentInfo: `部署模型: ${deploymentType}\n应用场景: ${scenario}\n部署单位: ${provinceName}${cityName ? cityName : ''}${institution}`
    };
  });
} 