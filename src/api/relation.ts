import request from './request';

/**
 * 关联目标选项（清单/记账本编辑页共用）
 * 一个接口返回我的全部已发布行程/攻略/搭子
 */
export interface RelationOption {
  id: string;
  title: string;
}

export interface RelationOptions {
  trips: RelationOption[]; // 行程
  guides: RelationOption[]; // 攻略
  partners: RelationOption[]; // 搭子
}

/** 获取关联目标选项（行程/攻略/搭子） */
export const getRelationOptions = () =>
  request<RelationOptions>({
    url: '/relations',
    method: 'GET',
  });
