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
    "city": string,
    "code": string,
    "district": string,
    "emoji": string,
    "name": string,
    "province": string,
    "type": string
}

// 新增：每日天气详情数据项类型
export interface DailyWeatherItem {
    /** 云量（%） */
    cloud: string;
    /** 预报日期（yyyy-MM-dd） */
    fxDate: string;
    /** 相对湿度（%） */
    humidity: string;
    /** 白天天气图标代码 */
    iconDay: string;
    /** 夜间天气图标代码 */
    iconNight: string;
    /** 降水量（mm） */
    precip: string;
    /** 日出时间 */
    sunrise: string;
    /** 日落时间 */
    sunset: string;
    /** 最高温度 */
    tempMax: string;
    /** 最低温度 */
    tempMin: string;
    /** 白天天气描述 */
    textDay: string;
    /** 夜间天气描述 */
    textNight: string;
    /** 紫外线指数 */
    uvIndex: string;
    /** 能见度（km） */
    vis: string;
    /** 白天风向 */
    windDirDay: string;
    /** 白天风力等级 */
    windScaleDay: string;
}

// 新增：天气数据主体类型
export interface QweatherData {
    code: string;
    daily: DailyWeatherItem[];
    fxLink: string;
    updateTime: string;
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
* 获取国内省/市列表
* @returns 国内省/市列表数据
*/
export const getRegionsAll = () =>
    request<any>({
        url: '/regions/all',
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
    request<QweatherData>({
        url: '/weather/qweather',
        method: 'GET',
        data: params
    });