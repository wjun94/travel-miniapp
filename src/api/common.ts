import request from './request';

/**
 * 获取城市天气
 * @param city 城市
 * @returns 获取城市天气
 */
export const getQweather = (data: { city: string }) =>
    request<any>({
        url: '/weather/qweather',
        method: 'GET',
        data
    });