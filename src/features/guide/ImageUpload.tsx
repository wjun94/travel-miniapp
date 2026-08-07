import { View, Text } from '@tarojs/components';
import { Image } from '@/components'
import Taro from '@tarojs/taro';
import { uploadMultiImages } from '@/utils/upload';
import { deleteImage } from '@/api/upload'

interface Props {
  images: string[];
  onChoose: (images: string[]) => void;
  onDelete: (index: number) => void;
  label?: string;
  /** 图片格子边长（rpx，默认198；不同页面容器宽度可单独调整一行数量） */
  size?: number;
}

export default function ImageUpload({ images, onChoose, onDelete, label = '游玩图片/票据', size = 198 }: Props) {
  const handleChoose = async () => {
    const maxCanSelect = 9 - images.length;
    if (maxCanSelect <= 0) return;
    try {
      const res = await Taro.chooseImage({ count: maxCanSelect, sizeType: ['compressed'], sourceType: ['album', 'camera'] });
      Taro.showLoading({ title: '图片上传中...', mask: true });
      const uploadedUrls = await uploadMultiImages(res.tempFilePaths);
      Taro.hideLoading();
      onChoose([...images, ...uploadedUrls]);
    } catch (_) {
      Taro.hideLoading();
    }
  };

  return (
    <View className='space-y-1.5 box-border'>
      <Text className='text-gray-700 text-[26px] font-medium'>
        上传{label}<Text className='text-gray-400 font-normal text-[24px]'>（可选，{images.length}/9）</Text>
      </Text>
      <View className='flex flex-wrap gap-2 box-border'>
        {images.map((imgUrl, imgIdx) => (
          <View
            key={imgIdx}
            className='bg-gray-100 rounded-xl relative overflow-hidden shadow-sm flex-shrink-0'
            style={{ width: `${size}rpx`, height: `${size}rpx` }}
          >
            <Image src={imgUrl} mode='aspectFill' className='w-full h-full' preview />

            {/* 右上角删除按钮：黑色三角形 + 白色叉号 */}
            <View
              onClick={(e) => {
                e.stopPropagation(); // 阻止冒泡，避免触发图片预览
                deleteImage(imgUrl);
                onDelete(imgIdx);
              }}
              className='absolute top-0 right-0 z-10 active:opacity-70'
              style={{
                width: '58rpx',
                height: '58rpx',
                backgroundColor: '#000',
                // 裁剪为右上角直角三角形（斜边朝左下）
                clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
              }}
            >
              <Text
                className='text-white font-bold leading-none absolute'
                style={{
                  top: '6rpx',
                  right: '10rpx',
                  fontSize: '24rpx' // 匹配三角形尺寸，可按需微调
                }}
              >×</Text>
            </View>
          </View>
        ))}

        {images.length < 9 && (
          <View
            onClick={handleChoose}
            className='border border-dashed border-gray-300 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 active:bg-gray-100 flex-shrink-0'
            style={{ width: `${size}rpx`, height: `${size}rpx` }}
          >
            <Text className='iconfont icon-plus text-80px' />
          </View>
        )}
      </View>
    </View>
  );
}
