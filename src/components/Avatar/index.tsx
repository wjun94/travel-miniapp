import { View } from '@tarojs/components';
import type { ImageProps } from '@tarojs/components/types/Image';
import { Image } from '@/components';
import NonePng from '@/assets/none.png';
import { useAuthStore } from '@/store/authStore';

type P = {
  /** 名字：头像为空时显示名字前两个字 */
  name?: string;
  /** 预览 */
  preview?: boolean;
  cdn?: boolean;
  /** 图片预览多张 */
  urls?: string[];
  current?: string;
  /** 自定义加载失败占位图 */
  errorSrc?: string;
};

export default ({
  src,
  name,
  cdn,
  preview,
  current,
  urls,
  mode = 'aspectFill',
  errorSrc = NonePng,
  ...props
}: Omit<ImageProps, 'preview' | 'onError'> & P) => {
  const { userInfo } = useAuthStore();
  // 未传 name 时默认使用当前登录用户信息兜底
  const finallySrc = src || (!name ? userInfo?.avatarUrl : '') || '';
  const finallyName = name || userInfo?.nickname || '';

  // 头像为空时显示名字文字占位
  if (!finallySrc) {
    return (
      <View className={`bg-orange-500 flex items-center justify-center text-sm text-white font-semibold flex-shrink-0 ${props.className}`}>
        {finallyName?.slice(0, 2) || '驴友'}
      </View>
    );
  }
  return (
    <Image
      src={finallySrc}
      cdn={cdn}
      preview={preview}
      current={current}
      urls={urls}
      mode={mode}
      errorSrc={errorSrc}
      {...props}
    />
  );
};
