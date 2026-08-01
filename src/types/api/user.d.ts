declare namespace USER {
  export interface Info {
    /** 用户 ID */
    id: string;
    /** 微信 OpenID */
    openid: string;
    /** 微信 UnionID（未绑定为空字符串） */
    unionid?: string;
    /** 昵称 */
    nickname: string;
    /** 头像地址 */
    avatarUrl: string;
    /** 角色（0-普通用户） */
    role: number;
    /** 邀请码 */
    inviteCode: string;
    /** 关注数 */
    followCount: number;
    /** 粉丝数 */
    followerCount: number;
    /** 创建时间 */
    createdAt: string;
  }
}
