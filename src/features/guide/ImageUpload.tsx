import { View, Text } from '@tarojs/components';
import { Image } from '@/components'
import Taro from '@tarojs/taro';
import { uploadMultiImages } from '@/utils/upload';
import { deleteImage } from '@/api/upload'

interface Props {
  images: string[];
  onChoose: (images: string[]) => void;
  onDelete: (index: number) => void;
}

export default function ImageUpload({ images, onChoose, onDelete }: Props) {
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
        上传游玩图片/票据<Text className='text-gray-400 font-normal text-[24px]'>（可选，{images.length}/9）</Text>
      </Text>
      <View className='flex flex-wrap gap-2 box-border'>
        {images.map((imgUrl, imgIdx) => (
          <View
            key={imgIdx}
            className='w-[198px] h-[198px] bg-gray-100 rounded-xl relative overflow-hidden shadow-sm flex-shrink-0'
          >
            <Image src={imgUrl} mode='aspectFill' className='w-full h-full' preview />
            <View
              onClick={() => {
                deleteImage(imgUrl)
                onDelete(imgIdx)
              }}
              className='absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-xl flex items-center justify-center text-[24px] font-bold z-10 active:bg-red-600'>×</View>
          </View>
        ))}
        {images.length < 9 && (
          <View onClick={handleChoose} className='w-[198px] h-[198px] border border-dashed border-gray-300 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 active:bg-gray-100 flex-shrink-0'>
            <Text className='iconfont icon-plus text-80px' />
          </View>
        )}
      </View>
    </View>
  );
}
