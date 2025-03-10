import { NextResponse } from 'next/server';
import { ProvinceData, CityData } from '@/types';
import db from '@/lib/db';

// 从数据库获取所有省份数据（优化版 - 单次查询）
async function getProvincesFromDB(): Promise<ProvinceData[]> {
  try {
    // 先获取所有省份的基本信息
    const provincesResult = await db.query(`
      SELECT id, name, value, count 
      FROM provinces 
      ORDER BY count DESC
    `);
    
    if (provincesResult.rows.length === 0) {
      return [];
    }
    
    // 获取所有城市数据
    const citiesResult = await db.query(`
      SELECT province_id, id, name, count, details
      FROM cities
      ORDER BY count DESC
    `);
    
    // 获取每个省份的新闻数据(最多5条)
    const newsResult = await db.query(`
      WITH ranked_news AS (
        SELECT 
          n.*,
          p.name as province_name,
          c.name as city_name,
          ROW_NUMBER() OVER (PARTITION BY n.province_id ORDER BY n.publish_date DESC) as rn
        FROM news n
        JOIN provinces p ON n.province_id = p.id
        LEFT JOIN cities c ON n.city_id = c.id
      )
      SELECT 
        id, title, content, url, publish_date, 
        relevance, deployment_info, province_id, city_id, district,
        province_name, city_name, rn
      FROM ranked_news
      WHERE rn <= 5
      ORDER BY province_id, rn
    `);
    
    // 整理数据结构
    const provinces = provincesResult.rows.map(province => {
      // 获取该省的所有城市
      const provinceCities = citiesResult.rows
        .filter(city => city.province_id === province.id)
        .map(city => ({
          name: city.name,
          count: city.count,
          details: city.details || []
        }));
      
      // 获取该省的所有新闻
      const provinceNews = newsResult.rows
        .filter(news => news.province_id === province.id)
        .map(news => ({
          id: news.id,
          title: news.title,
          content: news.content,
          url: news.url,
          publishDate: news.publish_date instanceof Date 
            ? news.publish_date.toISOString() 
            : news.publish_date,
          location: {
            province: news.province_name,
            city: news.city_name,
            district: news.district
          },
          relevance: news.relevance,
          deploymentInfo: news.deployment_info
        }));
      
      // 构建省份数据
      return {
        id: province.id,
        name: province.name,
        value: province.value,
        count: province.count,
        details: {
          cities: provinceCities,
          news: provinceNews.length > 0 ? provinceNews : undefined
        }
      };
    });
    
    console.log(`成功获取 ${provinces.length} 个省份数据`);
    return provinces;
  } catch (error) {
    console.error('从数据库获取省份数据失败:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // 从数据库获取数据
    const data = await getProvincesFromDB();

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取地图数据失败:', error);
    return NextResponse.json(
      { 
        success: false,
        message: '获取数据失败',
        data: [] 
      },
      { status: 500 }
    );
  }
} 