import { View, Text, Input, Picker } from '@tarojs/components';
import { typeConfigMap, transportMethods, getTransportLabel } from '@/constants/travel';
import LocationPicker from './LocationPicker';

interface Props {
  item: any;
  updateField: (field: string | Record<string, any>, value?: any) => void;
}

const cfg = typeConfigMap.transport;

export default function TransportForm({ item, updateField }: Props) {
  return (
    <View className='space-y-4 box-border'>
      {/* 交通方式 */}
      <View className='box-border'>
        <Text className='text-gray-700 text-[26px] font-medium'>交通方式<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
        <Picker
          mode='selector'
          range={transportMethods}
          rangeKey='label'
          value={transportMethods.findIndex(m => m.value === (item.transportMode || 'bus'))}
          onChange={(e) => {
            const idx = Number(e.detail.value);
            const mode = transportMethods[idx];
            if (mode) updateField('transportMode', mode.value);
          }}
        >
          <View className='flex justify-between items-center px-2.5 py-3 bg-gray-50 rounded-xl mt-1.5 box-border'>
            <Text className='text-gray-700 text-[26px] font-medium'>{getTransportLabel(item.transportMode || 'bus')}</Text>
            <Text className='text-gray-400 text-[24px]'>▾</Text>
          </View>
        </Picker>
      </View>
      {/* 时间 */}
      <View className='box-border'>
        <Text className='text-gray-700 text-[26px] font-medium'>时间<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
        <View className='flex items-center gap-1 flex-1 mt-1.5'>
          <Picker mode='time' value={item.startTime || ''} onChange={(e) => updateField('startTime', e.detail.value)} className='flex-1'>
            <View className='p-2.5 bg-gray-50 rounded-xl text-center text-[26px] text-gray-600 border border-gray-100 active:bg-gray-100 box-border'>⏱️ {item.startTime || '出发'}</View>
          </Picker>
          <Text className='text-gray-300 font-bold'>→</Text>
          <Picker mode='time' value={item.endTime || ''} start={item.startTime || ''} onChange={(e) => updateField('endTime', e.detail.value)} className='flex-1'>
            <View className='p-2.5 bg-gray-50 rounded-xl text-center text-[26px] text-gray-600 border border-gray-100 active:bg-gray-100 box-border'>⏱️ {item.endTime || '到达'}</View>
          </Picker>
        </View>
      </View>

      {/* 起终点位置 */}
      <View className='grid grid-cols-2 gap-2 box-border'>
        <LocationPicker title='起点' label='起点' address={item.startAddress || ''} latitude={item.startLatitude} longitude={item.startLongitude} onPick={(res) => { updateField({ startAddress: res.address, startLatitude: res.latitude, startLongitude: res.longitude }); }} />
        <LocationPicker title='终点' label='终点' address={item.endAddress || ''} latitude={item.endLatitude} longitude={item.endLongitude} onPick={(res) => { updateField({ endAddress: res.address, endLatitude: res.latitude, endLongitude: res.longitude }); }} />
      </View>

      {/* 描述 */}
      <View className='box-border'>
        <Text className='text-gray-700 text-[26px] font-medium'>备注<Text className='text-gray-400 font-normal text-[24px]'>（可选）</Text></Text>
        <Input
          className='w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border flex items-center mt-1.5'
          value={item.description}
          placeholder={cfg.descPlaceholder}
          placeholderStyle='color:#9ca3af'
          onInput={(e) => updateField('description', e.detail.value)}
        />
      </View>
    </View>
  );
}
