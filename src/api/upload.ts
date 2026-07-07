import request from './request';

/**
 * 邀请好友协作编辑
 * @param id 行程ID
 * @returns 邀请链接等信息
 */
export const deleteImage = (url: string) =>
    request<null>({
        url: `/image/delete`,
        method: 'DELETE',
        data: { url }
    });