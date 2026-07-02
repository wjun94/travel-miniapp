import { View, Text, Input, Picker } from '@tarojs/components';
import { channelOptions } from '@/constants/travel';

interface Props {
  needReservation: boolean;
  ticketChannel: string;
  ticketPrice: number | null;
  onToggle: (need: boolean) => void;
  onChannelChange: (channel: string) => void;
  onPriceChange: (price: number | null) => void;
}

export default function TicketPanel({ needReservation, ticketChannel, ticketPrice, onToggle, onChannelChange, onPriceChange }: Props) {
  return (
    <View className='p-3 bg-green-50/20 rounded-2xl border border-green-500/5 space-y-3 box-border'>
      <View className='flex justify-between items-center box-border'>
        <Text className='text-gray-700 text-[26px] font-medium'>预约/购票需求</Text>
        <View className='flex bg-gray-100 rounded-lg p-0.5 box-border'>
          <View onClick={() => onToggle(true)} className={`px-3 py-1 rounded-md text-[24px] font-bold transition-all ${needReservation ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500'}`}>需要</View>
          <View onClick={() => onToggle(false)} className={`px-3 py-1 rounded-md text-[24px] font-bold transition-all ${!needReservation ? 'bg-gray-400 text-white shadow-sm' : 'text-gray-500'}`}>不需要</View>
        </View>
      </View>
      {needReservation && (
        <View className='space-y-3 pt-1 px-2 rounded-10px border-t border-dashed border-gray-100 box-border'>
          <View className='flex justify-between items-center py-0.5 box-border'>
            <Text className='text-gray-600 text-[26px]'>购票渠道</Text>
            <Picker mode='selector' range={channelOptions} value={channelOptions.indexOf(ticketChannel)} onChange={(e) => onChannelChange(channelOptions[Number(e.detail.value)])}>
              <Text className='text-green-600 font-medium text-[26px]'>{ticketChannel || '选择渠道 ▾'}</Text>
            </Picker>
          </View>
          <View className='flex justify-between items-center py-0.5 box-border'>
            <Text className='text-gray-600 text-[26px]'>预计票价</Text>
            <View className='flex items-center bg-gray-50 rounded-lg px-2 border border-gray-200/60 box-border w-[220px] h-[60px]'>
              <Input type='digit' className='w-full h-full text-right pr-1 text-[26px] font-bold text-gray-800' placeholder='输入0为免费' placeholderStyle='color: #9ca3af; font-size: 24rpx; font-weight: normal;' value={ticketPrice !== null ? String(ticketPrice) : ''} onInput={(e) => { const v = e.detail.value; onPriceChange(v === '' ? null : Number(v)); }} />
              <Text className='text-[22px] text-gray-400 flex-shrink-0 ml-1'>元</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
