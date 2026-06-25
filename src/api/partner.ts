import request from './request';

/** 搭子 */
export interface Partner {
  id: number;
  userId: number;
  type: number;
  destination: string;
  startDate: string;
  days: number;
  requirement: string;
  maxMembers: number;
  currentMembers: number;
  price: number;
  status: number; // 0招募中 1满员 2取消
  createdAt: string;
}

/** 搭子申请 */
export interface PartnerApplication {
  id: number;
  partnerId: number;
  applicantId: number;
  message: string;
  status: number; // 0待审核 1同意 2拒绝
}

/**
 * 获取搭子列表
 * @param page 页码
 * @returns 搭子列表
 */
export const getPartnerList = (page: number) =>
  request<{ list: Partner[]; total: number }>({
    url: '/partner/list',
    method: 'GET',
    data: { page },
  });

/**
 * 发布搭子
 * @param data 搭子信息
 * @returns 创建的搭子
 */
export const createPartner = (data: {
  destination: string;
  startDate: string;
  days: number;
  requirement?: string;
  maxMembers: number;
}) =>
  request<Partner>({
    url: '/partner',
    method: 'POST',
    data,
  });

/**
 * 申请加入搭子
 * @param partnerId 搭子ID
 * @param message 申请留言
 * @returns void
 */
export const applyPartner = (partnerId: number, message: string) =>
  request({
    url: `/partner/${partnerId}/apply`,
    method: 'POST',
    data: { message },
  });

/**
 * 处理搭子申请（同意/拒绝）
 * @param partnerId 搭子ID
 * @param applicationId 申请ID
 * @param status 1同意 2拒绝
 * @returns void
 */
export const handleApplication = (partnerId: number, applicationId: number, status: number) =>
  request({
    url: `/partner/${partnerId}/application`,
    method: 'PUT',
    data: { application_id: applicationId, status },
  });