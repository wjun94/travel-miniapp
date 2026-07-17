import request, { PageResult } from './request';

// --- 类型定义 (Types) ---

/**
 * 用户个人信息响应数据
 */
export interface ProfileData {
    avatarUrl: string;
    followCount: number;
    followerCount: number;
    guideCount: number;
    id: string;
    isFollowed: boolean;
    isSelf: boolean;
    nickname: string;
    totalFavs: number;
    totalLikes: number;
    tripCount: number;
}

/**
 * Feed流列表中的单项内容
 */
export interface FeedItem {
    authorAvatar: string;
    authorName: string;
    coverImage: string;
    createdAt: string;
    destinations: string[];
    id: string;
    isLiked: boolean;
    itemType: string;
    likeCount: number;
    sectionCount: number;
    summary: string;
    title: string;
    tripDays: number;
    userId: string;
    viewCount: number;
}

/**
 * Feed流列表数据容器
 */
export interface FeedListData {
    list: FeedItem[];
    total: number;
}

/**
 * 收藏列表中的单项内容 (基于截图3)
 */
export interface FavoriteItem {
    coverImage: string;   // 封面图
    createdAt: string;    // 创建时间
    id: string;           // 收藏ID
    targetId: string;     // 目标对象ID (攻略或行程ID)
    targetType: string;   // 目标类型 (guide/trip)
    title: string;        // 标题
    userId: string;       // 用户ID
}

/**
 * 收藏列表数据容器
 */
export interface FavoriteListData {
    list: FavoriteItem[];
    total: number;
}

// --- 请求参数定义 (Params) ---

/**
 * 获取Feed流的请求参数
 */
export interface GetFeedParams {
    id: string;
    page?: number;
    pageSize?: number;
}

/**
 * 获取收藏列表的请求参数
 */
export interface GetFavoritesParams {
    id: string;             // 用户ID (路径参数)
    target_type: string;    // 收藏类型 (query参数): 'guide' | 'trip'
    page?: number;          // 页码
    pageSize?: number;      // 每页数量
}


// --- API 接口函数 (API Functions) ---

/**
 * 获取他人个人主页信息
 * @param id 用户ID
 */
export const getProfile = (id: string) =>
    request<ProfileData>({
        url: `/profile/${id}`,
        method: 'GET'
    });

/**
 * 获取他人的公开内容流 (Feed)
 * @param params.id 用户ID
 * @param params.page 页码
 * @param params.pageSize 每页数量
 */
export const getUserFeed = ({ id, page = 1, pageSize = 10 }: GetFeedParams) =>
    request<PageResult<FeedListData>>({
        url: `/profile/${id}/feed`,
        method: 'GET',
        data: {
            page,
            pageSize
        }
    });

/**
 * 获取他人的收藏列表
 * @description GET /profile/{id}/favorites
 * @param params.id 用户ID
 * @param params.target_type 收藏类型 (例如: "guide" 或 "trip")
 * @param params.page 页码
 * @param params.pageSize 每页数量
 */
export const getUserFavorites = ({
    id,
    target_type,
    page = 1,
    pageSize = 10
}: GetFavoritesParams) =>
    request<PageResult<FavoriteListData>>({
        url: `/profile/${id}/favorites`,
        method: 'GET',
        data: {
            target_type,
            page,
            pageSize
        }
    });