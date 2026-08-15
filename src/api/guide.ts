import request from './request';
import type { Guide } from './post'

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

// 攻略详情接口返回data结构
export interface TravelGuideDetailData {
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
  recommendedDays: number;
  status: number;
  summary: string;
  tags: string;
  title: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isFavorited?: boolean;
  favoriteCount?: number;
  commentCount?: number;
  likeCount?: number;
  isSelf: boolean
  isFollowed: boolean
  authorName: string
  authorAvatar: string
  days: TripDay[];
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
export const createTravelGuide = (params: CreateTravelGuideParams) => {
  return request<ApiResponse<null>>({
    url: '/guide',
    method: 'POST',
    params,
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

/**
 * 获取我的攻略列表
 * @param page 页码
 * @param pageSize 每页条数
 * @param status 状态筛选（0草稿 1已发布，-1或不传为全部）
 */
export const getMyGuides = (page: number, pageSize: number, status?: number) =>
  request<{ list: Guide[]; total: number }>({
    url: '/my/guides',
    method: 'GET',
    // 仅当 status 为数字时才携带，避免 ScrollLoadList 传入的 params 对象被误当 status 参数
    params: { page, pageSize, ...(typeof status === 'number' ? { status } : {}) },
  });

/** 我的全部笔记合并项（攻略/行程/搭子） */
export interface MyNoteItem {
  id: string
  itemType: 'guide' | 'trip' | 'partner'
  title: string
  coverImage: string
  destinations: string[]
  viewCount: number
  tripDays: number
  sectionCount: number
  createdAt: string
}

/**
 * 获取我的全部笔记（攻略+行程+搭子，合并按时间倒序）
 * @param page 页码
 * @param pageSize 每页条数
 */
export const getMyNotes = (page: number, pageSize: number) =>
  request<{ list: MyNoteItem[]; total: number }>({
    url: '/my/notes',
    method: 'GET',
    params: { page, pageSize },
  });

/**
 * 更新攻略（编辑草稿/已发布，支持全量替换每日行程）
 * @param id 攻略ID
 * @param params 更新数据
 */
export const updateTravelGuide = (id: string, params: Partial<CreateTravelGuideParams>) =>
  request<null>({
    url: `/guide/${id}`,
    method: 'PUT',
    params,
  });

/**
 * 删除攻略（仅作者）
 * @param id 攻略ID
 */
export const deleteTravelGuide = (id: string) =>
  request<null>({
    url: `/guide/${id}`,
    method: 'DELETE',
  });