import request from './request';

/** 行程节点 */
export interface PlanItem {
  time: string;
  name: string;
  type: 'attraction' | 'restaurant';
  duration: string;
  note?: string;
}

/** 每日计划 */
export interface DailyPlan {
  day: number;
  items: PlanItem[];
}

/** 行程 */
export interface Trip {
  id: number;
  userId: number;
  title: string;
  destination: string;
  days: number;
  startDate?: string;
  dailyPlans: DailyPlan[];
  weatherData?: any;
  status: number;
  collaborators?: { userId: number; permission: number }[];
  version: number;
  createdAt: string;
}

/**
 * 创建手动行程
 * @param data 行程基本信息
 * @returns 行程对象
 */
export const createTrip = (data: Partial<Trip>) =>
  request<Trip>({
    url: '/trip',
    method: 'POST',
    data,
  });

/**
 * AI 生成行程
 * @param params 目的地、天数、偏好标签
 * @returns AI 生成的行程
 */
export const generateTrip = (params: {
  destination: string;
  days: number;
  tags: string[];
}) =>
  request<Trip>({
    url: '/trip/ai-generate',
    method: 'POST',
    data: params,
  });

/**
 * 获取行程详情
 * @param id 行程ID
 * @returns 行程详情
 */
export const getTripDetail = (id: number) =>
  request<Trip>({
    url: `/trip/${id}`,
    method: 'GET',
  });

/**
 * 更新行程（协同编辑）
 * @param id 行程ID
 * @param data 更新数据
 * @returns 更新后的行程
 */
export const updateTrip = (id: number, data: { dailyPlans?: DailyPlan[] }) =>
  request<Trip>({
    url: `/trip/${id}`,
    method: 'PUT',
    data,
  });

/**
 * 邀请好友协作编辑
 * @param id 行程ID
 * @returns 邀请链接等信息
 */
export const inviteCollaborator = (id: number) =>
  request<{ inviteUrl: string }>({
    url: `/trip/${id}/invite`,
    method: 'POST',
  });