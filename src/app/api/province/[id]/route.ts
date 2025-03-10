import { NextResponse } from 'next/server';
import { ProvinceData, CityData } from '@/types';
import db from '@/lib/db';

// 从数据库获取省份详情（优化版 - 简化查询）
async function getProvinceDetailFromDB(provinceId: string): Promise<ProvinceData | null> {
  try {
    // 1. 获取省份基本信息
    const provinceResult = await db.query(`
      SELECT id, name, value, count 
      FROM provinces 
      WHERE id = $1
    `, [provinceId]);
    
    if (provinceResult.rows.length === 0) {
      return null;
    }
    
    const province = provinceResult.rows[0];
    
    // 2. 获取省份的所有城市
    const citiesResult = await db.query(`
      SELECT id, name, count, details
      FROM cities
      WHERE province_id = $1
      ORDER BY count DESC
    `, [provinceId]);
    
    // 转换城市数据格式
    const cities: CityData[] = citiesResult.rows.map(city => ({
      name: city.name,
      count: city.count,
      details: city.details || []
    }));
    
    // 3. 获取省份的所有新闻(最多20条)
    const newsResult = await db.query(`
      SELECT 
        n.id, n.title, n.content, n.url, 
        n.publish_date, n.relevance, n.deployment_info,
        p.name as province_name,
        c.name as city_name,
        n.district
      FROM news n
      JOIN provinces p ON n.province_id = p.id
      LEFT JOIN cities c ON n.city_id = c.id
      WHERE n.province_id = $1
      ORDER BY n.publish_date DESC
      LIMIT 20
    `, [provinceId]);
    
    // 格式化新闻数据
    const news = newsResult.rows.map(news => ({
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
    
    console.log(`成功获取省份 ${province.name} 的详情，包含 ${cities.length} 个城市和 ${news.length} 条新闻`);
    
    // 构造并返回省份详情
    return {
      id: province.id,
      name: province.name,
      value: province.value,
      count: province.count,
      details: {
        cities,
        news: news.length > 0 ? news : undefined
      }
    };
  } catch (error) {
    console.error(`从数据库获取省份详情失败 (ID: ${provinceId}):`, error);
    throw error;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const provinceId = params.id;
    
    // 从数据库获取省份详情
    const provinceData = await getProvinceDetailFromDB(provinceId);
    
    if (!provinceData) {
      return NextResponse.json(
        { 
          success: false, 
          message: '未找到指定省份',
          data: null 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: provinceData
    });
  } catch (error) {
    console.error('获取省份详情失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '获取省份详情失败',
        data: null 
      },
      { status: 500 }
    );
  }
} 