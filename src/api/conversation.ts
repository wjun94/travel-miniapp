import request, { PageResult } from './request';

/**
 * 群聊（搭子群聊）
 */

/** 统一会话列表项（系统消息/私聊/群聊） */
export interface ConversationItem {
  id: string; // 会话ID：私聊=对方用户ID，群聊=群聊ID，系统=system
  type: 'system' | 'user' | 'group'; // 会话类型
  name: string; // 显示名：昵称/群名/系统消息
  avatarUrl: string; // 头像（私聊）
  partnerId: string; // 群聊关联搭子ID
  memberCount: number; // 群聊成员数
  lastContent: string; // 最后一条消息内容
  lastTime: string; // 最后消息时间
  unreadCount: number; // 未读数
}

/** 群成员 */
export interface ConversationMember {
  userId: string; // 成员用户ID
  nickname: string; // 昵称
  avatarUrl: string; // 头像
  joinedAt: string; // 加入时间
}

/** 群聊详情 */
export interface ConversationDetail {
  id: string;
  partnerId: string;
  name: string;
  ownerId: string;
  isOwner: boolean; // 当前用户是否群主
  isMember: boolean; // 当前用户是否群成员
  members: ConversationMember[];
}

/** 群聊消息 */
export interface GroupMessage {
  id: string;
  conversationId: string;
  fromUserId: string; // 发送者ID
  nickname: string; // 发送者昵称
  avatarUrl: string; // 发送者头像
  content: string; // 消息内容
  createdAt: string; // 发送时间
}

/** 获取统一会话列表（系统消息+私聊+群聊，按最后消息时间倒序） */
export const getMyConversations = () =>
  request<ConversationItem[]>({
    url: '/conversation/list',
    method: 'GET',
  });

/** 清空系统消息 */
export const clearSystemMessages = () =>
  request({
    url: '/notification/system',
    method: 'DELETE',
  });

/** 群聊详情（群信息 + 成员列表） */
export const getConversationDetail = (id: string) =>
  request<ConversationDetail>({
    url: `/conversation/${id}`,
    method: 'GET',
  });

/** 群聊消息列表（分页，时间正序） */
export const getGroupMessages = (id: string, page: number = 1, pageSize: number = 50) =>
  request<PageResult<GroupMessage>>({
    url: `/conversation/${id}/messages`,
    method: 'GET',
    params: { page, pageSize },
  });

/** 发送群聊消息 */
export const sendGroupMessage = (id: string, content: string) =>
  request({
    url: `/conversation/${id}/message`,
    method: 'POST',
    params: { content },
  });

/** 解散群聊（仅群主，解散后成员不可再进入/发言） */
export const dissolveConversation = (id: string) =>
  request({
    url: `/conversation/${id}`,
    method: 'DELETE',
  });

/** 踢出群成员（仅群主可操作） */
export const kickConversationMember = (id: string, userId: string) =>
  request({
    url: `/conversation/${id}/kick`,
    method: 'PUT',
    params: { userId },
  });
