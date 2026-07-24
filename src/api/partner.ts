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

/** 搭子/结伴游条目 */
export interface PartnerItem {
  /** 唯一标识 */
  id: string;
  /** 关联的行程 ID */
  tripId: string;
  /** 发布者用户 ID */
  userId: string;
  /** 标题 */
  title: string;
  /** 描述/介绍 */
  desc: string;
  /** 目的地名称 */
  destination: string;
  /** 封面图 URL */
  cover: string;
  /** 是否已报名申请 */
  isApplied: boolean;
  /** 是否为自己发布的 */
  isSelf: boolean;
  /** 是否已关注发布者 */
  isFollowed: boolean;
  /** 发布者头像 URL */
  authorAvatar: string;
  /** 发布者昵称 */
  authorName: string;
  /** 发布者用户 ID（同 userId） */
  authorId: string;
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
  /** 行程天数 */
  days: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 当前已加入人数 */
  currentMembers: number;
  /** 最大人数限制 */
  maxMembers: number;
  /** 最小年龄限制 */
  minAge: number;
  /** 最大年龄限制 */
  maxAge: number;
  /** 性别限制: 0 不限 / 1 仅男 / 2 仅女 */
  genderLimit: number;
  /** 报名要求描述 */
  requirement: string;
  /** 人均预算 */
  budgetPerPerson: number;
  /** 官方参考价 */
  officialPrice: number;
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 出行标签，逗号分隔 */
  travelTags: string;
  /** 出行类型: 0 不限 / 1 自由行 / 2 跟团游 / 3 自驾游 */
  type: number;
  /** 是否公开: 0 私密 / 1 公开 */
  isPublic: 0 | 1;
  /** 状态: 0 招募中 / 1 已满员 / 2 已结束 */
  status: number;
  /** 排序权重 */
  sortWeight: number;
  /** 浏览次数 */
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