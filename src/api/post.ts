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
    params: { page },
  });

/** 攻略参数 */
export interface Guide {
  /** 作者头像 */
  authorAvatar: string;
  /** 作者昵称 */
  authorName: string;
  /** 封面图 */
  coverImage: string;
  /** 创建时间 */
  createdAt: string;
  /** 目的地名称 */
  destination: string;
  /** 攻略/行程 ID */
  id: string;
  /** 是否已点赞 */
  isLiked: boolean;
  /** 是否原创（0-转载，1-原创） */
  isOriginal: number;
  /** 点赞数 */
  likeCount: number;
  /** 行程数 */
  sectionCount: number;
  /** 标题 */
  title: string;
  /** 旅行天数 */
  tripDays: number;
  /** 用户 ID */
  userId: string;
  /** 浏览数 */
  viewCount: number;
  /** 内容类型：guide(攻略) / trip(行程) */
  itemType: 'trip' | 'guide';
}

/**
 * 获取攻略列表（分页）
 * @param page         页码
 * @param pageSize     每页条数
 * @param destination  目的地筛选（可选）
 * @param keyword      关键词搜索（标题/目的地/简介，可选）
 * @param category     筛选：recommend(推荐) hot(热门) latest(最新) domestic(国内) overseas(国外)（可选）
 */
export const getGuides = (
  page: number,
  pageSize: number,
  destination?: string,
  keyword?: string,
  category?: string,
) =>
  request<{ list: Guide[]; total: number }>({
    url: '/guide/feed',
    method: 'GET',
    params: { page, pageSize, destination, keyword, category },
  });

/**
 * 发布攻略
 * @param data 攻略内容
 * @returns 创建的攻略对象
 */
export const createPost = (params: {
  content: string;
  location?: string;
  city?: string;
  tags?: string;
}) =>
  request<Post>({
    url: '/post',
    method: 'POST',
    params,
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