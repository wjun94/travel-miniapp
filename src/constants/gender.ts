/**
 * 用户性别映射
 * 存储值：unknown 未知 / male 男 / female 女
 * icon 为 iconfont 图标类名；color/badge 为内联 style 值（不用 Windi 动态拼接类名，避免样式未被提取）
 */
export const GENDER_META: Record<string, { label: string; icon: string; color: string; badge: string }> = {
  male: { label: '男', icon: 'icon-nan', color: '#2563EB', badge: '#EFF6FF' },
  female: { label: '女', icon: 'icon-nv', color: '#EF4444', badge: '#FEF2F2' },
  unknown: { label: '未知', icon: '', color: '', badge: '' },
};

/** 性别选择选项（编辑资料用） */
export const GENDER_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'unknown', label: '未知', icon: '' },
  { value: 'male', label: '男', icon: 'icon-nan' },
  { value: 'female', label: '女', icon: 'icon-nv' },
];
