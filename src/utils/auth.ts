import Taro from "@tarojs/taro";
import { useAuthStore } from "@/store/authStore";
import { login } from "@/api/auth";

export async function silentLogin() {
  try {
    const { code } = await Taro.login();
    const data = await login(code);
    useAuthStore.getState().setToken(data.token);
    return data;
  } catch (err) {
    console.error("Login failed", err);
    throw err;
  }
}
