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
  otherUserId: string;    // 对方用户ID (注意：文档中为string类型)
  unreadCount: number;    // 未读消息数
}

// 新增：通知单条项类型
export interface NotificationItem {
  content: string;
  createdAt: string;
  id: string;
  isRead: number;
  relatedId: string;
  type: number;
  userId: string;
}

/**
 * 获取通知列表
 * @param type 通知类型：0全部 1搭子申请 2点赞 3新增关注 4系统通知
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
    data: params,
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
    data: { targetUserId: targetUserId },
  });

/**
 * 发送私聊消息
 * @param toUserId 接收者ID
 * @param content 消息内容
 * @returns void
 */
export const sendMessage = (toUserId: number, content: string) =>
  request({
    url: '/message/send',
    method: 'POST',
    data: { targetUserId: toUserId, content },
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
  }>({
    url: '/notification/unread',
    method: 'GET',
  });

/**
 * 标记指定通知为已读
 * @param id 通知ID (路径参数)
 * @returns 操作结果
 */
export const markNotificationAsRead = (id: string) =>
  request<string>({
    url: `/notification/read/${id}`,
    method: 'PUT',
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