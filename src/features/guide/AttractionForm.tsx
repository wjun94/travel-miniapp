import { View, Text, Picker, Textarea } from '@tarojs/components';
import { typeConfigMap } from '@/constants/travel';
import LocationPicker from './LocationPicker';
import TicketPanel from './TicketPanel';
import ImageUpload from './ImageUpload';

interface Props {
  item: any;
  updateField: (field: string, value: any) => void;
}

const cfg = typeConfigMap.attraction;

export default function AttractionForm({ item, updateField }: Props) {
  return (
    <View className='space-y-4 box-border'>
      {/* 时间 */}
      <View className='space-y-1.5 box-border'>
        <Text className='text-gray-700 text-[26px] font-medium'>时间<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
        <View className='flex items-center space-x-2 box-border'>
          <Picker mode='time' value={item.startTime || '09:00'} onChange={(e) => updateField('startTime', e.detail.value)} className='flex-1'>
            <View className='p-2.5 bg-gray-50 rounded-xl text-center text-[26px] text-gray-600 border border-gray-100 active:bg-gray-100 box-border'>⏱️ {item.startTime || '开始时间'}</View>
          </Picker>
          <Text className='text-gray-300 font-bold'>~</Text>
          <Picker mode='time' value={item.endTime || '11:30'} onChange={(e) => updateField('endTime', e.detail.value)} className='flex-1'>
            <View className='p-2.5 bg-gray-50 rounded-xl text-center text-[26px] text-gray-600 border border-gray-100 active:bg-gray-100 box-border'>⏱️ {item.endTime || '结束时间'}</View>
          </Picker>
        </View>
      </View>

      {/* 地点 */}
      <LocationPicker label='地点' address={item.address || ''} latitude={item.latitude} longitude={item.longitude} onPick={(res) => { updateField('address', res.address); updateField('latitude', res.latitude); updateField('longitude', res.longitude); }} />

      {/* 购票信息 */}
      <TicketPanel needReservation={item.needReservation} ticketChannel={item.ticketChannel} ticketPrice={item.ticketPrice} onToggle={(v) => updateField('needReservation', v)} onChannelChange={(v) => updateField('ticketChannel', v)} onPriceChange={(v) => updateField('ticketPrice', v)} />

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
