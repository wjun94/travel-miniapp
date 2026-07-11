import request from './request';

/**
 * 收藏项
 */
export interface FavoriteItem {
    id: string;
    targetId: string;
    targetType: string;
    title?: string;
    coverImage?: string;
    createdAt: string;
}

/**
 * 取消收藏
 * @param id 收藏目标ID
 * @param target_type 收藏类型 (guide/trip)
 */
export const deleteFavorite = (id: string, targetType: string) => {
    return request<string>({
        url: `/favorite/remove`,
        method: 'POST',
        data: { targetType, id },
    });
};

/**
 * 添加收藏参数
 */
export interface AddFavoriteParams {
    targetId: string;
    targetType: string;
}

/**
 * 添加收藏
 * @param data 收藏信息
 */
export const addFavorite = (data: AddFavoriteParams) => {
    return request<string>({
        url: '/favorite',
        method: 'POST',
        data,
    });
};

/**
 * 获取收藏列表
 * @param params 查询参数 (target_type, page, pageSize)
 */
export interface GetFavoritesParams {
    target_type?: string;
    page?: number;
    pageSize?: number;
}

export const getFavorites = (params: GetFavoritesParams) => {
    return request<{ list: FavoriteItem[]; total: number }>({
        url: '/favorites',
        method: 'GET',
        data: params,
    });
};