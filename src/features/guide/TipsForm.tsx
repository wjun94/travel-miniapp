import { View, Text, Textarea } from '@tarojs/components';
import { typeConfigMap } from '@/constants/travel';

interface Props {
  item: any;
  updateField: (field: string | Record<string, any>, value?: any) => void;
}

const cfg = typeConfigMap.tips;

export default function TipsForm({ item, updateField }: Props) {
  return (
    <View className='space-y-4 box-border'>
      {/* 避坑描述 */}
      <View className='box-border'>
        <View className='flex items-center mb-1.5'>
          <Text className='text-red-500 font-bold mr-0.5'>*</Text>
          <Text className='text-gray-700 text-[26px] font-medium'>避坑描述</Text>
        </View>
        <Textarea
          showConfirmBar={false}
          autoHeight
          disableDefaultPadding
          className='w-full min-h-[140px] p-3 bg-gray-50 rounded-xl leading-normal box-border text-gray-800'
          placeholderStyle='color: #9ca3af'
          value={item.title}
          placeholder='请输入需要避坑的内容...'
          onInput={(e) => updateField('title', e.detail.value)}
        />
      </View>
    </View>
  );
}
