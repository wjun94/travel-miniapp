import request from './request';

// 每日行程景点/项目明细
export interface TripDayItem {
  id: string;
  dayId: string;
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
  createdAt: string;
}

// 单日行程
export interface TripDay {
  id: string;
  guideId: string;
  date: string;
  dayNumber: number;
  items: TripDayItem[];
  title: string;
  createdAt: string;
}

// 攻略主体信息
export interface TravelGuide {
  id: string;
  userId: string;
  bestSeason: string;
  budgetMax: number;
  budgetMin: number;
  coverImage: string;
  crowdType: string;
  destination: string;
  difficulty: string;
  isOriginal: number;
  likeCount: number;
  recommendedDays: number;
  status: number;
  summary: string;
  tags: string;
  title: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// 攻略详情接口返回data结构
export interface TravelGuideDetailData {
  days: TripDay[];
  guide: TravelGuide;
  isLiked?: boolean;
  isFavorited?: boolean;
  favoriteCount?: number;
  commentCount?: number;
  likeCount?: number
}

// 后端统一返回格式
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
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
  return request<ApiResponse<null>>({
    url: '/guide',
    method: 'POST',
    data,
  });
};

/**
 * 根据攻略ID获取攻略详情
 * @param id 攻略id
 * @returns 攻略详情 + 每日行程
 */
export const getTravelGuideDetail = (id: string) => {
  return request<TravelGuideDetailData>({
    url: `/guide/${id}`,
    method: 'GET',
  });
};

/**
 * 点赞攻略
 * @param id 攻略ID
 */
export const likeTravelGuide = (id: string) => {
  return request<string>({
    url: `/guide/${id}/like`,
    method: 'POST',
  });
};

/**
 * 取消点赞攻略
 * @param id 攻略ID
 */
export const unlikeTravelGuide = (id: string) => {
  return request<string>({
    url: `/guide/${id}/like`,
    method: 'DELETE',
  });
};
