import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { NavBar, Image, CoverImage, Avatar, Modal } from '@/components';
import LocationsSvg from '@/assets/itinerary/locations.svg';
import WarningsSvg from '@/assets/itinerary/warnings.svg';
import TeamSvg from '@/assets/img/team.svg';
import CitySvg from '@/assets/img/city.svg';
import WatchSvg from '@/assets/img/watch.svg';
import HotSvg from '@/assets/img/hot.svg';
import CarSvg from '@/assets/img/car.svg';
import Taro, {
  useRouter,
  usePullDownRefresh,
  usePageScroll,
  useShareAppMessage,
  useShareTimeline,
} from '@tarojs/taro';
import { getTripDetail, likeTrip, unlikeTrip, Trip } from '@/api/trip';
import { followUser, unfollowUser } from '@/api/follow';
import { useRequest } from 'ahooks';
import { createHistoryRecord } from '@/api/history';
import {
  SECTION_MAP,
  typeConfigMap,
  getTransportLabel,
} from '@/constants/travel';
import { getHeaderHeight, openMapLocation, getImageCdnUrl } from '@/utils';
import { useAuthStore } from '@/store/authStore';
import { BottomActionBar, CommentSection } from '@/features';

export default function TripDetail() {
  const router = useRouter();
  const { id } = router.params || {};
  const headerHeight = getHeaderHeight();

  const [currentDayIdx, setCurrentDayIdx] = useState(0);
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [replyTo, setReplyTo] = useState<{
    parentId: string;
    nickname: string;
  } | null>(null);
  const [unfollowVisible, setUnfollowVisible] = useState(false);

  // 1. 获取行程详情
  const {
    data: guideData,
    mutate,
    loading,
    error,
    refresh,
  } = useRequest(() => getTripDetail(id || ''), {
    refreshDeps: [id],
    onSuccess: (data: Trip) => {
      setCurrentDayIdx(0);
      if (data) {
        createHistoryRecord({
          targetId: id || '',
          targetType: 'trip',
          title: data.title || '',
          coverImage: data.coverImage || '',
        }).catch(() => {});
      }
    },
  });

  // 此时 guideData 就是返回的 Trip 实例，我们直接将其作为 guide 映射
  const guide = guideData || ({} as Trip);
  const days = guideData?.days || [];

  // 目的地文案（cities → provinces → countries 逐级降级）
  const getDestinationText = () => {
    if (guide.cities && guide.cities.length > 0) {
      return guide.cities.join(' · ');
    }
    if (guide.provinces && guide.provinces.length > 0) {
      return guide.provinces.join(' · ');
    }
    if (guide.countries && guide.countries.length > 0) {
      return guide.countries.join(' · ');
    }
    return '';
  };

  const destinationText = getDestinationText();

  // 信息卡片（数组驱动渲染，字体最小 24px）
  const tripStats: {
    key: string;
    label: string;
    value: string;
    highlight?: boolean;
    svg?: string;
    iconClass?: string;
  }[] = [
    {
      key: 'destination',
      svg: CitySvg,
      label: '目的地',
      value: destinationText || '未设置目的地',
      iconClass: 'h-4 w-4 mr-6px',
    },
    {
      key: 'days',
      svg: WatchSvg,
      label: '规划天数',
      value: `${days.length} 天深度游`,
      iconClass: 'h-3.5 w-3.5 mr-6px',
    },
    {
      key: 'mate',
      svg: TeamSvg,
      label: '出行伴侣',
      value:
        guide.members && guide.members.length > 0
          ? `${guide.members.length} 人同行`
          : '独自探索',
      highlight: true,
      iconClass: 'h-3.5 w-3.5 mr-6px',
    },
    {
      key: 'view',
      svg: HotSvg,
      label: '浏览热度',
      value: `${guide.viewCount || 0} 次围观`,
      iconClass: 'h-3 w-3 mr-6px',
    },
  ];

  // 处理工具方法
  const getImgArray = (images: any) => {
    if (!images) return [];
    if (Array.isArray(images)) return images.slice(0, 9);
    if (typeof images === 'string')
      return images.split(',').filter(Boolean).slice(0, 9);
    return [];
  };

  const formatTimeRange = (start: string, end: string) => {
    if (!start && !end) return '全天/待定';
    return start && end ? `${start} - ${end}` : start || end;
  };

  // 各天锚点在文档中的位置缓存（滚动联动高亮天数 Tab 用）
  const dayTopsRef = useRef<number[]>([]);

  // 测量各天锚点文档位置（视口坐标 + 当前滚动偏移，滚动状态下同样准确）
  const measureDayTops = useCallback(() => {
    if (days.length === 0) return;
    const query = Taro.createSelectorQuery();
    query.selectAll('.day-node').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      if (!Array.isArray(res)) return;
      const rects = res[0] as Taro.NodesRef.BoundingClientRectCallbackResult[] | undefined;
      const viewport = res[1] as { scrollTop?: number } | undefined;
      if (rects && viewport) {
        dayTopsRef.current = rects.map((r) => r.top + (viewport.scrollTop || 0));
      }
    });
  }, [days.length]);

  // 天数数据就绪后测量锚点位置（延迟等待图片等异步渲染稳定）
  useEffect(() => {
    if (days.length === 0) return;
    const timer = setTimeout(measureDayTops, 150);
    return () => clearTimeout(timer);
  }, [days.length, measureDayTops]);

  // 页面滚动：根据滚动位置自动高亮对应天数 Tab（某天内容顶部滚到吸顶条下沿即激活）
  usePageScroll((e) => {
    if (dayTopsRef.current.length === 0) return;
    const threshold = e.scrollTop + headerHeight + 140 + 20;
    let next = 0;
    dayTopsRef.current.forEach((top, i) => {
      if (top <= threshold) next = i;
    });
    if (next !== currentDayIdx) setCurrentDayIdx(next);
  });

  const handleTabClick = (idx: number) => {
    setCurrentDayIdx(idx);
    Taro.pageScrollTo({
      selector: `#day-node-${idx}`, // 直接穿透定位
      duration: 300,
      offsetTop: -(headerHeight + 140), // 预留 NavBar 与吸顶行程概览的高度
    });
  };

  // 留言图标点击 — 锚点滚动到评论区
  const handleScrollToComments = () => {
    Taro.pageScrollTo({
      selector: '#comment-section', // 直接穿透定位
      duration: 300,
      offsetTop: -(headerHeight + 140), // 预留 NavBar 与吸顶行程概览的高度
    });
  };

  // 切换关注（取关前弹窗确认）
  const handleToggleFollow = (e) => {
    e.stopPropagation();
    if (!guide.userId) return;
    if (guide.isFollowed) {
      setUnfollowVisible(true);
    } else {
      handleFollow();
    }
  };

  const handleFollow = async () => {
    if (!guide.userId) return;
    await followUser(guide.userId);
    mutate((prev: any) => ({ ...prev, isFollowed: true }));
  };

  const handleConfirmUnfollow = async () => {
    if (!guide.userId) return;
    setUnfollowVisible(false);
    await unfollowUser(guide.userId);
    mutate((prev: any) => ({ ...prev, isFollowed: false }));
  };

  // 分享好友：标题用行程标题，携带行程 ID 与邀请码
  useShareAppMessage(() => {
    const inviteCode = useAuthStore.getState().userInfo?.inviteCode;
    return {
      title: guide?.title || '发现一个好行程，一起出发吧！',
      path: `/pages/trip/detail/index?id=${id}${inviteCode ? `&inviteCode=${inviteCode}` : ''}`,
      imageUrl: guide?.coverImage
        ? guide.coverImage
        : getImageCdnUrl('share.png'),
    };
  });

  // 分享朋友圈
  useShareTimeline(() => {
    const inviteCode = useAuthStore.getState().userInfo?.inviteCode;
    return {
      title: guide?.title || '发现一个好行程，一起出发吧！',
      query: `${id ? `id=${id}` : ''}${inviteCode ? `&inviteCode=${inviteCode}` : ''}`,
      imageUrl: guide?.coverImage
        ? guide.coverImage
        : getImageCdnUrl('share.png'),
    };
  });

  /** 刷新 */
  usePullDownRefresh(async () => {
    refresh();
    setCommentRefreshKey((v) => v + 1);
  });

  if (loading) {
    return (
      <View className="w-full h-screen flex items-center justify-center bg-stone-50 text-stone-400 text-[24px]">
        <Text>正在探索行程中...</Text>
      </View>
    );
  }

  return (
    <>
      {/* 顶部导航栏 */}
      <NavBar showBack backgroundColor="white">
        {guide?.userId ? (
          <View
            className="flex flex-row items-center flex-1"
            onClick={() =>
              Taro.navigateTo({
                url: `/pages/personal/index?userId=${guide.userId}&id${guide.id}`,
              })
            }
          >
            <Avatar
              name={guide.authorName}
              src={guide.authorAvatar}
              className="w-[48px] h-[48px] text-20px rounded-full border-2 border-white/80"
            />
            <Text className="ml-2 text-[24px] font-bold drop-shadow-md">
              {guide.authorName || ''}
            </Text>
            {!guide.isSelf && (
              <View
                onClick={handleToggleFollow}
                className={`ml-3 px-2 py-1 rounded-full border leading-0 font-medium ${guide.isFollowed ? 'bg-gray-400' : 'bg-[#F97316]'}`}
              >
                <Text className="border-white/60 text-white text-[20px]">
                  {guide.isFollowed ? '已关注' : '关注'}
                </Text>
              </View>
            )}
          </View>
        ) : null}
        <View
          className="ml-auto flex flex-row items-center px-2 flex-shrink-0"
          onClick={() =>
            Taro.navigateTo({
              url: `/pages/accounting/list/index?targetType=trip&targetId=${id}&name=${encodeURIComponent(guide?.title || '')}`,
            })
          }
        >
          <Text className="iconfont icon-notepad text-orange-500 text-30px" />
          <Text className="ml-1 text-[24px] text-orange-500 font-bold">
            记账
          </Text>
        </View>
      </NavBar>
      {error || !guideData ? (
        <View className="w-full h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-400 text-[24px] space-y-2">
          <Image src={WarningsSvg} className="h-3.5 w-3.5" />
          <Text>行程数据加载失败或不存在</Text>
        </View>
      ) : (
        <View className="w-full min-h-screen bg-stone-50 flex flex-col pb-140px">
          <View className="w-full box-border">
            {/* 顶部沉浸式大图封面 */}
            <View className="relative w-full h-[520px]">
              <CoverImage src={guide.coverImage} title={guide.title} titleClassName="text-50px" titleMaxWidth="560rpx">
                <View className="w-full h-full bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </CoverImage>
            </View>

            {/* 基本信息大卡片 */}
            <View className="relative -mt-10 mx-4 bg-white/95 backdrop-blur rounded-3xl p-5 shadow-sm border border-stone-100/50">
              <View className="flex flex-row items-start flex-wrap gap-2 mb-2">
                <Text className="text-[34px] font-extrabold text-stone-900 leading-snug">
                  {guide.title || '未命名故事'}
                </Text>

                {/* 替换 isOriginal 逻辑，展示 境内/境外 标签 */}
                <Text
                  className={`text-[18px] px-2 py-0.5 rounded-full font-bold border ${
                    guide.isOverseas === 1
                      ? 'bg-blue-50 text-blue-500 border-blue-100'
                      : 'bg-orange-50 text-[#F97316] border-orange-100'
                  }`}
                >
                  {guide.isOverseas === 1 ? '境外探秘' : '国内畅游'}
                </Text>
              </View>

              {destinationText && (
                <View className="flex flex-row items-center text-stone-500 text-[24px] mb-4 font-medium">
                  <Image src={LocationsSvg} className="h-3.5 w-3.5 mr-6px" />
                  <Text>{destinationText}</Text>
                </View>
              )}

              {/* ✨ Bento Box 块级便当盒网格设计 - 已根据后端可用字段重构 */}
              <View className="grid grid-cols-2 gap-3 py-1 text-left">
                {tripStats.map((s) => (
                  <View
                    key={s.key}
                    className="bg-stone-50/80 p-3 rounded-2xl border border-stone-100"
                  >
                    <View className="flex items-center mb-1">
                      <Image
                        src={s.svg!}
                        className={s.iconClass || 'h-4 w-4 mr-6px'}
                      />
                      <Text className="block text-stone-400 text-[24px] font-medium">
                        {s.label}
                      </Text>
                    </View>
                    <Text
                      className={`${s.highlight ? 'text-[#F97316]' : 'text-stone-800'} font-bold text-[25px]`}
                    >
                      {s.value}
                    </Text>
                  </View>
                ))}
              </View>

              {guide.summary && (
                <View className="bg-orange-50/30 rounded-2xl p-4 mt-3 border border-orange-100/30">
                  <Text className="text-[24px] text-stone-600 leading-relaxed block">
                    “ {guide.summary} ”
                  </Text>
                </View>
              )}

              {/* 预算范围 - 更改为后端单字段 totalBudget */}
              <View className="flex flex-row items-center justify-between text-[24px] mt-4 pt-3 border-t border-stone-50">
                <Text className="text-[26px] text-stone-700 font-bold">
                  预估总开销
                </Text>
                <View className="bg-[#F97316] text-white font-bold px-4 py-1 rounded-full text-[24px] shadow-sm shadow-orange-500/20">
                  {guide.totalBudget !== undefined &&
                  guide.totalBudget !== null &&
                  guide.totalBudget > 0
                    ? `¥${guide.totalBudget} / 人`
                    : '随心穷游'}
                </View>
              </View>
            </View>

            {/* 天数导航横向卡片（吸顶） */}
            {days.length > 0 && (
              <View
                className="pt-3 pb-1 bg-stone-50 sticky z-30"
                style={{ top: headerHeight }}
              >
                <View className="bg-white mx-4 rounded-3xl p-4 shadow-sm">
                  <View className="flex flex-row justify-between items-center mb-3">
                    <Text className="text-[28px] font-extrabold text-stone-800 tracking-wide">
                      行程概览
                    </Text>
                    {days[currentDayIdx]?.title && (
                      <Text className="text-[22px] font-bold text-[#F97316] bg-orange-50 px-2.5 py-1 rounded-xl max-w-[300px] truncate">
                        {days[currentDayIdx].title}
                      </Text>
                    )}
                  </View>

                  <ScrollView
                    scrollX
                    scrollWithAnimation
                    className="w-full whitespace-nowrap pb-1"
                    showScrollbar={false}
                  >
                    {days.map((day, idx) => {
                      const isSelected = currentDayIdx === idx;
                      return (
                        <View
                          key={day.id || idx}
                          onClick={() => handleTabClick(idx)}
                          className={`inline-block px-5 py-2.5 rounded-2xl text-[24px] font-bold mr-3 transition-all ${
                            isSelected
                              ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/20'
                              : 'bg-stone-50 text-stone-600 border border-stone-200/60'
                          }`}
                        >
                          第{day.dayNumber || idx + 1}天
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* 行程详情纵向铺开 */}
            {days.length > 0 && (
              <View className="mt-2 space-y-4 w-full box-border">
                {days.map((dayItem, dIdx) => (
                  <View
                    key={dayItem.id || dIdx}
                    id={`day-node-${dIdx}`}
                    className="w-full px-4 box-border scroll-mt-4 day-node"
                  >
                    <View className="flex flex-row items-center justify-between my-3 px-2">
                      <Text className="text-[30px] font-black text-stone-800">
                        第 {dayItem.dayNumber || dIdx + 1} 天
                      </Text>
                      {dayItem.title && (
                        <Text className="text-[24px] text-stone-400 font-medium truncate max-w-[400px]">
                          {dayItem.title}
                        </Text>
                      )}
                    </View>

                    <View className="relative w-full pl-7 box-border pb-2">
                      {dayItem?.items && dayItem.items.length > 0 ? (
                        <>
                          <View className="absolute left-[18px] top-6 bottom-6 w-[2px] bg-stone-200/80" />
                          <View className="space-y-4">
                            {dayItem.items.map((item, index) => {
                              const config =
                                SECTION_MAP[item.sectionType] ||
                                SECTION_MAP.attraction;
                              const typeCfg =
                                typeConfigMap[item.sectionType] ||
                                typeConfigMap.attraction;
                              const imgList = getImgArray(item.images);
                              const hasImages = imgList.length > 0;
                              const price = Number(item.ticketPrice);
                              const hasPrice =
                                item.ticketPrice !== null && !isNaN(price);
                              const isTransport =
                                item.sectionType === 'transport';
                              const isTips = item.sectionType === 'tips';

                              if (isTransport) {
                                return (
                                  <View
                                    key={item.id || index}
                                    className="relative my-2 py-1 flex flex-row items-center pl-2"
                                  >
                                    <View className="absolute -left-[48px] w-2.5 h-2.5 rounded-full bg-stone-300 z-10 border-2 border-white" />
                                    <View className="bg-stone-100/80 rounded-full px-4 py-1.5 flex flex-row items-center space-x-2 border border-white shadow-xs">
                                      <Image
                                        src={CarSvg}
                                        className="h-4 w-4 mr-6px"
                                      />
                                      <Text className="text-[22px] text-stone-600 font-semibold">
                                        {getTransportLabel(
                                          (item as any).transportMode,
                                        )}
                                        {item.description
                                          ? ` · ${item.description}`
                                          : ''}
                                      </Text>
                                    </View>
                                  </View>
                                );
                              }

                              return (
                                <View
                                  key={item.id || index}
                                  className="relative"
                                >
                                  <View
                                    className="absolute -left-[57px] top-[22px] -translate-x-1/2 flex items-center justify-center w-5 h-5 rounded-full z-10 shadow-xs"
                                    style={{
                                      backgroundColor: config.ringColor,
                                    }}
                                  >
                                    <View
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        backgroundColor: config.dotColor,
                                      }}
                                    />
                                  </View>

                                  <View className="bg-white rounded-2xl p-4 shadow-xs box-border ml-1 border border-stone-100">
                                    <View className="flex flex-row items-center justify-between mb-2">
                                      <View className="flex flex-row items-center">
                                        <Image
                                          src={WatchSvg}
                                          className="h-3.5 w-3.5 mr-6px"
                                        />
                                        <Text className="text-[22px] font-bold text-stone-400">
                                          {formatTimeRange(
                                            item.startTime,
                                            item.endTime,
                                          )}
                                        </Text>
                                      </View>
                                      <View
                                        className="px-2 py-0.5 rounded-lg flex items-center gap-1"
                                        style={{
                                          color: config.color,
                                          backgroundColor: config.bg,
                                        }}
                                      >
                                        <Image
                                          src={typeCfg.svg}
                                          className="h-3.5 w-3.5"
                                        />
                                        <Text className="text-[22px] font-bold">
                                          {config.label}
                                        </Text>
                                      </View>
                                    </View>

                                    {isTips && item.title && (
                                      <View className="bg-amber-50/60 rounded-xl p-3 border border-amber-100/70">
                                        <Text className="text-[24px] text-amber-800 leading-relaxed font-medium">
                                          💡 {item.title}
                                        </Text>
                                      </View>
                                    )}

                                    {!isTips && (
                                      <View className="space-y-1">
                                        <Text className="text-[27px] font-black text-stone-800 block">
                                          {item.title || '探索秘境'}
                                        </Text>
                                        {item.description && (
                                          <Text className="text-[24px] text-stone-500 leading-relaxed block mt-1">
                                            {item.description}
                                          </Text>
                                        )}
                                        {item.address && (
                                          <View
                                            className="flex flex-row items-center gap-1 mt-2 bg-stone-50 px-2.5 py-1 rounded-xl w-fit active:opacity-70"
                                            onClick={() => openMapLocation(item.latitude, item.longitude, item.title, item.address)}
                                          >
                                            <Image
                                              src={LocationsSvg}
                                              className="h-3.5 w-3.5"
                                            />
                                            <Text className="text-[21px] text-stone-400 font-medium break-all">
                                              {item.address}
                                              {item.latitude && item.longitude && (
                                                <Text className="text-[#e97442]">（点击导航）</Text>
                                              )}
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                    )}

                                    {hasImages && (
                                      <View className="w-full mt-3 rounded-xl overflow-hidden">
                                        {imgList.length === 1 ? (
                                          <View className="w-full h-[320px] bg-stone-50">
                                            <Image
                                              preview
                                              src={imgList[0]}
                                              mode="aspectFill"
                                              className="w-full h-full"
                                            />
                                          </View>
                                        ) : (
                                          <View
                                            className={`grid ${imgList.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 w-full`}
                                          >
                                            {imgList.map((imgUrl, i) => (
                                              <View
                                                key={i}
                                                className="relative w-full h-0 pb-[100%] bg-stone-50 rounded-lg overflow-hidden"
                                              >
                                                <Image
                                                  urls={imgList}
                                                  preview
                                                  src={imgUrl}
                                                  mode="aspectFill"
                                                  className="absolute top-0 left-0 w-full h-full"
                                                />
                                              </View>
                                            ))}
                                          </View>
                                        )}
                                      </View>
                                    )}

                                    {!isTransport &&
                                      (hasPrice || item.needReservation) && (
                                        <View className="flex flex-row items-center justify-between pt-2 border-t border-stone-50 mt-3">
                                          <Text className="text-[23px] text-emerald-600 font-bold">
                                            {hasPrice && price > 0
                                              ? `🎟️ 门票预估: ¥${price.toFixed(2)}`
                                              : '🍃 免费开放 / 无需预约'}
                                          </Text>
                                        </View>
                                      )}
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        </>
                      ) : (
                        <View className="py-12 text-center text-stone-400 bg-white rounded-2xl shadow-xs border border-stone-100">
                          <Text className="text-[36px]">☕</Text>
                          <Text className="block mt-1 text-[23px]">
                            留白时光，随心惬意漫步吧~
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 🎨 挂载解耦出来的评论大组件 */}
            <View id="comment-section">
              <CommentSection
                targetId={id || ''}
                targetType="trip"
                data={guideData}
                refreshKey={commentRefreshKey}
                onReplyComment={(comment) =>
                  setReplyTo({
                    parentId: comment.id,
                    nickname: comment.nickname,
                  })
                }
              />
            </View>
          </View>

          {/* 切换视图悬浮按钮 */}
          <View
            onClick={() =>
              Taro.navigateTo({ url: `../preview/index?id=${id}` })
            }
            className="fixed bottom-[200px] right-4 w-[100px] h-[100px] bg-orange-100 text-[#F97316] rounded-full flex flex-col items-center justify-center shadow-md active:scale-90 transition-all z-50 border border-orange-200/50"
          >
            <Text className="iconfont icon-view font-bold mb-1 text-34px" />
            <Text className="text-[20px] font-black">行程预览</Text>
          </View>

          {/* 🎨 挂载解耦出来的底部悬浮多功能工具组件 */}
          <BottomActionBar
            isLiked={guideData?.isLiked!}
            targetType="trip"
            isCollected={guideData?.isFavorited!}
            likeCount={guideData?.likeCount ?? 0}
            favoriteCount={guideData?.favoriteCount ?? 0}
            commentCount={guideData?.commentCount ?? 0}
            onLikeToggle={() => {
              mutate((prev: any) => {
                const next = !prev?.isLiked;
                prev.likeCount = next ? prev.likeCount + 1 : prev.likeCount - 1;
                prev.isLiked = next;
                return { ...prev }; // 浅拷贝触发 React 状态更新
              });
            }}
            onCollectToggle={() => {
              mutate((prev: any) => {
                const next = !prev?.isFavorited;
                prev.isFavorited = next;
                prev.favoriteCount = next
                  ? prev.favoriteCount + 1
                  : prev.favoriteCount - 1;
                return { ...prev };
              });
            }}
            onCommentIconClick={handleScrollToComments}
            onLike={likeTrip}
            onUnlike={unlikeTrip}
            guideId={id || ''}
            onCommentSuccess={() => {
              setCommentRefreshKey((v) => v + 1);
              mutate((prev: any) => {
                prev.commentCount += 1;
                return { ...prev };
              });
            }}
            replyTo={replyTo}
            onClearReply={() => setReplyTo(null)}
          />
        </View>
      )}

      {/* 取消关注确认弹窗 */}
      <Modal
        visible={unfollowVisible}
        title="取消关注"
        confirmText="确定"
        cancelText="再想想"
        onConfirm={handleConfirmUnfollow}
        onCancel={() => setUnfollowVisible(false)}
        onMaskClick={() => setUnfollowVisible(false)}
      >
        <View className="py-2 text-center">
          <Text className="text-gray-600 text-[28px] leading-relaxed">
            确定不再关注「{guide?.authorName || '该用户'}」吗？
          </Text>
        </View>
      </Modal>
    </>
  );
}
