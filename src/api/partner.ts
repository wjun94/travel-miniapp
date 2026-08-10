import request, { PageResult } from './request'; // 确保路径正确指向你的 request 实例
import type { Trip, AiGenerateTripData } from './trip';

// --- 类型定义 (基于你提供的 JSON 结构) ---

/** 行程日（对应 days 数组中的每一天） */
export interface DayItem {
  date: string;               // 日期（ISO 8601）
  dayNumber: number;          // 第几天（从 1 开始）
  title: string;              // 当日标题
  items: ItineraryItem[];     // 当天行程条目列表
}

/** 单天内的行程条目 */
export interface ItineraryItem {
  address?: string;           // 地址
  description?: string;       // 描述
  endLat?: number;            // 结束点纬度
  endLng?: number;            // 结束点经度
  endPoint?: string;          // 结束地点名称
  endTime?: string;           // 结束时间（HH:mm）
  images?: string[];          // 图片列表
  latitude?: number;          // 纬度
  longitude?: number;         // 经度
  needReservation?: boolean;  // 是否需要预约
  sectionType?: string;       // 条目类型（transport/attraction/food/hotel/shopping/tips）
  startLat?: number;          // 出发点纬度
  startLng?: number;          // 出发点经度
  startPoint?: string;        // 出发地点名称
  startTime?: string;         // 开始时间（HH:mm）
  ticketChannel?: string;     // 购票渠道
  ticketPrice?: number;       // 票价（分）
  title: string;              // 条目标题
  transportMode?: string;     // 交通方式（仅 sectionType=transport 时）
}

/** 发布/创建搭子时的参数（与后端接口请求体对齐） */
export interface CreatePartnerParams {
  address?: string;            // 地址详情
  allowCollect?: number;       // 允许收藏: 0-禁止 1-允许
  allowShare?: number;         // 允许分享: 0-禁止 1-允许
  autoClose?: number;          // 自动截止: 0-关闭 1-开启
  budgetPerPerson?: number;    // 人均预算（分）
  category?: string;           // 活动分类
  cover?: string;              // 封面图 URL
  days?: DayItem[];            // 行程天数计划（每日包含多个条目）
  desc?: string;               // 行程简述
  destination?: string;        // 目的地名称
  endDate?: string;            // 结束日期（ISO 8601）
  estTotal?: number;           // 预估总费用（分）
  feeExclude?: string;         // 费用不含说明
  feeInclude?: string;         // 费用包含说明
  feeMode?: number;            // 费用模式: 0-AA 1-全包 2-部分
  femaleCount?: number;        // 女性名额
  genderLimit?: number;        // 性别限制: 0-不限 1-仅男生 2-仅女生
  images?: string;             // 多张图片（逗号分隔或 JSON 数组）
  isDraft?: number;            // 草稿状态: 0-非草稿 1-草稿
  isPublic?: number;           // 是否公开: 0-私密 1-公开
  joinMode?: number;           // 加入方式: 0-自由加入 1-需审核
  latitude?: number;           // 纬度
  locationType?: number;       // 位置类型
  longitude?: number;          // 经度
  maleCount?: number;          // 男性名额
  maxAge?: number;             // 年龄上限
  maxMembers?: number;         // 招募上限
  minAge?: number;             // 年龄下限
  minMembers?: number;         // 最少成行人数
  officialPrice?: number;      // 官方活动定价（分）
  onlineLink?: string;         // 线上链接（腾讯会议等）
  requirement?: string;        // 人员要求/报名条件
  richDesc?: string;           // 富文本描述（HTML/Markdown）
  startDate?: string;          // 出发日期（ISO 8601）
  tags?: string;               // 标签（逗号分隔）
  title?: string;              // 招募标题
  totalDays?: number;          // 总天数
  travelTags?: string;         // 出行标签（逗号分隔，如：自驾,徒步,美食）
  tripId?: string;             // 关联行程 ID
  visibility?: number;         // 可见性: 0-全部可见 1-仅粉丝 2-仅互关
}

/** 申请加入搭子的参数 */
export interface ApplyPartnerParams {
  remark?: string; // 申请留言
}

/** 处理申请的参数 */
export interface HandleApplicationParams {
  applicationId: string;
  reason: string; // 拒绝理由
  status: number; // 1: 同意, 2: 拒绝
}

/** 搭子详情（GET /partner/{id} 完整响应） */
export interface PartnerDetail {
  /** 唯一标识 */
  id: string;
  /** 发布者用户 ID */
  userId: string;
  /** 标题 */
  title: string;
  /** 描述/介绍 */
  desc: string;
  /** 详细地址 */
  address: string;
  /** 目的地名称 */
  destination: string;
  /** 活动分类（旅游/美食/运动等） */
  category: string;
  /** 封面图 URL */
  cover: string;
  /** 多张图片（逗号分隔或 JSON 数组） */
  images: string;
  /** 标签（逗号分隔） */
  tags: string;
  /** 出行标签（逗号分隔，如：自驾,徒步,美食） */
  travelTags: string;
  /** 出行类型: 0 不限 / 1 自由行 / 2 跟团游 / 3 自驾游 */
  type: number;
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

  // --- 人数 & 年龄 ---
  /** 当前已加入人数 */
  currentMembers: number;
  /** 最大人数限制 */
  maxMembers: number;
  /** 最少成行人数 */
  minMembers: number;
  /** 男性名额 */
  maleCount: number;
  /** 女性名额 */
  femaleCount: number;
  /** 最小年龄限制 */
  minAge: number;
  /** 最大年龄限制 */
  maxAge: number;
  /** 性别限制: 0 不限 / 1 仅男生 / 2 仅女生 */
  genderLimit: number;

  // --- 费用 ---
  /** 费用模式: 0 免费 / 1 AA / 2 组织者全包 / 3 人均预算 */
  feeMode: number;
  /** 人均预算（分） */
  budgetPerPerson: number;
  /** 官方参考价（分） */
  officialPrice: number;
  /** 预估总费用（分） */
  estTotal: number;
  /** 费用包含说明 */
  feeInclude: string;
  /** 费用不含说明 */
  feeExclude: string;

  // --- 权限 & 配置 ---
  /** 加入方式: 0 自由加入 / 1 需审核 */
  joinMode: number;
  /** 成团后自动关闭报名: 0 关闭 / 1 开启 */
  autoClose: number;
  /** 允许他人转发: 0 禁止 / 1 允许 */
  allowShare: number;
  /** 允许他人收藏: 0 禁止 / 1 允许 */
  allowCollect: number;
  /** 可见性: 0 全部可见 / 1 仅粉丝 / 2 仅互关 */
  visibility: number;
  /** 草稿状态: 0 非草稿 / 1 草稿 */
  isDraft: number;
  /** 是否公开: 0 私密 / 1 公开 */
  isPublic: 0 | 1;
  /** 状态: 0 招募中 / 1 已满员 / 2 已结束 */
  status: number;
  /** 排序权重 */
  sortWeight: number;

  // --- 位置 ---
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 位置类型 */
  locationType: number;

  // --- 作者 ---
  /** 发布者头像 URL */
  authorAvatar: string;
  /** 发布者昵称 */
  authorName: string;

  // --- 线上 & 要求 ---
  /** 线上链接（腾讯会议等） */
  onlineLink: string;
  /** 报名要求/条件 */
  requirement: string;
  /** 富文本描述（HTML/Markdown） */
  richDesc: string;

  // --- 社交状态 ---
  /** 是否为自己发布的 */
  isSelf: boolean;
  /** 是否已报名申请 */
  isApplied: boolean;
  /** 是否已关注发布者 */
  isFollowed: boolean;
  /** 当前登录用户是否已收藏 */
  isFavorited: boolean;
  /** 当前登录用户是否已点赞 */
  isLiked: boolean;

  // --- 统计数据 ---
  /** 浏览次数 */
  viewCount: number;
  /** 点赞数 */
  likeCount: number;
  /** 收藏数 */
  favoriteCount: number;
  /** 评论数 */
  commentCount: number;

  // --- 关联行程 ---
  /** 关联行程详情 */
  trip: Trip;
}

/** 搭子/结伴游条目（列表接口响应） */
export interface PartnerItem {
  // --- 基础信息 ---
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
  /** 详细地址 */
  address: string;
  /** 目的地名称 */
  destination: string;
  /** 活动分类（旅游/美食/运动等） */
  category: string;
  /** 封面图 URL */
  cover: string;
  /** 多张图片（逗号分隔或 JSON 数组） */
  images: string;
  /** 标签（逗号分隔） */
  tags: string;
  /** 出行标签（逗号分隔，如：自驾,徒步,美食） */
  travelTags: string;
  /** 出行类型: 0 不限 / 1 自由行 / 2 跟团游 / 3 自驾游 */
  type: number;
  /** 富文本描述（HTML/Markdown） */
  richDesc: string;

  // --- 时间 ---
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
  /** 行程天数 */
  days: number;
  /** 关联行程的行程项总数 */
  itemCount: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;

  // --- 人数 & 年龄 ---
  /** 当前已加入人数 */
  currentMembers: number;
  /** 最大人数限制 */
  maxMembers: number;
  /** 最少成行人数 */
  minMembers: number;
  /** 男性名额 */
  maleCount: number;
  /** 女性名额 */
  femaleCount: number;
  /** 最小年龄限制 */
  minAge: number;
  /** 最大年龄限制 */
  maxAge: number;
  /** 性别限制: 0 不限 / 1 仅男 / 2 仅女 */
  genderLimit: number;

  // --- 费用 ---
  /** 费用模式: 0 免费 / 1 AA / 2 组织者全包 / 3 人均预算 */
  feeMode: number;
  /** 人均预算 */
  budgetPerPerson: number;
  /** 官方参考价 */
  officialPrice: number;
  /** 预估总费用 */
  estTotal: number;
  /** 费用包含说明 */
  feeInclude: string;
  /** 费用不含说明 */
  feeExclude: string;

  // --- 权限 & 配置 ---
  /** 加入方式: 0 自由加入 / 1 需审核 */
  joinMode: number;
  /** 成团后自动关闭报名: 0 关闭 / 1 开启 */
  autoClose: number;
  /** 允许他人转发: 0 禁止 / 1 允许 */
  allowShare: number;
  /** 允许他人收藏: 0 禁止 / 1 允许 */
  allowCollect: number;
  /** 可见性: 0 全部可见 / 1 仅粉丝 / 2 仅互关 */
  visibility: number;
  /** 草稿状态: 0 非草稿 / 1 草稿 */
  isDraft: number;
  /** 是否公开: 0 私密 / 1 公开 */
  isPublic: 0 | 1;
  /** 状态: 0 招募中 / 1 已满员 / 2 已结束 */
  status: number;
  /** 排序权重 */
  sortWeight: number;

  // --- 位置 ---
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 位置类型 */
  locationType: number;

  // --- 作者 ---
  /** 发布者头像 URL */
  authorAvatar: string;
  /** 发布者昵称 */
  authorName: string;
  /** 发布者用户 ID（同 userId） */
  authorId: string;

  // --- 线上 & 要求 ---
  /** 线上链接（腾讯会议等） */
  onlineLink: string;
  /** 报名要求描述 */
  requirement: string;

  // --- 社交状态 ---
  /** 是否已报名申请 */
  isApplied: boolean;
  /** 是否为自己发布的 */
  isSelf: boolean;
  /** 是否已关注发布者 */
  isFollowed: boolean;

  // --- 统计 ---
  /** 浏览次数 */
  viewCount: number;
  /** 点赞数 */
  likeCount: number;
}

// AI生成搭子行程请求入参
export interface AiGeneratePartnerParams {
  destination: string;
  days: number;
  /** 用户选择的出发日期（YYYY-MM-DD），指定后搭子日期与行程安排按此顺延 */
  startDate?: string;
  /** 用户选择的结束日期（YYYY-MM-DD） */
  endDate?: string;
}

// --- API 函数 ---

/**
 * 获取搭子列表（分页）
 * GET /partner/list
 * @param page     页码
 * @param pageSize 每页数量
 * @param keyword  关键词搜索（标题/目的地/简述/标签），可选
 */
export const getPartnerList = (
  page: number,
  pageSize: number,
  keyword?: string,
) =>
  request<PageResult<PartnerItem>>({
    url: '/partner/list',
    method: 'GET',
    params: { page, pageSize, keyword },
  });

/**
* 1. 获取搭子列表
* GET /my/partners
* @param params 查询参数 (如 page, pageSize, destination 等)
*/
export const getMyPartners = (params?: any) =>
  request<PageResult<PartnerItem>>({
    url: `/my/partners`,
    method: 'GET',
    params: params // GET 请求通常使用 params
  });

/**
 * 获取我参与的搭子列表（申请已通过且搭子已发布）
 * GET /my/joined-partners
 * @param params 查询参数 (如 page, pageSize)
 */
export const getMyJoinedPartners = (params?: any) =>
  request<PageResult<PartnerItem>>({
    url: `/my/joined-partners`,
    method: 'GET',
    params: params
  });

/**
 * 2. 发布搭子
 * POST /partner
 * @param data 搭子详细信息
 */
export const createPartner = (params: CreatePartnerParams) =>
  request<any>({
    url: `/partner`,
    method: 'POST',
    params
  });



/**
 * 3. 申请加入搭子
 * POST /partner/{id}/apply
 * @param id 搭子ID
 * @param data 申请信息 (remark)
 */
export const applyPartner = (id: string, params: ApplyPartnerParams) =>
  request<any>({
    url: `/partner/${id}/apply`,
    method: 'POST',
    params
  });

/**
 * 解散搭子（仅发起人）
 * @param id 搭子ID
 * @param reason 解散原因（可选）
 */
export const cancelPartner = (id: string, reason?: string) =>
  request<any>({
    url: `/partner/${id}/cancel`,
    method: 'PUT',
    params: { reason: reason || '' }
  });

/**
 * 退出搭子（仅已加入成员，发起人不可退出，只能解散）
 * @param id 搭子ID
 */
export const leavePartner = (id: string) =>
  request<any>({
    url: `/partner/${id}/leave`,
    method: 'PUT'
  });

/**
 * 4. 处理搭子申请 (同意/拒绝)
 * PUT /partner/{id}/application
 * @param id 搭子ID (路由参数)
 * @param data 申请ID和处理状态
 */
export const handlePartnerApplication = (id: string, params: HandleApplicationParams) =>
  request<null>({
    url: `/partner/${id}/application`,
    method: 'PUT',
    params
  });

/**
* 5. 获取搭子详情
* GET /partner/{id}
* @param id 搭子ID
* @returns 搭子详情 (完整 PartnerDetail 结构，含嵌套 trip)
*/
export const getPartnerDetail = (id: string) =>
  request<PartnerDetail>({
    url: `/partner/${id}`,
    method: 'GET'
  });

/**
 * 6. 更新搭子（编辑草稿/已发布，支持全量替换行程安排）
 * PUT /partner/{id}
 * @param id 搭子ID
 * @param params 更新数据
 */
export const updatePartner = (id: string, params: Partial<CreatePartnerParams>) =>
  request<any>({
    url: `/partner/${id}`,
    method: 'PUT',
    params,
  });

/**
 * 7. 删除搭子（仅作者）
 * DELETE /partner/{id}
 * @param id 搭子ID
 */
export const deletePartner = (id: string) =>
  request<any>({
    url: `/partner/${id}`,
    method: 'DELETE',
  });

/**
 * 8. 点赞搭子
 * POST /partner/{id}/like
 * @param id 搭子ID
 */
export const likePartner = (id: string) =>
  request<string>({
    url: `/partner/${id}/like`,
    method: 'POST',
  });

/**
 * 7. 取消点赞搭子
 * DELETE /partner/{id}/like
 * @param id 搭子ID
 */
export const unlikePartner = (id: string) =>
  request<string>({
    url: `/partner/${id}/like`,
    method: 'DELETE',
  });

/**
* AI根据目的地+天数自动生成完整搭子行程
* @param params {destination目的地, days出行天数}
* @returns 生成完毕的完整搭子行程数据（已入库）
*/
export const aiGeneratePartner = (params: AiGeneratePartnerParams) =>
  request<AiGenerateTripData>({
    url: '/partner/ai-generate',
    method: 'POST',
    params: params,
  });