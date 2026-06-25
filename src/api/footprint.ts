import request from './request';

/**
 * 足迹
 */
export interface Footprint {
  id: number;
  userId: number;
  city: string;
  province: string;
  lat: number;
  lng: number;
  visitedAt: string;
}

/**
 * 获取用户足迹
 * @returns 足迹列表
 */
export const getFootprints = () =>
  request<Footprint[]>({
    url: '/footprint',
    method: 'GET',
  });

/**
 * 同步足迹（点亮新城市）
 * @param data 城市信息
 * @returns void
 */
export const syncFootprint = (data: {
  city: string;
  province: string;
  lat: number;
  lng: number;
}) =>
  request({
    url: '/footprint/sync',
    method: 'POST',
    data,
  });

/**
 * 生成足迹海报
 * @returns 海报图片 URL
 */
export const generatePoster = () =>
  request<{ posterUrl: string }>({
    url: '/footprint/poster',
    method: 'GET',
  });