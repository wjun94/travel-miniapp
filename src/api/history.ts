import request from './request';

// ==========================================
// 1. 类型定义 (Interfaces)
// ==========================================

/**
 * 历史记录项 (根据 GET /browse/history 响应体结构完善)
 */
export interface HistoryRecord {
    id: string;
    coverImage: string;
    userId: string;
    /** 对应图片中的 targetType，如 guide, trip 等 */
    targetType: string;
    /** 对应图片中的 targetId */
    targetId: string;
    /** 对应图片中的 title */
    title: string;
    createdAt: string;
}

/**
 * 创建历史记录请求体 (根据 POST /browse/history 接口 body 完善)
 */
export interface CreateHistoryRequest {
    coverImage: string;
    targetId: string;
    targetType: string;
    title: string;
}

// ==========================================
// 2. 接口请求函数 (API Functions)
// ==========================================

/**
 * 获取历史记录历史 (对应 GET /browse/history)
 * @param params 查询参数（page, pageSize）
 */
export const getHistoryList = (params) =>
    request<{ list: HistoryRecord[]; total: number }>({
        url: '/browse/history',
        method: 'GET',
        params: params,
    });

/**
 * 添加浏览记录 (对应 POST /browse/history)
 * @param data 浏览记录信息
 */
export const createHistoryRecord = (params: CreateHistoryRequest) =>
    request<HistoryRecord>({
        url: '/browse/history',
        method: 'POST',
        params,
    });

/**
 * 删除单条浏览记录 (对应 DELETE /browse/history/{id})
 * @param id 记录ID
 */
export const deleteHistoryRecord = (id: string) =>
    request({
        url: `/browse/history/${id}`,
        method: 'DELETE',
    });

/**
 * 清空浏览记录 (对应 DELETE /browse/history/clear)
 */
export const clearAllHistory = () =>
    request({
        url: '/browse/history/clear',
        method: 'DELETE',
    });