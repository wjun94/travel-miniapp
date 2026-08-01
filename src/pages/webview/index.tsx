import { WebView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { useMemo } from 'react';

export default () => {
  const {
    params: { src },
  } = useRouter<{ src: string }>();
  const decodeSrc = useMemo(() => decodeURIComponent(src), [src]);
  return <WebView src={decodeSrc} />;
};
