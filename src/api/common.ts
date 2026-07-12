import request from './request';

// --- 类型定义 ---

export interface CountryItem {
    code: string;
    emoji: string;
    name: string;
    nameEn: string;
    phone: string;
}

export interface CountriesResponse {
    code: number;
    msg: string;
    data: CountryItem[];
}

export interface DomesticItem {
    cities: string[];
    province: string;
}

export interface DomesticResponse {
    code: number;
    msg: string;
    data: DomesticItem[];
}

// 新增：搜索目的地数据项类型
export interface DestinationItem {
    code: string;
    emoji: string;
    name: string;
    province: string;
    type: string;
}

// --- API 接口 ---

/**
 * 获取境外国家列表
 * @returns 境外国家列表数据
 */
export const getCountries = () =>
    request<CountriesResponse>({
        url: '/regions/countries',
        method: 'GET'
    });

/**
 * 获取国内省/市列表
 * @returns 国内省/市列表数据
 */
export const getDomesticRegions = () =>
    request<DomesticResponse>({
        url: '/regions/domestic',
        method: 'GET'
    });

/**
 * 搜索目的地
 * @param params { keyword: string } 搜索关键词
 * @returns 目的地搜索结果
 */
export const searchDestinations = (params: { keyword: string }) =>
    request<DestinationItem[]>({
        url: '/destinations/search',
        method: 'GET',
        data: params
    });

/**
 * 获取城市天气
 * @param params { city: string } 城市
 * @returns 获取城市天气
 */
export const getQweather = (params: { city: string }) =>
    request<any>({
        url: '/weather/qweather',
        method: 'GET',
        data: params
    });