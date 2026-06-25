import request from './request';

/**
 * 备忘清单项
 */
export interface ChecklistItem {
  id: number;
  checklistId: number;
  text: string;
  checked: number; // 0未勾选 1已勾选
}

/**
 * 备忘清单
 */
export interface Checklist {
  id: number;
  userId: number;
  name: string;
  isTemplate: number;
  tripId?: number;
  items: ChecklistItem[];
  createdAt: string;
}

/**
 * 获取用户的所有备忘清单
 * @returns 清单列表
 */
export const getChecklists = () =>
  request<Checklist[]>({
    url: '/checklist',
    method: 'GET',
  });

/**
 * 创建备忘清单
 * @param data 清单名称、关联行程等
 * @returns 创建的清单
 */
export const createChecklist = (data: { name: string; tripId?: number }) =>
  request<Checklist>({
    url: '/checklist',
    method: 'POST',
    data,
  });

/**
 * 更新清单项的勾选状态
 * @param itemId 清单项ID
 * @param checked 是否勾选
 * @returns void
 */
export const updateChecklistItem = (itemId: number, checked: number) =>
  request({
    url: `/checklist/${itemId}/item`,
    method: 'PUT',
    data: { checked },
  });