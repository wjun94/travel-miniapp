import request, { PageResult } from './request';

/** 单条评论/回复的核心数据结构 */
export interface CommentItem {
    /** 评论者头像 URL */
    avatarUrl: string;
    /** 评论内容 */
    content: string;
    /** 创建时间 */
    createdAt: string;
    /** 回复数 */
    replyCount: number
    /** 评论 ID */
    id: string;
    /** 点赞数 */
    likeCount: number;
    /** 评论者昵称 */
    nickname: string;
    /** 父评论 ID（如果是回复则有值，根评论为空） */
    parentId: string;
    /** 目标 ID */
    targetId: string;
    /** 目标类型 (guide/trip) */
    targetType: string;
    /** 用户 ID */
    userId: string;
    /** 被回复人昵称（仅回复列表有效） */
    replyToNickname: string;
    /** 是否是作者 */
    isAuthor: boolean;
}

// 1. 获取评论列表参数
export interface GetCommentsParams {
    /** 目标类型 (guide/trip) */
    target_type: 'guide' | 'trip' | string;
    /** 目标ID */
    target_id: string;
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
}

// 5. 发表评论参数
export interface CreateCommentBody {
    /** 评论内容 */
    content: string;
    /** 父评论ID (如果是回复某条评论则传，首层评论不传或传空) */
    parentId?: string;
    /** 目标ID */
    targetId: string;
    /** 目标类型 (guide/trip) */
    targetType: string;
}


// ==========================================
// 评论相关接口 API 请求
// ==========================================

/**
 * 1. 获取评论列表
 * @param params 查询参数 (target_type, target_id, page, pageSize)
 */
export const getComments = (params: GetCommentsParams) =>
    request<PageResult<CommentItem>>({
        url: '/comments',
        method: 'GET',
        data: params // GET 请求通常使用 params 传参，若底层的 request 支持 data 自动转换也可保持原样
    });

/**
 * 2. 点赞评论
 * @param id 评论ID (路径参数)
 */
export const likeComment = (id: string) =>
    request<string>({
        url: `/comment/${id}/like`,
        method: 'POST'
    });

/**
 * 3. 删除评论
 * @param id 评论ID (路径参数)
 */
export const deleteComment = (id: string) =>
    request<string>({
        url: `/comment/${id}`,
        method: 'DELETE'
    });

/**
 * 4. 获取子回复列表
 * @param params 查询参数 (parent_id)
 */
export const getCommentReplies = (params: { parent_id: string }) =>
    request<CommentItem[]>({
        url: '/comment/replies',
        method: 'GET',
        data: params
    });

/**
 * 5. 发表评论
 * @param data 评论表单内容
 */
export const createComment = (data: CreateCommentBody) =>
    request<string>({
        url: '/comment',
        method: 'POST',
        data
    });