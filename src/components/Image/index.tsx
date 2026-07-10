import { Image, View } from '@tarojs/components';
import type { ImageProps } from '@tarojs/components/types/Image';
import { previewImage } from '@tarojs/taro';
import { getImageUrl, getImageCdnUrl } from '@/utils';
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore';
import NonePng from '@/assets/none.png';

type P = {
  /** 预览 */
  preview?: boolean;
  cdn?: boolean;
  /** 是否为头像 */
  isAvatar?: boolean;
  /** 图片预览多张 */
  urls?: string[];
  current?: string;
  /** 自定义加载失败占位图 */
  errorSrc?: string;
};

export default ({
  src,
  cdn,
  preview,
  current,
  urls,
  isAvatar,
  mode = 'aspectFill',
  errorSrc = NonePng,
  ...props
}: Omit<ImageProps, 'preview' | 'onError'> & P) => {
  const { userInfo } = useAuthStore();
  const [errImg, setErrImg] = useState('')
  // 处理图片地址
  const finallySrc = src ? cdn
    ? getImageCdnUrl(src)
    : getImageUrl(src) : errorSrc;

  // 加载失败时的回退处理
  const handleError = (e: any) => {
    // 动态替换为错误占位图（需要操作DOM，Taro中通过ref更规范）
    if (e.detail.errMsg && e.type === 'error') {
      setErrImg(errorSrc)
    }
  };

  return (
    isAvatar && src === "" ? <View
      className={`bg-orange-500 flex items-center justify-center text-sm text-white font-semibold flex-shrink-0 ${props.className}`}>
      {userInfo?.nickname?.slice(0, 2) || '驴友'}
    </View> : <Image
      onClick={() =>
        preview && previewImage({
          urls: urls?.map(item => getImageUrl(item)) || [finallySrc],
          current: getImageUrl(current || '') || finallySrc
        })
      }
      src={errImg || finallySrc}
      mode={mode}
      onError={handleError}
      {...props}
    />
  );
};