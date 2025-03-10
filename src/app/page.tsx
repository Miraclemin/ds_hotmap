'use client';

import { useState, useEffect } from 'react';
import { getMapData, getLatestNews } from '@/utils/api';
import ChinaMap from '@/components/ChinaMap';
import { Layout, Typography, Card, List, Tag, Spin, Row, Col, Statistic, Divider } from 'antd';
import { FireOutlined, RiseOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
import { ProvinceData, NewsItem } from '@/types';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function Home() {
  const [mapData, setMapData] = useState<ProvinceData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMapData();
        const newsData = await getLatestNews(5);
        setMapData(data);
        setNews(newsData);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 计算总数据
  const totalNews = mapData.reduce((sum, province) => sum + province.count, 0);
  // 只统计有新闻或部署数据的省份(count > 0)
  const provincesWithData = mapData.filter(province => province.count > 0);
  // 从有数据的省份中选择热度最高的5个
  const hotProvinces = [...provincesWithData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <Layout className="min-h-screen">
      <Header className="bg-blue-900 flex items-center px-4 sm:px-8">
        <div className="text-white font-bold text-xl sm:text-2xl flex items-center">
          <GlobalOutlined className="mr-2" />
          DeepSeek中国部署热力图
        </div>
      </Header>

      <Content className="p-4 sm:p-8">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic 
                title="总数据量" 
                value={totalNews} 
                prefix={<FireOutlined />} 
                valueStyle={{ color: '#0055a7' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="覆盖省份"
                value={provincesWithData.length}
                prefix={<EnvironmentOutlined />}
                valueStyle={{ color: '#ad0000' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="最高热度"
                value={provincesWithData.length > 0 
                  ? Math.max(...provincesWithData.map(item => item.value)) 
                  : 0}
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#f3b329' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={18}>
            <Card className="mb-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Spin size="large" tip="加载地图中...">
                    <div style={{ height: '50px', width: '50px', opacity: 0 }} />
                  </Spin>
                </div>
              ) : (
                <ChinaMap data={mapData} />
              )}
            </Card>

            <Card title="关于项目" className="mb-6">
              <Paragraph>
                本项目展示了DeepSeek在中国各地的部署和影响情况。地图以热力图的形式展示，颜色从蓝色到红色表示DeepSeek相关度的高低。
              </Paragraph>
              <Paragraph>
                数据来源于每日爬取的新闻，经过大模型处理后提取地理位置信息并存储。您可以将鼠标悬停在各省份上查看详细数据。
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            <Card 
              title={
                <div className="flex items-center">
                  <FireOutlined className="mr-2 text-red-500" />
                  <span>热度排行</span>
                </div>
              } 
              className="mb-6"
            >
              <List
                dataSource={hotProvinces}
                renderItem={(item, index) => (
                  <List.Item>
                    <div className="w-full flex justify-between items-center">
                      <div>
                        <Text mark={index === 0} strong={index < 3}>
                          {index + 1}. {item.name}
                        </Text>
                      </div>
                      <Tag color={index === 0 ? 'red' : index < 3 ? 'orange' : 'blue'}>
                        {item.value}
                      </Tag>
                    </div>
                  </List.Item>
                )}
              />
            </Card>

            <Card 
              title={
                <div className="flex items-center">
                  <RiseOutlined className="mr-2 text-blue-500" />
                  <span>最新数据</span>
                </div>
              }
            >
              {loading ? (
                <div className="flex justify-center items-center py-5">
                  <Spin />
                </div>
              ) : news.length > 0 ? (
                <List
                  dataSource={news}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="w-full">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-start"
                        >
                          <span className="inline-block mr-1">{item.title}</span>
                          <RiseOutlined className="text-xs mt-1 opacity-70" />
                        </a>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <EnvironmentOutlined className="mr-1" />
                          {item.location.province} 
                          {item.location.city && ` · ${item.location.city}`}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center py-5 text-gray-500">暂无最新数据</div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      <Footer className="text-center bg-gray-100">
        <div className="mb-2">DeepSeek中国地图 ©{new Date().getFullYear()} 版权所有</div>
        <div className="text-xs text-gray-500">数据每日更新，仅供参考</div>
      </Footer>
    </Layout>
  );
}
