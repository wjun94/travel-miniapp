import request from './request';

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