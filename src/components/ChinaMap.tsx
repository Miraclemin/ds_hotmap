'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as echarts from 'echarts';
// 导入ECharts完整包以确保有地图组件
import { Spin, Tooltip, Card, List, Typography, Divider, Tag, Button } from 'antd';
import { InfoCircleOutlined, LinkOutlined, BulbOutlined, PushpinOutlined } from '@ant-design/icons';
import { ProvinceData, NewsItem, CityData } from '@/types';

const { Title, Text, Paragraph } = Typography;

interface ChinaMapProps {
  data: ProvinceData[];
  loading?: boolean;
  title?: string;
}

const ChinaMap: React.FC<ChinaMapProps> = ({ data, loading = false, title = 'DeepSeek中国部署热力图' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<echarts.ECharts | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedNewsIndex, setSelectedNewsIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState<{x: number, y: number} | null>(null);

  // 客户端渲染标记
  useEffect(() => {
    setIsClient(true);
    console.log('确认在客户端渲染');
  }, []);

  // 加载地图数据的函数
  const loadMapData = useCallback(async () => {
    try {
      // 尝试加载完整的中国地图GeoJSON数据
      const response = await fetch('/china.json');
      if (!response.ok) {
        throw new Error(`无法加载地图数据: ${response.status}`);
      }
      const mapData = await response.json();
      console.log('成功获取中国地图数据');
      
      // 检查地图数据格式
      if (!mapData.features || !Array.isArray(mapData.features)) {
        throw new Error('地图数据格式不正确');
      }
      
      // 打印地图中的省份名称，用于调试
      const provinceNames = mapData.features.map((feature: any) => feature.properties.name);
      console.log('地图中的省份名称:', provinceNames);
      
      return mapData;
    } catch (error) {
      console.error('加载中国地图数据失败:', error);
      // 失败后使用简化的中国地图轮廓
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          id: 'china',
          properties: { name: '中国' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[75, 53], [135, 53], [135, 18], [75, 18], [75, 53]]]
          }
        }]
      };
    }
  }, []);

  // 统一初始化图表和地图数据
  useEffect(() => {
    // 仅在客户端且DOM元素存在时执行
    if (!isClient || !chartRef.current) {
      console.log('等待客户端渲染和DOM挂载...');
      return;
    }
    
    let chartInstance: echarts.ECharts | null = null;
    
    const initChart = async () => {
      try {
        console.log('DOM挂载完成，容器尺寸:', chartRef.current!.clientWidth, 'x', chartRef.current!.clientHeight);
        
        // 加载地图数据
        const mapData = await loadMapData();
        
        // 注册地图数据
        console.log('注册中国地图数据');
        echarts.registerMap('china', mapData);
        setMapLoaded(true);
        
        // 初始化图表
        console.log('初始化ECharts实例');
        chartInstance = echarts.init(chartRef.current!);
        console.log('ECharts实例创建成功');
        setChart(chartInstance);
        
        // 打印数据内容，帮助调试
        console.log('地图数据内容:', data);
        if (data && data.length > 0) {
          console.log('数据示例:', data[0]);
          console.log('数据值范围:', 
            Math.min(...data.map(item => typeof item.value === 'number' ? item.value : 0)), 
            '至', 
            Math.max(...data.map(item => typeof item.value === 'number' ? item.value : 0))
          );
        }
        
        // 配置图表
        const option = {
          backgroundColor: '#fff',
          title: {
            text: title,
            left: 'center',
            textStyle: {
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function(params: any) {
              // 尝试直接获取预先保存的数据
              const provinceData = params.data?.rawData;
              
              console.log('当前悬停省份:', params.name);
              console.log('直接使用params.data.rawData:', provinceData);
              
              if (!provinceData) {
                console.log('未找到预保存数据，尝试从data中查找...');
                // 如果没有预保存数据，尝试查找
                const found = data.find(p => {
                  const pName = p.name.replace(/(省|市|自治区|特别行政区)$/, '');
                  const paramsName = params.name.replace(/(省|市|自治区|特别行政区)$/, '');
                  return pName === paramsName || p.name === params.name;
                });
                
                if (!found) {
                  console.log('未找到匹配数据');
                  return `${params.name}<br/>暂无数据`;
                }
                
                console.log('找到匹配数据:', found);
                return formatProvinceTooltip(params.name, found);
              }
              
              return formatProvinceTooltip(params.name, provinceData);
            },
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderColor: '#ddd',
            borderWidth: 1,
            padding: [8, 12],
            textStyle: {
              color: '#333'
            },
            position: function(point: number[], params: any, dom: HTMLElement) {
              // 动态计算tooltip位置，确保不超出容器
              const viewWidth = document.documentElement.clientWidth;
              const viewHeight = document.documentElement.clientHeight;
              const domWidth = dom.offsetWidth;
              const domHeight = dom.offsetHeight;
              
              let left = point[0] + 15;
              let top = point[1] - domHeight / 2;
              
              // 确保不超出右边界
              if (left + domWidth > viewWidth - 10) {
                left = point[0] - domWidth - 15;
              }
              
              // 确保不超出上下边界
              if (top < 10) {
                top = 10;
              } else if (top + domHeight > viewHeight - 10) {
                top = viewHeight - domHeight - 10;
              }
              
              return [left, top];
            },
            extraCssText: 'box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); max-width: 400px; max-height: 450px; overflow: auto;'
          },
          visualMap: {
            type: 'continuous',
            min: 0,
            max: 10,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],
            calculable: true,
            inRange: {
              color: ['#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027']
            },
            textStyle: {
              color: '#000'
            },
            seriesIndex: 0,
            dimension: 0,
            show: true
          },
          series: [
            {
              name: '部署热度',
              type: 'map',
              map: 'china',
              roam: true,
              zoom: 1.2,
              center: [104, 35],
              selectedMode: false,
              label: {
                show: true,
                fontSize: 12,
                color: '#000'
              },
              itemStyle: {
                borderColor: '#999',
                borderWidth: 0.5
              },
              emphasis: {
                label: {
                  show: true,
                  color: '#000'
                },
                itemStyle: {
                  areaColor: '#a6c5ff'
                }
              },
              // 修改数据映射，直接使用数据中的省份名称
              data: data.map(item => {
                const value = typeof item.value === 'number' ? item.value : Math.floor(Math.random() * 90) + 10;
                
                // 记录数据用于调试
                console.log(`设置地图数据: ${item.name}, 值: ${value}`);
                
                return {
                  name: item.name,
                  value: value,
                  // 保存原始数据供tooltip使用
                  rawData: item
                };
              })
            }
          ]
        };
        
        // 设置选项
        chartInstance.setOption(option as any);
        console.log('图表选项设置成功');
        console.log('地图数据示例:', data.slice(0, 5).map(item => ({name: item.name, value: item.value})));
        
        // 添加额外的调试信息
        console.log('visualMap配置:', option.visualMap);
        console.log('地图数据格式:', option.series[0].data);
        
        // 添加事件监听
        chartInstance.on('mouseover', (params: any) => {
          // 反向映射，从完整名称找回原始数据
          const originalName = params.name;
          
          const found = data.find(p => p.name === originalName);
          if (found) {
            setHoveredProvince(found);
            setSelectedNewsIndex(0); // 重置选中的新闻索引
            
            // 记录鼠标位置
            const event = params.event;
            if (event && event.offsetX && event.offsetY) {
              setMousePosition({
                x: event.offsetX,
                y: event.offsetY
              });
            }
          }
        });
        
        chartInstance.on('mouseout', () => {
          setHoveredProvince(null);
          setMousePosition(null);
        });
        
        // 强制重绘
        setTimeout(() => {
          if (chartInstance) {
            console.log('强制重绘图表');
            chartInstance.resize();
          }
        }, 200);
      } catch (error) {
        console.error('初始化或配置图表时出错:', error);
        setMapError(error instanceof Error ? error.message : '未知错误');
      }
    };

    initChart();
    
    // 添加窗口大小变化监听
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance) {
        chartInstance.dispose();
      }
    };
  }, [isClient, loadMapData, data, title]); // 添加data和title作为依赖项，确保数据变化时重新渲染

  // 删除之前的鼠标事件处理，仅保留resize事件监听
  useEffect(() => {
    if (!chartRef.current || !chart) return;
    
    // 添加窗口大小变化监听
    const handleResize = () => {
      if (chart) {
        chart.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [chart]);

  // 省份新闻展示逻辑
  const renderNewsContent = () => {
    if (!hoveredProvince || !hoveredProvince.details?.news || hoveredProvince.details.news.length === 0) {
      return (
        <div className="py-2 text-gray-500 italic">
          暂无相关新闻和部署信息
        </div>
      );
    }

    const provinceNews = hoveredProvince.details.news;
    const currentNews = provinceNews[selectedNewsIndex];

    return (
      <div className="news-container mt-2">
        <div className="flex justify-between items-center mb-2">
          <Text strong>相关新闻 ({selectedNewsIndex + 1}/{provinceNews.length})</Text>
          <div className="news-navigation">
            <Button 
              type="text" 
              size="small" 
              disabled={selectedNewsIndex === 0}
              onClick={() => setSelectedNewsIndex(prev => Math.max(0, prev - 1))}
            >
              上一条
            </Button>
            <Button 
              type="text" 
              size="small" 
              disabled={selectedNewsIndex >= provinceNews.length - 1}
              onClick={() => setSelectedNewsIndex(prev => Math.min(provinceNews.length - 1, prev + 1))}
            >
              下一条
            </Button>
          </div>
        </div>

        <Card size="small" className="news-card mb-2">
          <Title level={5}>{currentNews.title}</Title>
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span>{currentNews.publishDate}</span>
            <Divider type="vertical" />
            <span>{currentNews.location.province}{currentNews.location.city ? ` · ${currentNews.location.city}` : ''}</span>
            <Divider type="vertical" />
            <Tag color="blue">相关度: {currentNews.relevance}</Tag>
          </div>
          
          {currentNews.deploymentInfo && (
            <div className="deployment-info bg-blue-50 p-2 rounded mb-2">
              <div className="flex items-start">
                <BulbOutlined className="text-blue-500 mr-2 mt-1" />
                <Paragraph className="text-sm m-0">
                  <Text strong>部署信息: </Text>
                  {currentNews.deploymentInfo}
                </Paragraph>
              </div>
            </div>
          )}
          
          <Paragraph ellipsis={{ rows: 3 }} className="text-sm">
            {currentNews.content}
          </Paragraph>
          
          <div className="text-right">
            <Button type="link" size="small" icon={<LinkOutlined />} href={currentNews.url} target="_blank">
              查看原文
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // 城市部署信息展示
  const renderCityDeployments = () => {
    if (!hoveredProvince || !hoveredProvince.details?.cities || hoveredProvince.details.cities.length === 0) {
      return null;
    }

    return (
      <div className="mt-3">
        <Text strong>城市部署情况:</Text>
        <List
          size="small"
          dataSource={hoveredProvince.details.cities}
          renderItem={city => (
            <List.Item className="py-1">
              <div className="w-full">
                <div className="flex justify-between">
                  <Text>{city.name}</Text>
                  <Text type="secondary">{city.count} 条</Text>
                </div>
                {city.news && city.news.length > 0 && (
                  <div className="mt-1 text-xs text-gray-600">
                    <PushpinOutlined className="mr-1" />
                    {city.news[0].title}
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      </div>
    );
  };

  // 添加一个格式化tooltip的辅助函数
  function formatProvinceTooltip(provinceName: string, provinceData: ProvinceData): string {
    let tooltipContent = `
      <div style="max-width:350px;">
        <div style="font-weight:bold;margin-bottom:8px;font-size:15px;color:#1a1a1a;border-bottom:1px solid #eee;padding-bottom:5px;">
          ${provinceName}
        </div>
        
        <div style="margin-bottom:10px;display:flex;align-items:center;">
          <span style="margin-right:5px;">相关度:</span>
          <span style="font-weight:bold;color:#0066cc;font-size:14px;">${provinceData.value}</span>
          <span style="margin-left:10px;margin-right:5px;">新闻数:</span>
          <span style="font-weight:bold;color:#f5a623;font-size:14px;">${provinceData.count}</span>
        </div>
    `;
    
    // 添加城市信息
    if (provinceData.details?.cities && provinceData.details.cities.length > 0) {
      tooltipContent += `
        <div style="margin-bottom:5px;font-weight:bold;border-top:1px solid #eee;padding-top:7px;color:#444;">
          城市部署情况:
        </div>
      `;
      
      // 最多显示5个城市
      const citiesToShow = provinceData.details.cities.slice(0, 5);
      citiesToShow.forEach((city: CityData) => {
        tooltipContent += `
          <div style="margin-bottom:8px;background:#f7f7f7;border-radius:4px;padding:5px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
              <span style="color:#1890ff;font-weight:bold;">${city.name}</span>
              <span style="color:#666;font-size:12px;">${city.count}条</span>
            </div>
        `;
        
        // 添加城市部署详情
        if (city.details && city.details.length > 0) {
          tooltipContent += `<div style="margin-left:5px;font-size:12px;">`;
          // 显示最多2条部署详情
          for (let i = 0; i < Math.min(2, city.details.length); i++) {
            tooltipContent += `
              <div style="color:#666;margin-top:3px;display:flex;">
                <span style="color:#1890ff;margin-right:3px;">•</span>
                <span>${city.details[i]}</span>
              </div>
            `;
          }
          if (city.details.length > 2) {
            tooltipContent += `
              <div style="color:#999;font-size:11px;margin-top:2px;text-align:right;">
                还有 ${city.details.length - 2} 条部署信息...
              </div>
            `;
          }
          tooltipContent += `</div>`;
        }
        
        tooltipContent += `</div>`;
      });
      
      if (provinceData.details.cities.length > 5) {
        tooltipContent += `
          <div style="font-size:12px;color:#999;text-align:right;">
            还有 ${provinceData.details.cities.length - 5} 个城市...
          </div>
        `;
      }
    }
    
    tooltipContent += `</div>`;
    return tooltipContent;
  }

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center h-96 border border-gray-300 bg-white rounded-lg">
        <Spin size="large" tip="加载地图中...">
          <div style={{ height: '50px', width: '50px', opacity: 0 }}></div>
        </Spin>
      </div>
    );
  }

  return (
    <div className="china-map-container w-full relative">
      <div 
        ref={chartRef} 
        className="w-full h-[500px] border border-gray-200 rounded-lg"
        style={{ background: '#f9f9f9' }}
      ></div>
      
      {/* 删除悬停弹窗 */}
      
      {mapError && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-red-500 text-center">
            <div className="text-lg mb-2">地图加载失败</div>
            <div className="text-sm">{mapError}</div>
          </div>
        </div>
      )}
      
      {isClient && !loading && data.length === 0 && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-gray-500 text-center">
            <div className="text-lg mb-2">暂无数据</div>
            <div>请联系管理员或稍后再试</div>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-2 text-right">
        <div>数据项数: {data.length}</div>
        <div>有效省份: {data.filter(item => item.count > 0).length}</div>
      </div>
    </div>
  );
};

export default ChinaMap; 