import request from './request';

/**
 * 获取城市天气
 * @param city 城市
 * @returns 获取城市天气
 */
export const getWeather = (data: { city: string }) =>
    request<any>({
        url: '/weather',
        method: 'GET',
        data
    });