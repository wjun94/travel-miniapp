import request from './request';

/**
 * 微信登录接口返回类型
 */
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    nickname: string;
    avatarUrl: string;
    role: number;
  };
}

/**
 * 微信登录
 * @param code 微信临时登录凭证
 * @returns token 及用户信息
 */
export const login = (code: string) =>
  request<LoginResponse>({
    url: '/user/login',
    method: 'POST',
    data: { code },
  });

/**
 * 获取当前用户详细信息
 * @returns 用户信息
 */
export const getUserInfo = () =>
  request<LoginResponse['user']>({
    url: '/user/info',
    method: 'GET',
  });

/**
 * 更新用户个人资料
 * @param data 可更新昵称和头像
 * @returns void
 */
export const updateProfile = (data: { nickname?: string; avatarUrl?: string }) =>
  request({
    url: '/user/profile',
    method: 'PUT',
    data,
  });