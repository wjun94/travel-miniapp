import request from './request';

// ==========================================
// 1. 类型定义 (Interfaces)
// ==========================================

/**
 * 备忘清单项
 */
export interface ChecklistItem {
  id: string;
  checklistId: string;
  text: string;
  checked: number; // 0未勾选 1已勾选
}

/**
 * 备忘清单
 */
export interface Checklist {
  id: string;
  userId: string;
  name: string;
  isTemplate: number; // 0 或 1
  tripId?: string;
  items: ChecklistItem[];
  createdAt: string;
}

/**
 * 系统预置分类的子项
 */
export interface CategoryItem {
  id: string;
  categoryId: string;
  text: string;
}

/**
 * 系统预置分类
 */
export interface ChecklistCategory {
  id: string;
  name: string;
  sortOrder: number;
  type: number;
  createdAt: string;
  items: CategoryItem[];
}

/**
 * 统一的后端返回包裹格式（包含 code, data, msg）
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

// ==========================================
// 2. 接口请求函数 (API Functions)
// ==========================================

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
 * 创建备忘清单 (对应图1: POST /checklist)
 * @param data 完整的清单创建信息
 * @returns 创建成功的清单对象
 */
export const createChecklist = (data: Partial<Checklist>) =>
  request<Checklist>({
    url: '/checklist',
    method: 'POST',
    data,
  });

/**
 * 获取系统预置分类 (对应图2: GET /checklist/categories)
 * @returns 分类列表
 */
export const getChecklistCategories = () =>
  request<ChecklistCategory[]>({
    url: '/checklist/categories',
    method: 'GET',
  });

/**
 * 更新清单项的勾选状态 (对应图3: PUT /checklist/{id}/item)
 * @param itemId 清单条目ID (根据图3修改为 string 类型)
 * @param checked 是否勾选 (0未勾选，1已勾选)
 */
export const updateChecklistItem = (itemId: string, checked: number) =>
  request<ApiResponse<string>>({
    url: `/checklist/${itemId}/item`,
    method: 'PUT',
    data: { checked },
  });

/**
 * 删除备忘清单
 * @param id 清单ID
 * @returns void
 */
export const deleteChecklist = (id: string) =>
  request({
    url: `/checklist/${id}`,
    method: 'DELETE',
  });