import request, { PageResult } from './request';

/**
 * 消息
 */
export interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  type: number; // 1私聊 2系统通知
  isRead: number;
  avatarUrl: string
  createdAt: string;
}

/**
 * 会话信息 (新增)
 */
export interface Conversation {
  avatarUrl: string;      // 对方头像
  lastContent: string;    // 最后一条消息内容
  lastTime: string;       // 最后消息时间
  nickname: string;       // 对方昵称
  userId: string;    // 对方用户ID (注意：文档中为string类型)
  unreadCount: number;    // 未读消息数
}

// 新增：通知单条项类型
export interface NotificationItem {
  /** 评论/回复内容（评论通知时展示） */
  commentContent: string;
  /** 通知正文 */
  content: string;
  /** 通知创建时间 */
  createdAt: string;
  /** 处理状态：0待审核 1通过 2拒绝 3主动退出 */
  status: number;
  /** 发送方（触发通知的用户）信息 */
  fromUser: {
    /** 发送方头像 */
    avatarUrl: string;
    /** 发送方用户ID */
    id: string;
    /** 发送方昵称 */
    nickname: string;
  };
  /** 发送方用户ID */
  fromUserId: string;
  /** 申请备注（搭子申请时的留言） */
  remark: string;
  /** 拒绝原因 */
  reason: string;
  /** 通知ID */
  id: string;
  /** 已读状态：0未读 1已读 */
  isRead: number;
  /** 关联ID（如搭子申请记录ID） */
  relatedId: string;
  /** 目标ID（如搭子ID、攻略ID、行程ID） */
  targetId: string
  /** 目标类型：guide攻略 trip行程 partner搭子 follow关注 */
  targetType: string
  /** 通知类型：1搭子申请 2点赞 3新增关注 4系统通知 5评论 */
  type: number;
  /** 接收方（当前用户）ID */
  userId: string;
}

/**
 * 获取通知列表
 * @param type 通知类型：0全部 1搭子申请 2点赞 3新增关注 4系统通知 5评论
 * @param page 页码
 * @param pageSize 每页条数
 * @returns 分页通知列表
 */
export const getNotificationList = (params: {
  type?: number;
  page: number;
  pageSize: number;
}) =>
  request<PageResult<NotificationItem>>({
    url: '/notification/list',
    method: 'GET',
    params: params,
  });

/**
 * 获取与某用户的聊天记录
 * @param targetUserId 对方用户ID
 * @returns 消息列表
 */
export const getMessageList = (targetUserId: number) =>
  request<Message[]>({
    url: '/message/list',
    method: 'GET',
    params: { targetUserId: targetUserId },
  });

/**
 * 发送私聊消息
 * @param toUserId 接收者ID
 * @param content 消息内容
 * @returns void
 */
export const sendMessage = (toUserId: string, content: string) =>
  request({
    url: '/message/send',
    method: 'POST',
    params: { toUserId, content },
  });

/**
 * 获取未读通知数量
 * @description 获取各类别（关注、点赞、合作申请、系统通知）的未读消息统计
 * @returns 包含各类型未读计数的对象
 */
export const getUnreadNotificationCount = () =>
  request<{
    followCount: number;
    likeCount: number;
    partnerApplyCount: number;
    systemNotifyCount: number;
    commentCount: number
  }>({
    url: '/notification/unread',
    method: 'GET',
  });

/**
 * 标记通知已读/未读
 * @param id 通知ID（路径参数）
 * @param isRead 0未读、1已读，默认1（query传参）
 */
export const markNotificationRead = (id: string, isRead: number = 1) =>
  request<string>({
    url: `/notification/read/${id}`,
    method: 'PUT',
    params: { isRead }
  });

/**
 * 将所有通知标记为已读
 * @description 一键清空所有未读消息状态
 * @returns 操作结果
 */
export const markAllNotificationsAsRead = () =>
  request<string>({
    url: '/notification/read-all',
    method: 'PUT',
  });

/**
 * 获取会话列表 (新增)
 * @description 获取当前用户的所有聊天会话，按最后消息时间排序
 * @returns 会话列表数据
 */
export const getConversationList = () =>
  request<Conversation[]>({
    url: '/message/conversations',
    method: 'GET',
  });

/**
* PUT /api/v1/notification/type-read 按通知类型批量标记已读
* @param type query必填，通知类型：1搭子申请 2点赞 3新增关注 4系统通知 5评论
* @returns CommonRes 通用响应
*/
export const markNotificationTypeAllRead = (type: number) =>
  request<string>({
    url: '/notification/type-read',
    method: 'PUT',
    params: { type }
  });