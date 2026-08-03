import Taro from '@tarojs/taro';
import { useAuthStore } from '@/store/authStore';
import { silentLogin } from '@/utils/auth';

// 定义缺少的 API_BASE，防止编译报错（请根据你实际的全局变量或导入调整）
declare const API_BASE: string;

/**
 * 分页列表通用返回结构
 */
export interface PageResult<T> {
    list: T[];
    total: number;
}

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
  showLoading?: boolean;
  showErrorToast?: boolean; // 👈 新增：是否显示错误弹窗，默认为 true
}

async function request<T = any>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showErrorToast = true, // 👈 新增：解构并设置默认值
  } = options;

  // 过滤值为 undefined 的请求参数，避免携带无效字段（null/0/'' 等合法值保留）
  // 注意：不使用 Object.fromEntries（ES2019），微信小程序基础库不支持会导致白屏
  let cleanData: any = data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const clean: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) clean[key] = data[key];
    });
    cleanData = Object.keys(clean).length > 0 ? clean : undefined;
  }

  const fullUrl = url.startsWith('http') ? url : API_BASE + url;

  const token = useAuthStore.getState().token;

  try {
    const res = await Taro.request({
      url: fullUrl,
      method,
      data: cleanData,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...header,
      },
    });

    if (res?.statusCode === 401) {
      const { token: newToken } = await silentLogin();
      // 更新 store
      useAuthStore.getState().setToken(newToken);
      // 获取用户信息
      await useAuthStore.getState().fetchUserInfo();
      // throw new Error('登录过期，已重新登录');
    } else if (res.data.code !== 0) {
      Taro.showToast({ title: res.data.msg || '服务器异常', icon: 'none' });
      throw new Error(res.data.msg || '请求失败');
    }
    return res.data.data;
  } catch (err: any) {
    // 👈 修改：只有在 showErrorToast 为 true 时才弹出提示
    if (showErrorToast) {
      Taro.showToast({ title: err.message || '网络错误', icon: 'none' });
    }
    throw err;
  }
}

export default request;
