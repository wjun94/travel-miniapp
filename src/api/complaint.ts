import request from './request';

/** 投诉条目 */
export interface ComplaintItem {
  id: string;
  userId: string;
  targetType: string; // user用户/guide攻略/trip行程/partner搭子/comment评论/other其他
  targetId: string;
  reason: string; // 投诉原因
  content: string; // 详细描述
  images: string[]; // 图片URL
  status: number; // 0待处理 1已处理 2已驳回
  handleNote: string; // 处理备注
  reply: string; // 后台回复
  handledAt?: string; // 处理时间
  createdAt: string; // 提交时间
}

/** 投诉对象类型名称 */
export const COMPLAINT_TARGET_NAMES: Record<string, string> = {
  user: '用户',
  guide: '攻略',
  trip: '行程',
  partner: '搭子',
  comment: '评论',
  other: '其他',
};

/** 投诉状态名称 */
export const COMPLAINT_STATUS_NAMES = ['待处理', '已处理', '已驳回'];

/**
 * 提交投诉
 * @param params targetType: user用户/guide攻略/trip行程/partner搭子/comment评论/other其他
 */
export const submitComplaint = (params: {
  targetType: string;
  targetId?: string; // 被投诉对象ID（other 时可不填）
  reason: string; // 投诉原因
  content: string; // 详细描述（5-500字）
  images?: string[]; // 图片URL（最多9张）
}) =>
  request<{ id: string }>({
    url: '/complaint',
    method: 'POST',
    params,
  });

/** 我的投诉列表（分页） */
export const getComplaintList = (params?: { page?: number; pageSize?: number }) =>
  request<{ list: ComplaintItem[]; total: number }>({
    url: '/complaint/list',
    method: 'GET',
    params,
  });

/** 我的投诉详情 */
export const getComplaintDetail = (id: string) =>
  request<ComplaintItem>({
    url: `/complaint/${id}`,
    method: 'GET',
  });
