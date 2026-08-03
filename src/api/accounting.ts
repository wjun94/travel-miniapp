import request from './request';

/**
 * 记账条目
 */
export interface Accounting {
  id: number;
  tripId: number;
  userId: number;
  category: string; // 交通/餐饮/住宿/其他
  amount: number;
  note: string;
  transactionId: string;
  consumedAt: string;
  createdAt: string;
}

/**
 * 获取指定行程的记账列表
 * @param tripId 行程ID
 * @returns 记账列表
 */
export const getAccounts = (tripId: number) =>
  request<Accounting[]>({
    url: `/account/${tripId}`,
    method: 'GET',
  });

/**
 * 添加一条记账记录
 * @param data 记账数据
 * @returns void
 */
export const addAccount = (params: {
  tripId: number;
  category: string;
  amount: number;
  note?: string;
  consumedAt?: string;
}) =>
  request({
    url: '/account',
    method: 'POST',
    params,
  });

/**
 * 导入微信支付账单
 * @param tripId 行程ID
 * @param transactions 微信支付订单号数组（实际应携带金额信息）
 * @returns void
 */
export const importWechatPay = (tripId: number, transactions: string[]) =>
  request({
    url: '/account/import',
    method: 'POST',
    params: { trip_id: tripId, transactions },
  });