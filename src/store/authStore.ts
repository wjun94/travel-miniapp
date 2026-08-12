import { create } from "zustand";
import Taro from "@tarojs/taro";
import { getUserInfo } from "@/api/auth";

interface AuthState {
  token: string | null;
  userId: number | null;
  userInfo: USER.Info | null; // 新增
  setToken: (token: string) => void;
  setUserId: (id: number) => void;
  setUserInfo: (info: USER.Info | null) => void; // 新增
  fetchUserInfo: () => Promise<void>; // 新增
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: Taro.getStorageSync("token") || null,
  userId: Taro.getStorageSync("userId") || null,
  userInfo: null, // 不持久化，每次启动重新获取

  setToken: (token) => {
    Taro.setStorageSync("token", token);
    set({ token });
  },

  setUserId: (id) => {
    Taro.setStorageSync("userId", id);
    set({ userId: id });
  },

  // 浅合并：局部字段更新（如只改头像/昵称）不覆盖其余字段
  setUserInfo: (info) =>
    set({ userInfo: info ? { ...(get().userInfo || {}), ...info } : null }),

  fetchUserInfo: async () => {
    const token = get().token;
    if (!token) return;
    const userInfo = await getUserInfo();
    set({ userInfo });
  },

  logout: () => {
    Taro.removeStorageSync("token");
    set({ token: null, userId: null, userInfo: null });
    Taro.reLaunch({ url: "/pages/index/index" });
  },

  isLoggedIn: () => !!get().token,
}));
