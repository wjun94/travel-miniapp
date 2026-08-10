import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useSetState, useRequest } from 'ahooks';
import {
  createTravelGuide,
  updateTravelGuide,
  getTravelGuideDetail,
} from '@/api/guide';
import { difficultyOptions } from '@/constants/travel';
import { uploadSingleFile } from '@/utils/upload';
import { Image } from '@/components';
import JourneySvg from '@/assets/img/journey.svg';

// 定义表单的状态类型
interface FormState {
  title: string;
  destination: string;
  summary: string;
  minBudget: string;
  maxBudget: string;
  bestSeason: string;
  days: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetGroups: string[];
  isOriginal: boolean;
  isOverseas: number; // 境内境外：0国内 1境外
  coverImage: string;
}

export default function BasicInfoPage() {
  // 编辑模式：URL 携带 draftId 时加载草稿数据
  const params = Taro.getCurrentInstance().router?.params;
  const draftId = (params?.draftId as string) || '';
  const [dayCount, setDayCount] = useState(0);

  // 使用 ahooks 的 useSetState 统一管理复杂的表单字段
  const [formState, setFormState] = useSetState<FormState>({
    title: '',
    destination: '',
    summary: '',
    minBudget: '',
    maxBudget: '',
    bestSeason: '',
    days: '',
    difficulty: 'easy',
    targetGroups: [],
    isOriginal: true,
    isOverseas: 0,
    coverImage: '',
  });

  const groups = ['家庭', '情侣', '背包客', '独行者', '好友'];

  const handleChooseCover = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
      });
      const data = await uploadSingleFile(res.tempFilePaths[0]);
      if (data?.url) setFormState({ coverImage: data.url });
    } catch {
      /* ignore */
    }
  };

  // 从 where 页获取已选目的地（每次页面显示时刷新）
  useDidShow(() => {
    const saved = Taro.getStorageSync('TEMP_GUIDE_DESTINATION');
    if (saved) {
      // 兼容旧缓存：无国内外标记时保持默认（国内）
      const overseas = Taro.getStorageSync('TEMP_GUIDE_OVERSEAS');
      setFormState({
        destination: saved,
        isOverseas: typeof overseas === 'number' ? overseas : 0,
      });
    }
    const plans: any[] = Taro.getStorageSync('TEMP_ITINERARY_PLANS') || [];
    setDayCount(Array.isArray(plans) ? plans.length : 0);
  });

  // 编辑草稿：加载草稿详情填充表单与行程安排缓存
  useEffect(() => {
    if (!draftId) return;
    getTravelGuideDetail(draftId)
      .then((detail: any) => {
        if (!detail) return;
        setFormState({
          title: detail.title || '',
          destination: detail.destination || '',
          summary: detail.summary || '',
          minBudget: detail.budgetMin != null ? String(detail.budgetMin) : '',
          maxBudget: detail.budgetMax != null ? String(detail.budgetMax) : '',
          bestSeason: detail.bestSeason || '',
          days: detail.recommendedDays ? String(detail.recommendedDays) : '',
          difficulty: (detail.difficulty as any) || 'easy',
          targetGroups: (detail.tags || '').split(',').filter(Boolean),
          isOriginal: detail.isOriginal === 1,
          isOverseas: detail.isOverseas || 0,
          coverImage: detail.coverImage || '',
        });
        Taro.setStorageSync('TEMP_GUIDE_OVERSEAS', detail.isOverseas || 0);
        if (detail.destination) {
          Taro.setStorageSync('TEMP_GUIDE_DESTINATION', detail.destination);
        }
        if (Array.isArray(detail.days) && detail.days.length > 0) {
          const plans = detail.days.map((day: any) => ({
            dayIndex: day.dayNumber || 1,
            date: day.date || '',
            title: day.title || '',
            items: (day.items || []).map((item: any) => ({
              id: item.id || `${Date.now()}-${Math.random()}`,
              sectionType: item.sectionType || 'attraction',
              title: item.title || '',
              description: item.description || '',
              startTime: item.startTime || '',
              endTime: item.endTime || '',
              latitude: item.latitude ?? null,
              longitude: item.longitude ?? null,
              address: item.address || '',
              images: item.images || [],
              needReservation: !!item.needReservation,
              ticketChannel: item.ticketChannel || '',
              ticketPrice: item.ticketPrice ?? null,
              startAddress: item.startPoint || '',
              startLatitude: item.startLat ?? null,
              startLongitude: item.startLng ?? null,
              endAddress: item.endPoint || '',
              endLatitude: item.endLat ?? null,
              endLongitude: item.endLng ?? null,
              transportMode: item.transportMode || 'bus',
            })),
          }));
          Taro.setStorageSync('TEMP_ITINERARY_PLANS', plans);
          setDayCount(plans.length);
        }
      })
      .catch(() => {});
  }, [draftId]);

  const { runAsync: createRunAsync, loading: createLoading } = useRequest(
    createTravelGuide,
    {
      manual: true,
    },
  );
  // 处理适用群体的多选/反选逻辑
  const toggleGroup = (group: string) => {
    const { targetGroups } = formState;
    if (targetGroups.includes(group)) {
      setFormState({ targetGroups: targetGroups.filter((g) => g !== group) });
    } else if (targetGroups.length < 5) {
      setFormState({ targetGroups: [...targetGroups, group] });
    }
  };

  // 最终组装数据并请求后端接口
  const handleSubmit = async (isPublish: boolean) => {
    const {
      title,
      destination,
      summary,
      minBudget,
      maxBudget,
      bestSeason,
      days,
      targetGroups,
      difficulty,
      isOriginal,
      coverImage,
    } = formState;

    if (!title || !destination) {
      Taro.showToast({ title: '请完善基本必填信息', icon: 'error' });
      return;
    }

    const cachedItinerary = Taro.getStorageSync('TEMP_ITINERARY_PLANS') || [];

    const payload = {
      title,
      coverImage,
      destination,
      summary,
      budgetMin: minBudget ? parseFloat(minBudget) : null,
      budgetMax: maxBudget ? parseFloat(maxBudget) : null,
      bestSeason: bestSeason || '',
      recommendedDays: days ? parseInt(days, 10) : null,
      tags: targetGroups.join(','),
      difficulty,
      crowdType: targetGroups.join(','),
      isOriginal: isOriginal ? 1 : 0,
      isOverseas: formState.isOverseas || 0,
      status: isPublish ? 1 : 0,
      days: cachedItinerary.map((day: any) => ({
        date: day.date ? `${day.date}T00:00:00Z` : null,
        title: day.title,
        items: day.items.map((item: any) => ({
          sectionType: item.sectionType,
          title: item.title,
          description: item.description,
          startTime: item.startTime || null,
          endTime: item.endTime || null,
          latitude: item.latitude,
          longitude: item.longitude,
          address: item.address,
          // 交通类型专属字段
          transportMode: item.transportMode,
          startAddress: item.startAddress,
          startLatitude: item.startLatitude,
          startLongitude: item.startLongitude,
          endAddress: item.endAddress,
          endLatitude: item.endLatitude,
          endLongitude: item.endLongitude,
          // 购票相关字段
          needReservation: item.needReservation,
          ticketChannel: item.ticketChannel,
          ticketPrice: item.ticketPrice,
          // 图片
          images: item.images,
        })),
      })),
    };

    if (draftId) {
      await updateTravelGuide(draftId, payload as any);
    } else {
      await createRunAsync(payload as any);
    }

    setTimeout(() => {
      setTimeout(() => {
        Taro.removeStorageSync('TEMP_ITINERARY_PLANS');
        Taro.removeStorageSync('TEMP_GUIDE_DESTINATION');
        Taro.removeStorageSync('TEMP_GUIDE_DATES');
      }, 500);
      Taro.switchTab({ url: '/pages/publish/index/index' });
    }, 1500);
  };

  return (
    <View className="min-h-screen bg-gray-50 pb-28 text-gray-800">
      {/* 封面 */}
      <View className="px-4 mt-4">
        <View
          className="relative w-full h-44 bg-gray-100 rounded-xl overflow-hidden shadow-sm active:opacity-95"
          onClick={handleChooseCover}
        >
          {formState.coverImage ? (
            <>
              <Image
                src={formState.coverImage}
                className="w-full h-full"
                mode="aspectFill"
              />
              <View className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Text className="text-white font-medium">点击更换封面</Text>
              </View>
            </>
          ) : (
            <View className="w-full h-full flex flex-col items-center justify-center active:bg-gray-200">
              <Text className="text-gray-300 text-4xl font-light mb-1">+</Text>
              <Text className="text-gray-400">添加封面图片</Text>
              <Text className="text-gray-300 text-xs mt-1">
                建议尺寸 16:9，展示效果更佳
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 行程安排入口（编辑草稿时可直接调整每日行程） */}
      <View className="m-4">
        <View
          className="bg-white rounded-2xl p-4 shadow-sm flex flex-row items-center justify-between active:opacity-80"
          onClick={() =>
            Taro.navigateTo({ url: '/pages/guide/itinerary/index' })
          }
        >
          <View className="flex flex-col">
            <View className="flex flex-row items-center">
              <Image src={JourneySvg} className="w-5 h-5 mr-1" />
              <Text className="text-sm font-bold text-gray-800">行程安排</Text>
            </View>
            <Text className="text-xs text-gray-400 mt-1">
              {dayCount > 0
                ? `已规划 ${dayCount} 天，点击编辑每日行程`
                : '尚未规划每日行程，点击前往编辑'}
            </Text>
          </View>
          <Text className="text-gray-400 text-sm">编辑 ›</Text>
        </View>
      </View>

      {/* 基本参数配置 */}
      <View className="m-4 p-4 bg-white rounded-2xl shadow-sm space-y-5">
        <Text className="text-lg font-bold block border-b border-gray-100 pb-2">
          基本信息配置
        </Text>

        {/* 1. 标题输入框 */}
        <View className="space-y-1.5">
          <Text className="text-sm font-medium text-gray-700">
            <Text className="text-red-500">*</Text> 标题
          </Text>
          <View>
            <Input
              className="w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border"
              placeholder="请输入攻略标题"
              value={formState.title}
              onInput={(e) => setFormState({ title: e.detail.value })}
            />
          </View>
        </View>

        {/* 2. 目的地 */}
        <View className="space-y-1.5">
          <Text className="text-sm font-medium text-gray-700">
            <Text className="text-red-500">*</Text> 目的地
          </Text>
          <View
            className="bg-gray-50 rounded-xl px-3 py-3"
            onClick={() =>
              Taro.navigateTo({ url: '/pages/guide/where/index?from=basic' })
            }
          >
            <Text className="text-[28px] text-gray-800">
              {formState.destination || '请先在「想去哪儿」选择目的地'}
            </Text>
          </View>
        </View>

        {/* 3. 摘要介绍 */}
        <View className="space-y-1.5">
          <Text className="text-sm font-medium text-gray-700">摘要介绍</Text>
          <View className="relative bg-gray-50 rounded-xl p-3">
            <Textarea
              autoHeight
              disableDefaultPadding
              showConfirmBar={false}
              className="w-full min-h-[140px] pb-6 text-[28px] bg-transparent leading-normal box-border"
              placeholderStyle="color: #9ca3af"
              placeholder="简述这趟精彩行程的核心亮点..."
              maxlength={150}
              value={formState.summary}
              onInput={(e) => setFormState({ summary: e.detail.value })}
            />
            <Text className="absolute bottom-2 right-3 text-xs text-gray-400 z-10 bg-gray-50/80 px-1 rounded">
              {formState.summary.length}/150
            </Text>
          </View>
        </View>

        {/* 4. 预算输入框 */}
        <View className="space-y-1.5">
          <Text className="text-sm font-medium text-gray-700">
            预算范围 (可选)
          </Text>
          <View className="flex items-center space-x-2">
            <Input
              className="flex-1 h-[80px] px-2 bg-gray-50 rounded-xl text-[28px] text-center box-border"
              placeholder="￥ 最低"
              type="digit"
              value={formState.minBudget}
              onInput={(e) => setFormState({ minBudget: e.detail.value })}
            />
            <Text className="text-gray-400">~</Text>
            <Input
              className="flex-1 h-[80px] px-2 bg-gray-50 rounded-xl text-[28px] text-center box-border"
              placeholder="￥ 最高"
              type="digit"
              value={formState.maxBudget}
              onInput={(e) => setFormState({ maxBudget: e.detail.value })}
            />
          </View>
        </View>

        {/* 5. 最佳季节 */}
        <View className="space-y-1.5">
          <Text className="text-sm font-medium text-gray-700">
            最佳季节 (可选)
          </Text>
          <View>
            <Input
              className="w-full h-[80px] px-3 bg-gray-50 rounded-xl text-[28px] box-border"
              placeholder="如：11月至次年2月"
              value={formState.bestSeason}
              onInput={(e) => setFormState({ bestSeason: e.detail.value })}
            />
          </View>
        </View>

        {/* 6. 建议天数 */}
        <View className="space-y-1.5">
          <Text className="text-sm font-medium text-gray-700">
            建议游玩天数 (可选)
          </Text>
          <View className="flex items-center bg-gray-50 rounded-xl px-3 h-[80px] box-border">
            <Input
              className="flex-1 text-[28px] bg-transparent h-full"
              placeholder="建议天数"
              type="number"
              value={formState.days}
              onInput={(e) => setFormState({ days: e.detail.value })}
            />
            <Text className="text-sm text-gray-500 pr-1 shrink-0">天</Text>
          </View>
        </View>

        {/* 游玩难度 */}
        <View className="space-y-2">
          <Text className="text-sm font-medium text-gray-700">游玩难度</Text>
          <View className="flex space-x-3">
            {difficultyOptions.map((item) => (
              <View
                key={item.key}
                onClick={() => setFormState({ difficulty: item.key as any })}
                className={`flex-1 py-2 text-center text-xs font-medium rounded-xl border m-0 ${formState.difficulty === item.key ? 'bg-green-50 text-green-600 border-green-500' : 'bg-gray-50 text-gray-600 border-transparent'}`}
              >
                {item.label}
              </View>
            ))}
          </View>
        </View>

        {/* 适用群体 */}
        <View className="space-y-2">
          <Text className="text-sm font-medium text-gray-700">
            适用群体 (可多选)
          </Text>
          <View className="flex flex-wrap gap-2">
            {groups.map((group) => {
              const isSelected = formState.targetGroups.includes(group);
              return (
                <View
                  key={group}
                  onClick={() => toggleGroup(group)}
                  className={`px-4 py-1.5 text-xs text-center rounded-xl border m-0 ${isSelected ? 'bg-green-50 text-green-600 border-green-500' : 'bg-gray-50 text-gray-500 border-transparent'}`}
                >
                  {group}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* 底部悬浮控制台 */}
      <View className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex space-x-4 z-50 shadow-md">
        <Button
          disabled={createLoading}
          onClick={() => handleSubmit(false)}
          className="flex-1 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-full flex items-center justify-center m-0"
        >
          存草稿
        </Button>
        <Button
          disabled={createLoading}
          onClick={() => handleSubmit(true)}
          className="flex-[1.5] py-3 text-sm font-medium bg-green-500 text-white rounded-full flex items-center justify-center m-0 active:opacity-90"
        >
          确认发布
        </Button>
      </View>
    </View>
  );
}
