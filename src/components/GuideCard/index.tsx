import { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Avatar, CoverImage, Image } from '@/components';
import CalendarSvg from '@/assets/img/calendar.svg';
import LandmarkSvg from '@/assets/img/landmark.svg';
import TeamSvg from '@/assets/img/team.svg';
import type { Guide } from '@/api/post';
import { likeTravelGuide, unlikeTravelGuide } from '@/api/guide';
import { likePartner, unlikePartner } from '@/api/partner';

interface GuideCardProps {
  item: any | Guide;
  isLiked?: boolean;
  likeCount?: number;
  onLike?: (item: any) => void;
  justViewedId?: string;
}

/**
 * 攻略/行程卡片组件
 * @property item 数据项，兼容 Guide / FeedItem / FavoriteItem 格式
 * @property isLiked 外部点赞状态（可选），优先级高于 item.isLiked
 * @property likeCount 外部点赞数（可选），优先级高于 item.likeCount
 * @property onLike 自定义点赞回调（可选），传入后将替换内部点赞逻辑
 * @property justViewedId 当前刚浏览过的 ID（可选），传入后该卡片显示「刚刚看过」蒙层
 */
export default function GuideCard({
  item,
  isLiked: propIsLiked,
  likeCount: propLikeCount,
  onLike,
  justViewedId,
}: GuideCardProps) {
  const itemId = item.id ?? item.targetId;
  const itemType = item.itemType ?? item.targetType;
  const isTrip = itemType === 'trip';
  const isPartner = itemType === 'partner';
  const isJustViewed = justViewedId === itemId;

  // 内部点赞状态（当外部未提供时使用）
  const [internalLiked, setInternalLiked] = useState<boolean | undefined>(
    undefined,
  );
  const [internalLikeCount, setInternalLikeCount] = useState<
    number | undefined
  >(undefined);

  const isLiked = propIsLiked ?? internalLiked ?? item.isLiked ?? false;
  const likeCount = propLikeCount ?? internalLikeCount ?? item.likeCount ?? 0;

  const handleLike = useCallback(
    async (e: any) => {
      e.stopPropagation();
      if (onLike) {
        onLike(item);
        return;
      }
      if (!isLiked) {
        if (isPartner) await likePartner(itemId);
        else await likeTravelGuide(itemId);
      } else {
        if (isPartner) await unlikePartner(itemId);
        else await unlikeTravelGuide(itemId);
      }
      setInternalLiked(!isLiked);
      setInternalLikeCount(likeCount + (isLiked ? -1 : 1));
    },
    [item, itemId, isLiked, likeCount, onLike],
  );

  const handleClick = () => {
    if (isPartner) {
      Taro.navigateTo({ url: `/pages/partner/detail/index?id=${itemId}` });
      return;
    }
    const page = itemType === 'trip' ? 'trip' : 'guide';
    Taro.navigateTo({ url: `/pages/${page}/detail/index?id=${itemId}` });
  };

  return (
    <View
      className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-stone-100 w-full box-border"
      onClick={handleClick}
    >
      <View className="w-full h-44 relative">
        <CoverImage src={item.coverImage} title={item.title} titleClassName="px-4" className="w-full h-44 max-h-44" />

        {/* 刚刚看过蒙层 */}
        {isJustViewed && (
          <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Text className="text-white text-xs bg-black/40 px-2 py-1 rounded-full">
              刚刚看过
            </Text>
          </View>
        )}

        {/* 类型标签 */}
        <View className="absolute top-2 left-2 z-10 flex flex-row items-center">
          {isTrip ? (
            <View className="bg-amber-500/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm flex items-center">
              <Text className="iconfont icon-suitcase text-30px text-white mr-6px" />
              <Text className="text-[22px] text-white font-bold">行程路线</Text>
            </View>
          ) : isPartner ? (
            <View className="bg-orange-500/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm flex items-center">
              <Image src={TeamSvg} className="h-4 min-w-4 w-4 mr-6px" />
              <Text className="text-[22px] text-white font-bold">结伴搭子</Text>
            </View>
          ) : (
            <View className="bg-sky-500/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm flex items-center">
              <Text className="iconfont icon-book text-32px text-white mr-6px" />
              <Text className="text-[22px] text-white font-bold">实用攻略</Text>
            </View>
          )}
        </View>
      </View>

      <View className="p-2.5 flex flex-col">
        <Text className="font-bold text-[26px] text-stone-800 leading-snug line-clamp-2 mb-1.5">
          {item.title}
        </Text>

        {(item.tripDays || item.sectionCount) && (
          <View className="flex flex-row items-center gap-2 mb-1.5">
            {item.tripDays && (
              <View className="bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
                <Image src={CalendarSvg} className="h-3.5 w-3.5 mr-6px" />
                <Text className="text-[22px] text-emerald-600 font-medium">
                  {item.tripDays}天
                </Text>
              </View>
            )}
            {item.sectionCount && (
              <View className="bg-stone-50 px-2 py-0.5 rounded-full flex items-center">
                <Image src={LandmarkSvg} className="h-3.5 w-3.5 mr-6px" />
                <Text className="text-[22px] text-stone-500 font-medium">
                  {item.sectionCount}个行程
                </Text>
              </View>
            )}
          </View>
        )}

        <View className="flex flex-row items-center justify-between mt-auto">
          {(item.authorAvatar || item.authorName) && (
            <View className="flex flex-row items-center flex-1 min-w-0 mr-2">
              <Avatar
                name={item.authorName}
                src={item.authorAvatar}
                className="w-[36px] h-[36px] text-16px rounded-full flex-shrink-0"
              />
              <Text className="text-[22px] text-stone-500 ml-1 truncate flex-1">
                {item.authorName}
              </Text>
            </View>
          )}
          <View
            className="flex flex-row items-center flex-shrink-0 text-stone-400 active:scale-90 transition-transform"
            onClick={handleLike}
          >
            <Text
              className={`iconfont leading-none mr-1 ${isLiked ? 'icon-follow-fill text-red-400' : 'icon-follow'}`}
            />
            <Text className="text-[22px]">{likeCount || '点赞'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
