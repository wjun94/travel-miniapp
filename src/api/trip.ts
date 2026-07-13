import request from './request';

interface TripMember {
  createdAt: string;
  id: string;
  name: string;
  role: string;
  tripId: string;
  userId: string;
}

interface TripDayItem {
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

interface TripDay {
  createdAt: string;
  date: string;
  dayNumber: number;
  id: string;
  items: TripDayItem[];
  title: string;
  tripId: string;
}

export interface Trip {
  cities: string[];
  countries: string[];
  coverImage: string;
  createdAt: string;
  days: TripDay[];
  destinations: string[];
  favoriteCount: number;
  guideId: string;
  id: string;
  isOverseas: 0 | 1;
  isPublic: 0 | 1;
  likeCount: number;
  members: TripMember[];
  note: string;
  provinces: string[];
  status: number;
  title: string;
  totalBudget: number;
  updatedAt: string;
  userId: string;
  viewCount: number;
}

/**
 * 创建旅行行程
 * @param data 行程表单提交参数
 * @returns 请求返回值
 */
export const createTrip = (data: Trip) => {
  return request<null>({
    url: '/trip',
    method: 'POST',
    data,
  });
};

/**
 * 根据行程ID获取行程详情
 * @param id 行程id
 * @returns 行程详情 + 每日行程
 */
export const getTripDetail = (id: string) => {
  return request<Trip>({
    url: `/trip/${id}`,
    method: 'GET',
  });
};

/**
 * 点赞行程
 * @param id 行程ID
 */
export const likeTrip = (id: string) => {
  return request<string>({
    url: `/trip/${id}/like`,
    method: 'POST',
  });
};

/**
 * 取消点赞行程
 * @param id 行程ID
 */
export const unlikeTrip = (id: string) => {
  return request<string>({
    url: `/trip/${id}/like`,
    method: 'DELETE',
  });
};
