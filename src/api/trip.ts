import request from './request';
import type { Guide } from './post'

interface TripMember {
  /** 创建时间 */
  createdAt: string;
  /** 成员 ID */
  id: string;
  /** 成员名称 */
  name: string;
  /** 成员角色（组织者/参与者） */
  role: string;
  /** 所属行程 ID */
  tripId: string;
  /** 用户 ID */
  userId: string;
}

interface TripDayItem {
  /** 地址名称 */
  address: string;
  /** 创建时间 */
  createdAt: string;
  /** 描述 */
  description: string;
  /** 结束纬度 */
  endLat: number;
  /** 结束经度 */
  endLng: number;
  /** 终点地址 */
  endPoint: string;
  /** 结束时间 */
  endTime: string;
  /** 行程项 ID */
  id: string;
  /** 图片列表 */
  images: string[];
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 是否需要预约 */
  needReservation: boolean;
  /** 行程类型（attraction/food/hotel/transport/shopping/tips） */
  sectionType: string;
  /** 起始纬度 */
  startLat: number;
  /** 起始经度 */
  startLng: number;
  /** 起点地址 */
  startPoint: string;
  /** 开始时间 */
  startTime: string;
  /** 购票渠道 */
  ticketChannel: string;
  /** 票价 */
  ticketPrice: number;
  /** 标题 */
  title: string;
  /** 交通方式 */
  transportMode: string;
  /** 所属行程日 ID */
  tripDayId: string;
}

interface TripDay {
  /** 创建时间 */
  createdAt: string;
  /** 日期（yyyy-MM-dd） */
  date: string;
  /** 第几天 */
  dayNumber: number;
  /** 行程日 ID */
  id: string;
  /** 当日行程项列表 */
  items: TripDayItem[];
  /** 当日标题 */
  title: string;
  /** 所属行程 ID */
  tripId: string;
}

export interface Trip {
  /** 城市列表 */
  cities: string[];
  /** 国家列表（境外游） */
  countries: string[];
  /** 封面图 */
  coverImage: string;
  /** 创建时间 */
  createdAt: string;
  /** 行程日列表 */
  days: TripDay[];
  /** 目的地编码列表 */
  destinations: string[];
  /** 收藏数 */
  favoriteCount: number;
  /** 关联攻略 ID */
  guideId: string;
  /** 行程 ID */
  id: string;
  /** 是否境外（0-国内，1-境外） */
  isOverseas: 0 | 1;
  /** 是否公开（0-私密，1-公开） */
  isPublic: 0 | 1;
  /** 点赞数 */
  likeCount: number;
  /** 成员列表 */
  members: TripMember[];
  /** 备注 */
  summary: string;
  /** 省份列表 */
  provinces: string[];
  /** 状态（1-草稿，2-已发布，3-已完成） */
  status: number;
  /** 行程标题 */
  title: string;
  /** 总预算 */
  totalBudget: number;
  /** 更新时间 */
  updatedAt: string;
  /** 用户 ID */
  userId: string;
  /** 浏览数 */
  viewCount: number;
  isLiked: boolean;
  isFavorited: boolean;
  commentCount: number;
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

/**
 * 获取我的行程列表
 * @param page 页码
 * @param pageSize 每页条数
 */
export const getMyTrips = (page: number, pageSize: number) =>
  request<{ list: Guide[]; total: number }>({
    url: '/my/trips',
    method: 'GET',
    data: { page, pageSize },
  });