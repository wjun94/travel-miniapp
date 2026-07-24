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
  request<USER.Info>({
    url: '/user/info',
    method: 'GET',
    showLoading: false,
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

/**
* 个人主页信息返回类型
*/
export interface UserProfile {
  id: string;
  avatarUrl: string;
  nickname: string;
  followCount: number;  // 关注数
  followerCount: number;  // 粉丝数
  partnerCount: number;  // 搭子数
  guideCount: number;  // 已发布的攻略数
  tripCount: number;  // 行程数
}

/**
 * 获取我的个人主页数据
 * @returns 个人主页详细数据
 */
export const getProfile = () =>
  request<UserProfile>({
    url: '/profile',
    method: 'GET',
  });