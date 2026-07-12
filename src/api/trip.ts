import request from './request';

// 每日行程景点/项目明细
export interface TripDayItem {
  address: string;
  createdAt: string;
  description: string;
  endLat: number;
  endLng: number;
  endPoint: string;
  endTime: string;
  id: string;
  images: string[];
  latitude: number;
  longitude: number;
  needReservation: boolean;
  sectionType: string;
  startLat: number;
  startLng: number;
  startPoint: string;
  startTime: string;
  ticketChannel: string;
  ticketPrice: number;
  title: string;
  transportMode: string;
  tripDayId: string;
}

// 成员
export interface TripMember {
  createdAt: string;
  id: string;
  name: string;
  role: string;
  tripId: string;
  userId: string;
}

export interface TripDay {
  createdAt: string;
  date: string;
  dayNumber: number;
  id: string;
  items: TripDayItem[];
  title: string;
  tripId: string;
}

// 单日行程
export interface TripData {
  city: string;
  country: string;
  coverImage: string;
  createdAt: string;
  days: TripDay[];
  destination: string;
  endDate: string;
  favoriteCount: number;
  guideId: string;
  id: string;
  isOverseas: number;
  isPublic: number;
  likeCount: number;
  members: TripMember[];
  note: string;
  province: string;
  startDate: string;
  status: number;
  title: string;
  totalBudget: number;
  updatedAt: string;
  userId: string;
  viewCount: number;
}

// 攻略主体信息
export interface Trip {
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
export interface TripDetailData {
  days: TripDay[];
  trip: Trip;
  isLiked?: boolean;
  isFavorited?: boolean;
  favoriteCount?: number;
  commentCount?: number;
  likeCount?: number
}

/**
 * 创建旅行攻略
 * @param data 攻略表单提交参数
 * @returns 请求返回值
 */
export const createTrip = (data: TripDetailData) => {
  return request<null>({
    url: '/trip',
    method: 'POST',
    data,
  });
};

/**
 * 根据攻略ID获取攻略详情
 * @param id 攻略id
 * @returns 攻略详情 + 每日行程
 */
export const getTripDetail = (id: string) => {
  return request<TripDetailData>({
    url: `/trip/${id}`,
    method: 'GET',
  });
};

/**
 * 点赞攻略
 * @param id 攻略ID
 */
export const likeTrip = (id: string) => {
  return request<string>({
    url: `/trip/${id}/like`,
    method: 'POST',
  });
};

/**
 * 取消点赞攻略
 * @param id 攻略ID
 */
export const unlikeTrip = (id: string) => {
  return request<string>({
    url: `/trip/${id}/like`,
    method: 'DELETE',
  });
};
