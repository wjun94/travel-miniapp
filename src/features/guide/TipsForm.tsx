import { View, Textarea } from '@tarojs/components';
import { typeConfigMap } from '@/constants/travel';

interface Props {
  item: any;
  updateField: (field: string, value: any) => void;
}

const cfg = typeConfigMap.tips;

export default function TipsForm({ item, updateField }: Props) {
  return (
    <View className='space-y-4 box-border'>
      {/* 备注 */}
      <View className='space-y-1.5 box-border'>
        <Text className='text-gray-700 text-[26px] font-medium mb-1.5 block'>备注<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
        <Textarea
          showConfirmBar={false}
          autoHeight
          disableDefaultPadding
          className='w-full min-h-[140px] p-3 bg-gray-50 rounded-xl leading-normal box-border text-gray-800'
          placeholderStyle='color: #9ca3af'
          value={item.description}
          placeholder={cfg.descPlaceholder}
          onInput={(e) => updateField('description', e.detail.value)}
        />
      </View>
    </View>
  );
}
