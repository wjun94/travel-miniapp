import Taro from '@tarojs/taro';
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
 * @param inviteCode 邀请码（可选，未传时自动从 URL / 启动参数读取）
 * @returns token 及用户信息
 */
export const login = (code: string, inviteCode?: string) => {
  // 未显式传入时，从当前页面 URL 参数或小程序启动参数中读取邀请码
  const urlInviteCode = inviteCode
    || (Taro.getCurrentInstance().router?.params?.inviteCode as string)
    || (Taro.getEnterOptionsSync()?.query?.inviteCode as string);
  const params: { code: string; inviteCode?: string } = { code };
  if (urlInviteCode) params.inviteCode = urlInviteCode;
  return request<LoginResponse>({
    url: '/user/login',
    method: 'POST',
    params,
  });
};

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
export const updateProfile = (params: { nickname?: string; avatarUrl?: string }) =>
  request({
    url: '/user/profile',
    method: 'PUT',
    params,
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

/**
 * 绑定微信手机号
 * @param code 小程序 button open-type="getPhoneNumber" 拿到的授权code
 * @returns 接口返回，包含脱敏手机号
 */
export const bindWxPhone = (code: string) => {
  return request<{ phone: string; }>({
    url: '/bind/phone',
    method: 'POST',
    params: { code },
  });
};