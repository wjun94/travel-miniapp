import { View, Text, Picker, Textarea } from '@tarojs/components';
import { typeConfigMap } from '@/constants/travel';
import LocationPicker from './LocationPicker';
import ImageUpload from './ImageUpload';

interface Props {
  item: any;
  updateField: (field: string | Record<string, any>, value?: any) => void;
}

const cfg = typeConfigMap.hotel;

export default function HotelForm({ item, updateField }: Props) {
  return (
    <View className='space-y-4 box-border'>
      {/* 时间 */}
      <View className='space-y-1.5 box-border'>
        <Text className='text-gray-700 text-[26px] font-medium'>时间<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
        <View className='flex items-center space-x-2 box-border'>
          <Picker mode='time' value={item.startTime || ''} onChange={(e) => updateField('startTime', e.detail.value)} className='flex-1'>
            <View className='p-2.5 bg-gray-50 rounded-xl text-center text-[26px] text-gray-600 border border-gray-100 active:bg-gray-100 box-border'>⏱️ {item.startTime || '入住'}</View>
          </Picker>
          <Text className='text-gray-300 font-bold'>~</Text>
          <Picker mode='time' value={item.endTime || ''} start={item.startTime || ''} onChange={(e) => updateField('endTime', e.detail.value)} className='flex-1'>
            <View className='p-2.5 bg-gray-50 rounded-xl text-center text-[26px] text-gray-600 border border-gray-100 active:bg-gray-100 box-border'>⏱️ {item.endTime || '离店'}</View>
          </Picker>
        </View>
      </View>

      {/* 地点 */}
      <LocationPicker label='地点' address={item.address || ''} latitude={item.latitude} longitude={item.longitude} onPick={(res) => { updateField({ address: res.address, latitude: res.latitude, longitude: res.longitude }); }} />

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

      {/* 图片 */}
      <ImageUpload images={item.images || []} onChoose={(imgs) => updateField('images', imgs)} onDelete={(idx) => updateField('images', (item.images || []).filter((_: any, i: number) => i !== idx))} />
    </View>
  );
}
