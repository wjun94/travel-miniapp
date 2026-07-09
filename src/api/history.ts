import request from './request';

// ==========================================
// 1. 类型定义 (Interfaces)
// ==========================================

/**
 * 历史记录项
 */
export interface HistoryRecord {
    id: string;
    coverImage: string;
    userId: string;
    /** 操作类型：view（浏览）| edit（编辑）| create（创建）| delete（删除） */
    action: string;
    /** 关联业务类型：guide（攻略）| trip（行程）| checklist（清单）等 */
    bizType: string;
    /** 关联业务ID */
    bizId: string;
    /** 关联业务标题/名称 */
    bizName: string;
    createdAt: string;
}

/**
 * 获取历史记录列表的查询参数
 */
export interface HistoryListParams {
    pageNo?: number;
    pageSize?: number;
    bizType?: string;
    action?: string;
}

/**
 * 分页响应
 */
export interface PageResult<T> {
    list: T[];
    total: number;
    pageNo: number;
    pageSize: number;
}

/**
 * 创建历史记录请求体
 */
export interface CreateHistoryRequest {
    action: string;
    bizType: string;
    bizId: string;
    bizName: string;
}

// ==========================================
// 2. 接口请求函数 (API Functions)
// ==========================================

/**
 * 获取历史记录列表
 * @param params 查询参数（分页+筛选）
 * @returns 分页后的历史记录列表
 */
export const getHistoryList = (params?: HistoryListParams) =>
    request<PageResult<HistoryRecord>>({
        url: '/browse/history',
        method: 'GET',
        data: params,
    });

/**
 * 创建历史记录
 * @param data 历史记录信息
 * @returns 创建成功的记录
 */
export const createHistoryRecord = (data: CreateHistoryRequest) =>
    request<HistoryRecord>({
        url: '/browse/history',
        method: 'POST',
        data,
    });

/**
 * 删除单条历史记录
 * @param id 记录ID
 */
export const deleteHistoryRecord = (id: string) =>
    request({
        url: `/browse/history/${id}`,
        method: 'DELETE',
    });

/**
 * 清空当前用户的所有历史记录
 */
export const clearAllHistory = () =>
    request({
        url: '/browse/history/clear',
        method: 'DELETE',
    });
