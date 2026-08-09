import { useState, useEffect, useRef } from 'react';
import { View, Text, Input, Button, ScrollView, Picker } from '@tarojs/components';
import Taro, { useDidHide, useDidShow } from '@tarojs/taro';
import Modal from '@/components/Modal';
import { Image } from '@/components';
import CalendarSvg from '@/assets/img/calendar.svg';
import { typeConfigMap, SectionType, typeOptions } from '@/constants/travel';
import TransportForm from '@/features/guide/TransportForm';
import AttractionForm from '@/features/guide/AttractionForm';
import FoodForm from '@/features/guide/FoodForm';
import HotelForm from '@/features/guide/HotelForm';
import ShoppingForm from '@/features/guide/ShoppingForm';
import TipsForm from '@/features/guide/TipsForm';
import type { AiGenerateTripData } from '@/api/trip';

interface DayItem {
  id: string;
  sectionType: SectionType;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  images: string[];
  needReservation: boolean;
  ticketChannel: string;
  ticketPrice: number | null;
  // 交通起终点
  startAddress: string;
  startLatitude: number | null;
  startLongitude: number | null;
  endAddress: string;
  endLatitude: number | null;
  endLongitude: number | null;
  // 交通方式
  transportMode: string;
}

interface DayPlan {
  dayIndex: number;
  date: string;
  title: string;
  items: DayItem[];
}

const createEmptyItem = (dayIndex: number, type: SectionType): DayItem => ({
  id: `${dayIndex}-${Date.now()}`,
  sectionType: type,
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  latitude: null,
  longitude: null,
  address: '',
  images: [],
  needReservation: false,
  ticketChannel: '',
  ticketPrice: null,
  startAddress: '',
  startLatitude: null,
  startLongitude: null,
  endAddress: '',
  endLatitude: null,
  endLongitude: null,
  transportMode: 'bus',
});

// 根据日期页选择的数据生成行程计划（天数 + 具体日期）
const buildDayPlansFromDates = (dates: any): DayPlan[] => {
  const count = dates.flexDays || dates.totalDays || 1;
  const start = dates.startDate ? new Date(dates.startDate) : null;
  return Array.from({ length: count }, (_, i) => {
    let date = '';
    if (start) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return { dayIndex: i + 1, date, title: '', items: [createEmptyItem(i + 1, 'attraction')] };
  });
};

// 将 AI 生成数据（TEMP_PARTNER_AI_GENERATED）转换为编辑页 DayPlan 结构
const convertAiDays = (aiData: AiGenerateTripData): DayPlan[] => {
  return aiData.days.map((day, idx) => ({
    dayIndex: day.dayNumber || idx + 1,
    date: day.date || '',
    title: day.title || '',
    items: (day.items || []).map(item => ({
      id: item.id,
      sectionType: item.sectionType as SectionType,
      title: item.title,
      description: item.description,
      startTime: item.startTime,
      endTime: item.endTime,
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      images: item.images || [],
      needReservation: item.needReservation,
      ticketChannel: item.ticketChannel,
      ticketPrice: item.ticketPrice,
      startAddress: item.startPoint,
      startLatitude: item.startLat,
      startLongitude: item.startLng,
      endAddress: item.endPoint,
      endLatitude: item.endLat,
      endLongitude: item.endLng,
      transportMode: item.transportMode || 'bus',
    })),
  }));
};

export default function ItineraryPage() {
  const [dayPlans, setDayPlansState] = useState<DayPlan[]>(() => {
    const params = Taro.getCurrentInstance().router?.params;

    // AI 生成数据：URL 携带 aiId 时，从缓存读取并转换为编辑结构
    const aiId = params?.aiId as string;
    if (aiId) {
      const aiData = Taro.getStorageSync('TEMP_PARTNER_AI_GENERATED') as AiGenerateTripData | undefined;
      if (aiData && aiData.id === aiId && aiData.days && aiData.days.length > 0) {
        return convertAiDays(aiData);
      }
    }

    const saved = Taro.getStorageSync('TEMP_PARTNER_ITINERARY_PLANS');
    const dates = Taro.getStorageSync('TEMP_PARTNER_DATES');
    // 已选择日期时：校验已保存行程是否与最新日期匹配（天数/具体日期），不匹配则按新日期重新生成
    if (saved && dates && (dates.flexDays || dates.totalDays)) {
      const expectedDays = dates.flexDays || dates.totalDays || 1;
      const savedDays = Array.isArray(saved) ? saved.length : 0;
      if (savedDays === expectedDays) {
        if (dates.startDate) {
          const plans = buildDayPlansFromDates(dates);
          const dateMatch = plans.every((p, i) => saved[i] && saved[i].date === p.date);
          if (dateMatch) return saved;
          return plans;
        }
        return saved;
      }
      return buildDayPlansFromDates(dates);
    }
    if (saved) return saved;
    // 从日期页读取天数与具体日期，初始化行程计划
    if (dates && (dates.flexDays || dates.totalDays)) {
      return buildDayPlansFromDates(dates);
    }
    // 兜底：AI 生成数据（仅生成未编辑时直接恢复）
    const aiData = Taro.getStorageSync('TEMP_PARTNER_AI_GENERATED') as AiGenerateTripData | undefined;
    if (aiData && aiData.id && aiData.days && aiData.days.length > 0) {
      return convertAiDays(aiData);
    }
    return [
      { dayIndex: 1, date: '', title: '', items: [createEmptyItem(1, 'attraction')] }
    ];
  });

  // 追踪是否有实际改动，无改动则不写 Storage
  const modifiedRef = useRef(false);
  const setDayPlans: typeof setDayPlansState = (value) => {
    modifiedRef.current = true;
    setDayPlansState(value);
  };

  // 用 ref 始终持有最新 dayPlans，供关闭/隐藏时保存
  const dayPlansRef = useRef(dayPlans);
  dayPlansRef.current = dayPlans;

  // 页面关闭/隐藏时自动保存（仅当有改动时）
  const saveIfModified = () => {
    if (modifiedRef.current) {
      Taro.setStorageSync('TEMP_PARTNER_ITINERARY_PLANS', dayPlansRef.current);
    }
  };
  useDidHide(saveIfModified);
  useEffect(() => {
    return saveIfModified;
  }, []);

  // 页面重新显示时（从 basic/date 返回）：若日期已变化，按最新选择重建行程
  useDidShow(() => {
    const dates = Taro.getStorageSync('TEMP_PARTNER_DATES');
    if (!dates || !(dates.flexDays || dates.totalDays)) return;
    const expectedDays = dates.flexDays || dates.totalDays || 1;
    const current = dayPlansRef.current;
    if (current.length !== expectedDays) {
      setDayPlans(buildDayPlansFromDates(dates));
      setActiveTab(1);
      return;
    }
    if (dates.startDate) {
      const plans = buildDayPlansFromDates(dates);
      const dateMatch = plans.every((p, i) => current[i] && current[i].date === p.date);
      if (!dateMatch) {
        setDayPlans(plans);
        setActiveTab(1);
      }
    }
  });

  const [activeTab, setActiveTab] = useState<number>(1);
  const [toViewId, setToViewId] = useState<string>('');
  const [toTabId, setToTabId] = useState<string>('');
  const [isClickScrolling, setIsClickScrolling] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ type: 'day' | 'item'; dayIndex: number; itemId?: string } | null>(null);

  // 类型切换确认
  const [switchConfirmVisible, setSwitchConfirmVisible] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<{ dayIndex: number; itemId: string; newType: SectionType } | null>(null);

  const getFormatDayName = (index: number) => {
    const zhNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (index <= 10) return `第${zhNums[index]}天`;
    if (index < 20) return `第十${zhNums[index % 10]}天`;
    const space = Math.floor(index / 10);
    const remainder = index % 10;
    return `第${zhNums[space]}十${remainder === 0 ? '' : zhNums[remainder]}天`;
  };

  const handleTabClick = (dayIndex: number) => {
    setIsClickScrolling(true);
    setActiveTab(dayIndex);
    setToViewId(`day-node-${dayIndex}`);
    const targetTabTarget = dayIndex > 1 ? dayIndex - 1 : 1;
    setToTabId(`tab-node-${targetTabTarget}`);
    setTimeout(() => { setIsClickScrolling(false); }, 500);
  };

  const handlePageScroll = () => {
    if (isClickScrolling) return;
    const query = Taro.createSelectorQuery();
    query.selectAll('.day-card-anchor').boundingClientRect();
    query.exec((res) => {
      if (!res || !res[0]) return;
      const nodes = res[0];
      const threshold = 120;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.top <= threshold && node.bottom > threshold) {
          const currentDayIndex = idxToDayIndex(node.id);
          if (currentDayIndex && activeTab !== currentDayIndex) {
            setActiveTab(currentDayIndex);
            const targetTabTarget = currentDayIndex > 1 ? currentDayIndex - 1 : 1;
            setToTabId(`tab-node-${targetTabTarget}`);
          }
          break;
        }
      }
    });
  };

  const idxToDayIndex = (idStr: string): number | null => {
    const match = idStr.match(/\d+$/);
    return match ? parseInt(match[0], 10) : null;
  };

  const handleAddDay = () => {
    const nextDay = dayPlans.length + 1;
    setDayPlans([...dayPlans, { dayIndex: nextDay, date: '', title: '', items: [] }]);
    Taro.showToast({ title: `已添加${getFormatDayName(nextDay)}`, icon: 'none' });
    setTimeout(() => { handleTabClick(nextDay); }, 120);
  };

  const triggerDeleteDay = (index: number) => {
    setModalTitle('确定删除这一天的全部行程吗？');
    setModalContent(`确认要将"${getFormatDayName(index + 1)}"及其包含的所有行程节点全部清空并删除吗？`);
    setPendingDelete({ type: 'day', dayIndex: index });
    setModalVisible(true);
  };

  // 置顶行程项（将指定项移到数组首位）
  const handlePinItem = (dayIndex: number, itemId: string) => {
    setDayPlans(dayPlans.map(day => {
      if (day.dayIndex !== dayIndex) return day;
      const idx = day.items.findIndex(item => item.id === itemId);
      if (idx <= 0) return day;
      return { ...day, items: [day.items[idx], ...day.items.filter((_, i) => i !== idx)] };
    }));
  };

  const triggerDeleteItem = (dayIndex: number, itemId: string, itemTitle: string) => {
    setModalTitle('确定删除该行程项吗？');
    setModalContent(`确认删除：${itemTitle || '未命名行程'} 吗？`);
    setPendingDelete({ type: 'item', dayIndex, itemId });
    setModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'day') {
      if (dayPlans.length <= 1 || pendingDelete.dayIndex === 0) {
        Taro.showToast({ title: '第一天行程不可删除', icon: 'none' });
        setModalVisible(false);
        return;
      }
      const updated = dayPlans.filter((_, i) => i !== pendingDelete.dayIndex).map((day, i) => ({ ...day, dayIndex: i + 1 }));
      setDayPlans(updated);
      handleTabClick(1);
    } else if (pendingDelete.type === 'item') {
      setDayPlans(dayPlans.map(day => day.dayIndex === pendingDelete.dayIndex ? { ...day, items: day.items.filter(item => item.id !== pendingDelete.itemId) } : day));
    }
    setModalVisible(false);
    setPendingDelete(null);
  };

  // 点击添加按钮 → 直接添加默认类型（打卡地）
  const handleAddItemClick = (dayIndex: number) => {
    setDayPlans(dayPlans.map(day => {
      if (day.dayIndex === dayIndex) {
        return { ...day, items: [...day.items, createEmptyItem(day.dayIndex, 'attraction')] };
      }
      return day;
    }));
  };

  const updateItemField = (dayIndex: number, itemId: string, field: string | Record<string, any>, value?: any) => {
    setDayPlans(dayPlans.map(day => day.dayIndex === dayIndex ? {
      ...day,
      items: day.items.map(item => {
        if (item.id !== itemId) return item;
        if (typeof field === 'string') return { ...item, [field]: value };
        return { ...item, ...field };
      })
    } : day));
  };

  // 类型切换：检查是否需要确认
  const handleTypeSwitch = (dayIndex: number, itemId: string, newType: SectionType, currentItem: DayItem) => {
    const hasData = currentItem.title || currentItem.description || currentItem.address || currentItem.startAddress || currentItem.needReservation || (currentItem.images && currentItem.images.length > 0);
    if (hasData) {
      setPendingSwitch({ dayIndex, itemId, newType });
      setSwitchConfirmVisible(true);
    } else {
      setDayPlans(dayPlans.map(day => day.dayIndex === dayIndex ? { ...day, items: day.items.map(item => item.id === itemId ? { ...createEmptyItem(dayIndex, newType), id: item.id } : item) } : day));
    }
  };

  const handleConfirmSwitch = () => {
    if (!pendingSwitch) return;
    const { dayIndex, itemId, newType } = pendingSwitch;
    setDayPlans(dayPlans.map(day => day.dayIndex === dayIndex ? { ...day, items: day.items.map(item => item.id === itemId ? { ...createEmptyItem(dayIndex, newType), id: item.id } : item) } : day));
    setSwitchConfirmVisible(false);
    setPendingSwitch(null);
  };

  const handleNextStep = () => {
    for (const day of dayPlans) {
      if (day.items.length === 0) {
        Taro.showToast({ title: `${getFormatDayName(day.dayIndex)}还没有任何行程明细`, icon: 'none' });
        return;
      }
      for (const item of day.items) {
        if (item.sectionType !== 'transport' && item.sectionType !== 'tips' && !item.title) {
          const cfg = typeConfigMap[item.sectionType];
          Taro.showToast({ title: `${cfg.label}名称不能为空`, icon: 'none' });
          return;
        }
        // 避坑类型检查 title（描述）是否为空
        if (item.sectionType === 'tips' && !item.title) {
          Taro.showToast({ title: '避坑描述不能为空', icon: 'none' });
          return;
        }
      }
    }
    Taro.setStorageSync('TEMP_PARTNER_ITINERARY_PLANS', dayPlans);
    Taro.navigateTo({ url: '/pages/partner/basic/index' });
  };

  /** 根据类型渲染对应表单 */
  const renderForm = (item: DayItem, dayIndex: number) => {
    const uf = (field: string | Record<string, any>, value?: any) => updateItemField(dayIndex, item.id, field, value);
    switch (item.sectionType) {
      case 'transport': return <TransportForm item={item} updateField={uf} />;
      case 'attraction': return <AttractionForm item={item} updateField={uf} imageLabel='活动图片' />;
      case 'food': return <FoodForm item={item} updateField={uf} imageLabel='活动图片' />;
      case 'hotel': return <HotelForm item={item} updateField={uf} imageLabel='活动图片' />;
      case 'shopping': return <ShoppingForm item={item} updateField={uf} imageLabel='活动图片' />;
      case 'tips': return <TipsForm item={item} updateField={uf} />;
      default: return null;
    }
  };

  return (
    <View className='w-full h-screen bg-gray-50 text-gray-800 flex flex-col overflow-hidden relative text-[28px] box-border'>
      {/* 顶部固定栏 */}
      <View className='bg-white border-b border-gray-100 shadow-sm flex-shrink-0 z-40 box-border'>
        <View className='px-4 py-3 flex justify-between items-center box-border'>
          <Text className='font-bold text-gray-900 text-[28px]'>创建搭子</Text>
          <Button onClick={handleAddDay} className='m-0 px-3 py-1 bg-green-500 text-white font-medium rounded-full text-[24px]'>+ 再加一天</Button>
        </View>
        <ScrollView scrollX className='w-full whitespace-nowrap px-4 py-2 bg-gray-50 border-t border-gray-100 box-border' scrollWithAnimation scrollIntoView={toTabId}>
          {dayPlans.map((day) => (
            <View key={day.dayIndex} id={`tab-node-${day.dayIndex}`} onClick={() => handleTabClick(day.dayIndex)} className={`inline-block mr-3 px-4 py-1.5 rounded-full font-bold transition-all text-[24px] ${activeTab === day.dayIndex ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {getFormatDayName(day.dayIndex)}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 主体滚动卡片区域 */}
      <ScrollView scrollY className='flex-1 h-0 w-full' scrollIntoView={toViewId} scrollWithAnimation onScroll={handlePageScroll}>
        <View className='pb-12 box-border'>
          {dayPlans.map((day, dIdx) => (
            <View key={day.dayIndex} id={`day-node-${day.dayIndex}`} className='day-card-anchor mt-4 px-4 space-y-4 pb-6 border-b border-gray-200/50 last:border-0 box-border'>

              {/* 天级别卡片 */}
              <View className='bg-white p-4 rounded-2xl shadow-sm space-y-3 relative overflow-hidden box-border'>
                <View className='flex justify-between items-center'>
                  <Text className='font-bold text-gray-900 text-[28px]'>{getFormatDayName(day.dayIndex)}</Text>
                  {day.dayIndex > 1 && <Text onClick={() => triggerDeleteDay(dIdx)} className='text-red-500 text-[24px]'>删除</Text>}
                </View>
                <View className='space-y-1.5'>
                  <Text className='text-gray-700 text-[26px] font-medium'>标题</Text>
                  <View>
                    <Input className='w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border flex items-center' placeholder='当天游玩概要（可选）' value={day.title} onInput={(e) => { const updated = [...dayPlans]; updated[dIdx].title = e.detail.value; setDayPlans(updated); }} />
                  </View>
                </View>
                {/* 日期选择 */}
                <View className='space-y-1.5'>
                  <Text className='text-gray-700 text-[26px] font-medium'>日期</Text>
                  <View>
                    <Picker mode='date' value={day.date} onChange={(e) => { const updated = [...dayPlans]; updated[dIdx].date = e.detail.value; setDayPlans(updated); }}>
                      <View className='p-3 bg-gray-50 rounded-xl flex justify-between items-center'>
                        <Text className={day.date ? 'text-gray-800 text-[26px]' : 'text-gray-400 text-[26px]'}>{day.date || '点击选择日期'}</Text>
                        <Image src={CalendarSvg} className='h-3.5 w-3.5' />
                      </View>
                    </Picker>
                  </View>
                </View>
              </View>

              {/* 行程项卡片 */}
              {day.items.map((item) => {
                const cfg = typeConfigMap[item.sectionType];
                return (
                  <View key={item.id} className='bg-white p-4 rounded-2xl shadow-sm space-y-4 relative box-border'>
                    {/* 卡片头部：置顶 + 删除 */}
                    <View className='flex justify-end items-center border-b border-gray-50 box-border gap-3'>
                      <Text
                        onClick={() => handlePinItem(day.dayIndex, item.id)}
                        className='text-blue-500 font-medium active:opacity-60'
                      >
                        ↑ 置顶
                      </Text>
                      <Text
                        onClick={() => triggerDeleteItem(day.dayIndex, item.id, item.title)}
                        className='text-red-500 font-medium active:opacity-60'
                      >
                        <Text className="iconfont icon-remove" /> 删除
                      </Text>
                    </View>

                    {/* 类型选择 */}
                    <View className='space-y-1.5 box-border'>
                      <View className='flex items-center mb-1.5'>
                        <Text className='text-red-500 font-bold mr-0.5'>*</Text>
                        <Text className='text-gray-700 text-[26px] font-medium'>类型<Text className='text-gray-400 font-normal text-[24px]'>（必填）</Text></Text>
                      </View>
                      <Picker
                        mode='selector'
                        range={typeOptions}
                        rangeKey="label"
                        onChange={(e) => {
                          handleTypeSwitch(day.dayIndex, item.id, typeOptions[e.detail.value].value, item);
                        }}
                      >
                        <View className='w-full p-2.5 bg-gray-50 rounded-xl text-[28px] flex justify-between items-center active:bg-gray-100 box-border'>
                          <View className='flex items-center'>
                            <Image src={cfg.svg} className='h-3.5 w-3.5 mr-6px' />
                            <Text className='text-gray-800 font-medium'>{cfg.label}</Text>
                          </View>
                          <Text className='text-gray-400 text-[24px]'>切换 ▾</Text>
                        </View>
                      </Picker>
                    </View>

                    {/* 名称输入（交通和避坑类型不需要） */}
                    {item.sectionType !== 'transport' && item.sectionType !== 'tips' && (
                      <View className='space-y-1.5 box-border'>
                        <View className='flex items-center mb-1.5'>
                          <Text className='text-red-500 font-bold mr-0.5'>*</Text>
                          <Text className='text-gray-700 text-[26px] font-medium'>{cfg.nameLabel}<Text className='text-gray-400 font-normal text-[24px]'>（必填）</Text></Text>
                        </View>
                        <Input
                          className='w-full h-[80px] px-3 bg-gray-50 rounded-xl font-medium text-[28px] box-border flex items-center'
                          value={item.title}
                          placeholder={cfg.namePlaceholder}
                          placeholderStyle='color:#9ca3af'
                          onInput={(e) => updateItemField(day.dayIndex, item.id, 'title', e.detail.value)}
                        />
                      </View>
                    )}

                    {/* 动态表单 */}
                    {renderForm(item, day.dayIndex)}
                  </View>
                );
              })}

              {/* 添加按钮 */}
              <View className='pt-1 box-border'>
                <View onClick={() => handleAddItemClick(day.dayIndex)} className='w-full text-center py-2 bg-white border border-dashed border-green-500 text-green-500 font-bold rounded-14px text-[26px] shadow-sm active:bg-green-50/50 m-0'>
                  + 添加行程项
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 吸底动作栏 */}
      <View className='bg-white border-t border-gray-100 p-3 pb-safe flex-shrink-0 z-50 shadow-lg box-border'>
        <Button onClick={handleNextStep} className='w-full py-3 font-bold bg-green-500 text-white rounded-full text-[28px] m-0 shadow-md active:opacity-95'>下一步 (配置搭子基本信息)</Button>
      </View>

      {/* 删除确认弹窗 */}
      <Modal visible={modalVisible} title={modalTitle} onConfirm={handleConfirmDelete} onCancel={() => setModalVisible(false)}>
        <Text className='text-gray-600 block py-2 text-[26px] leading-relaxed text-center'>{modalContent}</Text>
      </Modal>

      {/* 类型切换确认弹窗 */}
      <Modal visible={switchConfirmVisible} title='切换类型' onConfirm={handleConfirmSwitch} onCancel={() => { setSwitchConfirmVisible(false); setPendingSwitch(null); }}>
        <Text className='text-gray-600 block py-2 text-[26px] leading-relaxed text-center'>切换类型后，已填写的内容将被清空，是否继续？</Text>
      </Modal>
    </View>
  );
}
