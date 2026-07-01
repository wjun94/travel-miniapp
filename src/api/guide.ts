import request from './request';

// 每日行程景点/项目明细
export interface TripDayItem {
  address: string;
  description: string;
  endTime: string;
  images: string[];
  latitude: number;
  longitude: number;
  needReservation: boolean;
  sectionType: string;
  startTime: string;
  ticketChannel: string;
  ticketPrice: number;
  title: string;
}

// 单日行程
export interface TripDay {
  date: string;
  items: TripDayItem[];
  title: string;
}

// 攻略提交参数整体类型
export interface CreateTravelGuideParams {
  bestSeason: string;
  budgetMax: number;
  budgetMin: number;
  coverImage: string;
  crowdType: string;
  days: TripDay[];
  destination: string;
  difficulty: string;
  isOriginal: number;
  recommendedDays: number;
  status: number;
  summary: string;
  tags: string;
  title: string;
}

/**
 * 创建旅行攻略
 * @param data 攻略表单提交参数
 * @returns 请求返回值
 */
export const createTravelGuide = (data: CreateTravelGuideParams) => {
  return request<null>({
    url: '/guide',
    method: 'POST',
    data,
  });
};