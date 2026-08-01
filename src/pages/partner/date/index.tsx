import { useState, useMemo, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, PickerView, PickerViewColumn } from '@tarojs/components';

interface DateMeta {
  startDate: string;
  endDate: string;
  totalDays: number;
  flexDays: number;
}

export default function PartnerDatePicker() {
  const router = Taro.getCurrentInstance().router?.params;
  const from = router?.from || '';

  const [activeTab, setActiveTab] = useState<'specific' | 'flexible'>('flexible');

  // 当前查看的年、月（可以做成通过按钮切换）
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);

  // 灵活日期状态：最多40天
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const flexibleDaysOptions = useMemo(() => Array.from({ length: 40 }, (_, i) => `${i + 1}天`), []);

  // 具体日期状态：开始与结束日期字符串
  const [startDate, setStartDate] = useState<string | null>('');
  const [endDate, setEndDate] = useState<string | null>('');

  // 目的地（来自 partner/where 已选目的地）
  const [destination, setDestination] = useState<string>('');

  useEffect(() => {
    const dest = Taro.getStorageSync('TEMP_PARTNER_DESTINATION');
    if (dest) setDestination(dest);
  }, []);

  // 保存日期并进入行程规划页
  const handleNext = () => {
    if (activeTab === 'specific') {
      if (!startDate) {
        Taro.showToast({ title: '请选择出发日期', icon: 'none' });
        return;
      }
      const end = endDate || startDate;
      const totalDays = end === startDate
        ? 1
        : Math.ceil((new Date(end).getTime() - new Date(startDate).getTime()) / 86400000) + 1;
      const meta: DateMeta = { startDate, endDate: end, totalDays, flexDays: 0 };
      Taro.setStorageSync('TEMP_PARTNER_DATES', meta);
      jumpNext();
    } else {
      const days = selectedDayIndex + 1;
      const meta: DateMeta = { startDate: '', endDate: '', totalDays: days, flexDays: days };
      Taro.setStorageSync('TEMP_PARTNER_DATES', meta);
      jumpNext();
    }
  };

  // 从 basic 返回时直接返回，否则进入行程规划页
  const jumpNext = () => {
    if (from === 'basic') {
      Taro.navigateBack();
    } else {
      Taro.navigateTo({ url: '../itinerary/index' });
    }
  };

  /**
   * 动态生成 6x7 矩阵的日历数据
   */
  const calendarDays = useMemo(() => {
    const days: { day: number; dateStr: string; isCurrentMonth: boolean; isToday?: boolean }[] = [];

    // 1. 获取目标月的第一天是星期几 (0: 周日, 1: 周一, ..., 6: 周六)
    // 根据 UI 图，星期排列为：七、一、二、三、四、五、六，所以周日(0)在第一列
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

    // 2. 获取目标月总天数
    const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // 3. 获取上个月的总天数（用于向前补齐）
    const totalDaysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

    // 4. 填充上个月的尾巴天数
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDay = totalDaysInPrevMonth - i;
      // 这里的月份处理需要注意边界
      const pMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const pYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      days.push({ day: prevDay, dateStr, isCurrentMonth: false });
    }

    // 5. 填充当月天数
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr // 动态判断是否为今天
      });
    }

    // 6. 填充下个月的开头天数，补齐到 42 个格子 (6行 x 7列)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr, isCurrentMonth: false });
    }

    return days;
  }, [currentYear, currentMonth]);

  // 处理月份切换
  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };

  // 检查日期状态以匹配 UI 样式
  const getDayStyle = (dateStr: string) => {
    if (!startDate) return { containerClass: '', textClass: 'text-gray-900' };

    if (dateStr === startDate && !endDate) {
      return { containerClass: 'bg-emerald-500 rounded-full text-white', textClass: 'text-white' };
    }
    if (dateStr === startDate) {
      return { containerClass: 'bg-emerald-500 rounded-l-full text-white rounded-r-none', textClass: 'text-white' };
    }
    if (endDate && dateStr === endDate) {
      return { containerClass: 'bg-emerald-500 rounded-r-full text-white rounded-l-none', textClass: 'text-white' };
    }
    if (endDate && new Date(dateStr) > new Date(startDate) && new Date(dateStr) < new Date(endDate)) {
      return { containerClass: 'bg-emerald-500/20 text-emerald-600', textClass: 'text-emerald-700 font-bold' };
    }
    return { containerClass: '', textClass: '' };
  };

  // 处理日历点击
  const handleDateClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate(null);
    } else {
      if (new Date(dateStr) < new Date(startDate)) {
        setStartDate(dateStr);
      } else {
        setEndDate(dateStr);
      }
    }
  };

  return (
    <View className="flex flex-col h-screen bg-white text-gray-900 font-sans pb-safe">
      {/* 城市标签 */}
      <View className="px-6 py-2 flex items-center flex-wrap gap-2">
        {destination ? (
          <View className="flex items-center bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium border border-emerald-100/50">
            <Text>{destination}</Text>
          </View>
        ) : (
          <Text className="text-gray-400 text-sm">未选择目的地</Text>
        )}
      </View>

      {/* 大标题 */}
      <View className="px-6 pt-6 pb-10">
        <Text className="text-60px font-extrabold tracking-wide">想去多久</Text>
      </View>

      {/* Tab 选项卡 */}
      <View className="flex border-b border-gray-100">
        <View
          className={`flex-1 text-center pb-3 text-base font-medium relative transition-colors ${activeTab === 'specific' ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}
          onClick={() => setActiveTab('specific')}
        >
          具体日期
          {activeTab === 'specific' && <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </View>
        <View
          className={`flex-1 text-center pb-3 text-base font-medium relative transition-colors ${activeTab === 'flexible' ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}
          onClick={() => setActiveTab('flexible')}
        >
          灵活日期
          {activeTab === 'flexible' && <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </View>
      </View>

      {/* 主体交互区域 */}
      <View className="p-6 flex-1 flex flex-col overflow-hidden">
        <ScrollView scrollY className="flex-1">
          {activeTab === 'flexible' ? (
            /* 灵活日期：支持上下滚动的 PickerView 视图 */
            <View className="flex flex-col items-center justify-center h-full">
              <PickerView
                indicatorStyle="height: 60px;"
                className="w-full h-full"
                value={[selectedDayIndex]}
                onChange={(e) => setSelectedDayIndex(e.detail.value[0])}
              >
                <PickerViewColumn>
                  {flexibleDaysOptions.map((item, index) => (
                    <View
                      key={item}
                      className={`flex items-center justify-center text-2xl font-bold transition-all ${index === selectedDayIndex ? 'text-emerald-500 text-3xl font-black' : 'text-gray-300'}`}
                    >
                      {item}
                    </View>
                  ))}
                </PickerViewColumn>
              </PickerView>
            </View>
          ) : (
            /* 具体日期：带区间高亮选择的日历视图 */
            <View className="animate-fadeIn">
              {/* 动态显示的月份及切换控制 */}
              <View className="flex items-center justify-between px-4 mb-6">
                <Text className="text-gray-400 text-lg px-2 active:opacity-50" onClick={() => changeMonth('prev')}><Text className='iconfont icon-next-copy' /></Text>
                <Text className="text-lg font-bold tracking-wide">{`${currentYear}年${String(currentMonth).padStart(2, '0')}月`}</Text>
                <Text className="text-gray-400 text-lg px-2 active:opacity-50" onClick={() => changeMonth('next')}><Text className='iconfont icon-next' /></Text>
              </View>

              <View className="grid grid-cols-7 gap-y-4 text-center text-sm font-medium text-gray-400 mb-2">
                <Text>七</Text><Text>一</Text><Text>二</Text><Text>三</Text><Text>四</Text><Text>五</Text><Text>六</Text>
              </View>

              {/* 渲染动态生成的日历阵列 */}
              <View className="grid grid-cols-7 gap-y-3 text-center text-base font-semibold">
                {calendarDays.map((item, index) => {
                  const { containerClass, textClass } = getDayStyle(item.dateStr);
                  return (
                    <View
                      key={index}
                      onClick={() => handleDateClick(item.dateStr)}
                      className={`relative py-2 flex items-center justify-center transition-all ${containerClass}`}
                    >
                      <Text className={`${item.isCurrentMonth ? (textClass || 'text-gray-900') : 'text-gray-200'}`}>
                        {item.day}
                      </Text>
                      {item.isToday && !containerClass.includes('bg-emerald-500') && (
                        <View className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full" />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* 底部操作区：跳过 | 下一步 */}
      <View className="px-6 py-4 flex items-center border-t border-gray-50 bg-white">
        <Text onClick={jumpNext} className="text-gray-400 text-base font-medium tracking-wide active:text-gray-600 shrink-0 mr-3">跳过</Text>
        <View
          onClick={handleNext}
          className="flex-1 bg-emerald-500 active:bg-emerald-600 text-white text-center py-3.5 rounded-full font-bold text-base shadow-sm tracking-widest transition-colors"
        >
          下一步
        </View>
      </View>
    </View>
  );
}
