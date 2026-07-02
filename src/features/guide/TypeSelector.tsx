import { View, Text } from '@tarojs/components';
import { typeConfigMap, SectionType } from '@/constants/travel';

interface TypeSelectorProps {
  visible: boolean;
  onSelect: (type: SectionType) => void;
  onCancel: () => void;
}

const typeList: SectionType[] = ['transport', 'attraction', 'food', 'hotel', 'shopping', 'tips'];

export default function TypeSelector({ visible, onSelect, onCancel }: TypeSelectorProps) {
  if (!visible) return null;

  return (
    <View className='fixed top-0 left-0 right-0 bottom-0 z-[999] flex items-end justify-center' onClick={onCancel}>
      <View className='absolute inset-0 bg-black/40' />
      <View className='relative w-full bg-white rounded-t-3xl p-4 pb-8 space-y-3 z-10 box-border' onClick={(e) => e.stopPropagation()}>
        <Text className='text-gray-800 font-bold text-[30px] block text-center mb-2'>请选择添加内容</Text>
        <View className='grid grid-cols-3 gap-3 box-border'>
          {typeList.map((type) => {
            const cfg = typeConfigMap[type];
            return (
              <View key={type} onClick={() => onSelect(type)} className='flex flex-col items-center justify-center py-4 bg-gray-50 rounded-2xl active:bg-gray-100 box-border'>
                <Text className='text-[40px] mb-1'>{cfg.emoji}</Text>
                <Text className='text-gray-700 font-medium text-[26px]'>{cfg.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
