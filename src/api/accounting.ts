import request from './request';

/**
 * 记账条目
 */
export interface Accounting {
  id: string;
  targetType: string; // trip行程 guide攻略 partner搭子
  targetId: string; // 绑定目标ID
  userId: string;
  category: string; // 交通/餐饮/住宿/门票/购物/其他
  amount: number;
  note: string;
  transactionId: string;
  consumedAt: string;
  createdAt: string;
}

/** 账本汇总 */
export interface AccountSummary {
  totalAmount: number; // 总支出
  count: number; // 总笔数
  categoryStat: Record<string, number>; // 各分类金额
}

/** 账本总览项（按目标聚合） */
export interface AccountOverviewItem {
  targetType: string; // trip行程 guide攻略 partner搭子
  targetId: string; // 绑定目标ID
  targetName: string; // 目标名称（行程标题/攻略标题/搭子标题）
  totalAmount: number; // 总支出
  count: number; // 总笔数
  lastTime: string; // 最后记账时间
}

/** 记账目标类型 */
export type TargetType = 'trip' | 'guide' | 'partner';

/** 记账分类 */
export const ACCOUNT_CATEGORIES = ['交通', '餐饮', '住宿', '门票', '购物', '其他'] as const;

/** 目标类型中文名 */
export const TARGET_TYPE_NAMES: Record<TargetType, string> = {
  trip: '行程',
  guide: '攻略',
  partner: '搭子',
};

/**
 * 获取指定目标的账本明细
 * @param targetType 绑定类型：trip行程 guide攻略 partner搭子
 * @param targetId 绑定目标ID
 */
export const getAccountList = (targetType: TargetType, targetId: string) =>
  request<Accounting[]>({
    url: '/account/list',
    method: 'GET',
    params: { targetType, targetId },
  });

/**
 * 获取指定目标的账本汇总
 */
export const getAccountSummary = (targetType: TargetType, targetId: string) =>
  request<AccountSummary>({
    url: '/account/summary',
    method: 'GET',
    params: { targetType, targetId },
  });

/**
 * 获取我的账本总览（按目标聚合）
 */
export const getAccountOverview = () =>
  request<AccountOverviewItem[]>({
    url: '/account/overview',
    method: 'GET',
  });

/**
 * 添加一条记账记录
 */
export const addAccount = (params: {
  targetType: TargetType;
  targetId: string;
  category: string;
  amount: number;
  note?: string;
  consumedAt?: string; // ISO8601，可选
}) =>
  request<Accounting>({
    url: '/account',
    method: 'POST',
    params,
  });

/**
 * 删除一条记账记录
 * @param id 记账ID
 */
export const deleteAccount = (id: string) =>
  request({
    url: `/account/${id}`,
    method: 'DELETE',
  });

/**
 * 导入微信支付账单
 */
export const importWechatPay = (targetType: TargetType, targetId: string, transactions: string[]) =>
  request({
    url: '/account/import',
    method: 'POST',
    params: { targetType, targetId, transactions },
  });
