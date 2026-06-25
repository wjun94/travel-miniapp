import request from './request';

/**
 * 周边推荐（高德 POI 返回数据）
 */
export interface NearbyPOI {
  id: string;
  name: string;
  location: string;
  address: string;
  distance: number;
  photos: any[];
  // 更多字段...
}

/**
 * 获取周边游推荐
 * @param lat 纬度
 * @param lng 经度
 * @returns POI 列表
 */
export const getNearby = (lat: number, lng: number) =>
  request<NearbyPOI[]>({
    url: '/nearby',
    method: 'GET',
    data: { lat, lng },
  });

/**
 * 获取后台配置的本周 TOP 推荐
 * @param city 城市（可选）
 * @returns 推荐内容列表
 */
export const getTopRecommend = (city?: string) =>
  request<any[]>({ // 可根据实际模型定义类型
    url: '/nearby/recommend',
    method: 'GET',
    data: { city },
  });