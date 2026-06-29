import request from './request';

/**
 * 攻略帖子
 */
export interface Post {
  id: number;
  userId: number;
  content: string;    // JSON 字符串，包含图片等
  location: string;
  city: string;
  tags: string;
  status: number;
  likeCount: number;
  shareCount: number;
  createdAt: string;
}

/**
 * 获取攻略瀑布流
 * @param page 页码
 * @returns 攻略列表
 */
export const getFeed = (page: number) =>
  request<{ list: Post[]; total: number }>({
    url: '/feed',
    method: 'GET',
    data: { page },
  });

/** 攻略参数 */
export interface Guide {
  id: string
  title: string
  coverImage: string
  summary: string
  authorName: string
  authorAvatar: string
  likeCount: number
  createdAt: string
}

/**
 * 获取攻略列表（ScrollLoadList 分页）
 * @param page 页码
 * @param pageSize 每页条数
 */
export const getGuides = (page: number, pageSize: number) =>
  request<{ list: Guide[]; total: number }>({
    url: '/guides',
    method: 'GET',
    data: { page, pageSize },
  });

/**
 * 发布攻略
 * @param data 攻略内容
 * @returns 创建的攻略对象
 */
export const createPost = (data: {
  content: string;
  location?: string;
  city?: string;
  tags?: string;
}) =>
  request<Post>({
    url: '/post',
    method: 'POST',
    data,
  });

/**
 * 获取攻略详情
 * @param id 攻略ID
 * @returns 攻略详情
 */
export const getPostDetail = (id: number) =>
  request<Post>({
    url: `/post/${id}`,
    method: 'GET',
  });