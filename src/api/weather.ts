import request from './request';

/**
 * 获取城市天气
 * @param city 城市名称
 * @returns 天气数据
 */
export const getWeather = (city: string) =>
  request<any>({
    url: '/weather',
    method: 'GET',
    params: { city },
  });