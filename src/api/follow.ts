import request, { PageResult } from './request';

/**
 * 通用分页请求参数
 */
export interface PageParams {
    page: number;
    pageSize: number;
}

/**
 * 用户黑名单/粉丝/关注列表项数据结构
 */
export interface UserFollowInfo {
    avatarUrl: string;
    nickname: string;
    userId: string;
    isFollow?: boolean;  // 部分列表包含是否关注
    isMutual?: boolean;  // 部分列表包含是否互关
}

/**
 * 获取我的黑名单
 */
export const getBlacklist = (params: PageParams) =>
    request<PageResult<UserFollowInfo>>({
        url: '/follow/blacklist',
        method: 'GET',
        params,
    });

/**
 * 拉黑用户
 * @param id 被拉黑用户ID
 */
export const blockUser = (id: string | number) =>
    request<string>({
        url: `/follow/block/${id}`,
        method: 'POST',
    });

/**
 * 解除拉黑
 * @param id 被拉黑用户ID
 */
export const unblockUser = (id: string | number) =>
    request<string>({
        url: `/follow/block/${id}`,
        method: 'DELETE',
    });

/**
 * 校验是否被对方拉黑
 * @param id 目标用户ID
 */
export const checkIsBlocked = (id: string | number) =>
    request<string>({
        url: `/follow/blocked/${id}`,
        method: 'GET',
    });

/**
 * 获取我的关注/粉丝总数
 */
export const getMyFollowCounts = () =>
    request<string>({
        url: '/follow/counts',
        method: 'GET',
    });

/**
 * 获取他人的关注/粉丝总数
 * @param id 用户ID
 */
export const getUserFollowCounts = (id: string | number) =>
    request<string>({
        url: `/follow/counts/${id}`,
        method: 'GET',
    });

/**
 * 获取我的粉丝列表
 */
export const getMyFollowers = (params: PageParams) =>
    request<PageResult<UserFollowInfo>>({
        url: '/follow/followers',
        method: 'GET',
        params,
    });

/**
 * 获取他人的粉丝列表
 * @param id 用户ID
 */
export const getUserFollowers = (id: string | number, params: PageParams) =>
    request<PageResult<UserFollowInfo>>({
        url: `/follow/followers/${id}`,
        method: 'GET',
        params,
    });

/**
 * 移除粉丝
 * @param id 粉丝用户ID
 */
export const removeFollower = (id: string | number) =>
    request<string>({
        url: `/follow/followers/${id}`,
        method: 'DELETE',
    });

/**
 * 获取我的关注列表
 */
export const getMyFollowing = (params: PageParams) =>
    request<PageResult<UserFollowInfo>>({
        url: '/follow/following',
        method: 'GET',
        params,
    });

/* ==================== 以下为本次新增图片接口 ==================== */

/**
 * 获取他人的关注列表
 * @param id 用户ID
 */
export const getUserFollowing = (id: string | number, params: PageParams) =>
    request<PageResult<UserFollowInfo>>({
        url: `/follow/following/${id}`,
        method: 'GET',
        params,
    });

/**
 * 获取与指定用户的关系状态
 * @param id 目标用户ID
 */
export const getFollowStatus = (id: string | number) =>
    request<string>({
        url: `/follow/status/${id}`,
        method: 'GET',
    });

/**
 * 关注用户
 * @param id 被关注者ID
 */
export const followUser = (id: string | number) =>
    request<string>({
        url: `/follow/${id}`,
        method: 'POST',
    });

/**
 * 取消关注
 * @param id 被关注者ID
 */
export const unfollowUser = (id: string | number) =>
    request<string>({
        url: `/follow/${id}`,
        method: 'DELETE',
    });