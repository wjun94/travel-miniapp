import request, { PageResult } from './request'; // 确保路径正确指向你的 request 实例

// --- 类型定义 (基于你提供的 JSON 结构) ---

/** 发布/创建搭子时的参数 */
export interface CreatePartnerParams {
  id: string;
  tripId: string;
  userId: string;
  title: string;
  desc: string;
  destination: string;
  cover: string; // 封面图片 URL

  startDate: string;
  endDate: string;
  days: number;
  createdAt: string;
  updatedAt: string;

  // 成员与限制
  currentMembers: number;
  maxMembers: number;
  minAge: number;
  maxAge: number;
  genderLimit: number; // 0: 不限, 1: 仅限男性, 2: 仅限女性 (根据业务调整)
  requirement: string; // 加入要求/备注

  // 费用相关
  budgetPerPerson: number;
  officialPrice: number;

  // 地理位置
  latitude: number;
  longitude: number;

  // 分类与标签
  travelTags: string; // 如果后端返回的是逗号分隔字符串，可用 string；如果是序列化数组，建议用 string[]
  type: number;       // 旅行类型/出行方式

  // 状态与权限
  isPublic: number;   // 0: 私密/草稿, 1: 公开
  status: number;     // 0: 招募中, 1: 已满员, 2: 已结束 (根据业务调整)

  // 运营/排序数据
  sortWeight: number;
  viewCount: number;
}

/** 申请加入搭子的参数 */
export interface ApplyPartnerParams {
  remark?: string; // 申请留言
}

/** 处理申请的参数 */
export interface HandleApplicationParams {
  applicationId: string;
  status: number; // 1: 同意, 2: 拒绝
}

/** 搭子列表项的数据结构 */
export interface PartnerItem {
  id: string;
  tripId: string;
  userId: string;
  title: string;
  desc: string;
  destination: string;
  cover: string; // 封面图 URL

  isApplied: boolean;
  isSelf: boolean

  startDate: string;
  endDate: string;
  days: number;
  createdAt: string;
  updatedAt: string;

  // 人数与限制
  currentMembers: number;
  maxMembers: number;
  minAge: number;
  maxAge: number;
  genderLimit: number; // 性别限制 (例如: 0不限 / 1仅男 / 2仅女)
  requirement: string; // 报名要求描述

  // 费用与地理位置
  budgetPerPerson: number;
  officialPrice: number;
  latitude: number;
  longitude: number;

  // 标签与分类
  travelTags: string;  // 若后端返回 "标签1,标签2"，可在前端 .split(',') 转为 string[]
  type: number;        // 出行类型

  // 状态与运营数据
  isPublic: 0 | 1;     // 0: 私密/隐藏, 1: 公开
  status: number;      // 状态码 (如: 0招募中, 1已满员, 2已结束)
  sortWeight: number;
  viewCount: number;
}

// --- API 函数 ---

/**
 * 1. 获取搭子列表
 * GET /partner/list
 * @param params 查询参数 (如 page, pageSize, destination 等)
 */
export const getPartnerList = (params?: any) =>
  request<PageResult<PartnerItem>>({
    url: `/partner/list`,
    method: 'GET',
    data: params // GET 请求通常使用 params
  });

/**
 * 2. 发布搭子
 * POST /partner
 * @param data 搭子详细信息
 */
export const createPartner = (data: CreatePartnerParams) =>
  request<any>({
    url: `/partner`,
    method: 'POST',
    data
  });



/**
 * 3. 申请加入搭子
 * POST /partner/{id}/apply
 * @param id 搭子ID
 * @param data 申请信息 (remark)
 */
export const applyPartner = (id: string, data: ApplyPartnerParams) =>
  request<any>({
    url: `/partner/${id}/apply`,
    method: 'POST',
    data
  });

/**
 * 4. 处理搭子申请 (同意/拒绝)
 * PUT /partner/{id}/application
 * @param id 搭子ID (路由参数)
 * @param data 申请ID和处理状态
 */
export const handlePartnerApplication = (id: string, data: HandleApplicationParams) =>
  request<any>({
    url: `/partner/${id}/application`,
    method: 'PUT',
    data
  });

/**
* 5. 获取搭子详情
* GET /partner/{id}
* @param id 搭子ID
* @returns 搭子详细信息 (复用 PartnerItem 结构)
*/
export const getPartnerDetail = (id: string) =>
  request<PartnerItem>({
    url: `/partner/${id}`,
    method: 'GET'
  });