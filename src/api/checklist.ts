import request, { PageResult } from './request';

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
  tripId?: string; // 关联行程（兼容旧字段，等同 targetType=trip）
  targetType?: string; // 关联类型：trip行程 guide攻略 partner搭子（空=无关联）
  targetId?: string; // 关联目标ID
  targetName?: string; // 关联名称（行程/攻略/搭子标题，查询时返回）
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
 * 更新备忘清单的请求体 (对应图1: PUT /checklist/{id})
 */
export interface UpdateChecklistRequest {
  name: string;
  /** 关联类型：trip行程 guide攻略 partner搭子（不传=不修改，传空串=取消关联） */
  targetType?: string;
  targetId?: string;
  items: Array<{
    id: string;
    checklistId: string;
    text: string;
    checked: number; // 0未勾选 1已勾选
  }>;
}

/**
 * 获取清单详情的响应数据内部的 data 结构 (对应图2: GET /checklist/{id})
 */
export interface ChecklistDetail {
  id: string;
  userId: string;
  tripId: string;
  targetType?: string; // 关联类型：trip行程 guide攻略 partner搭子（空=无关联）
  targetId?: string; // 关联目标ID
  targetName?: string; // 关联名称（行程/攻略/搭子标题）
  name: string;
  isTemplate: number; // 0 或 1
  createdAt: string;
  items: ChecklistItem[];
}

// ==========================================
// 2. 接口请求函数 (API Functions)
// ==========================================

/**
 * 获取用户的所有备忘清单
 * @returns 清单列表
 */
export const getChecklists = (params) =>
  request<PageResult<Checklist>>({
    url: '/checklist',
    method: 'GET',
    params
  });

/**
 * 创建备忘清单 (对应图1: POST /checklist)
 * @param data 完整的清单创建信息
 * @returns 创建成功的清单对象
 */
export const createChecklist = (params: Partial<Checklist>) =>
  request<Checklist>({
    url: '/checklist',
    method: 'POST',
    params,
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
  request<string>({
    url: `/checklist/${itemId}/item`,
    method: 'PUT',
    params: { checked },
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

/**
* 更新备忘清单 (对应图1: PUT /checklist/{id})
* @param id 清单ID (路径参数)
* @param data 包含名称和条目的更新数据 (请求体)
*/
export const updateChecklist = (id: string, params: UpdateChecklistRequest) =>
  request<any>({
    url: `/checklist/${id}`,
    method: 'PUT',
    params,
  });

/**
 * 获取清单详情 (对应图2: GET /checklist/{id})
 * @param id 清单ID (路径参数)
 * @returns 清单详细信息
 */
export const getChecklistDetail = (id: string) =>
  request<ChecklistDetail>({
    url: `/checklist/${id}`,
    method: 'GET',
  });