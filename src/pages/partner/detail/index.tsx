import { useState } from 'react';
import {
  View,
  Text,
  Textarea,
  Input,
  Button,
  ScrollView,
} from '@tarojs/components';
import Taro, {
  useRouter,
  usePullDownRefresh,
  useShareAppMessage,
  useShareTimeline,
} from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { NavBar, Image, Modal, Avatar } from '@/components';
import LocationsSvg from '@/assets/itinerary/locations.svg';
import TeamSvg from '@/assets/img/team.svg';
import { CommentSection } from '@/features';
import {
  getPartnerDetail,
  applyPartner,
  likePartner,
  unlikePartner,
  cancelPartner,
  leavePartner,
} from '@/api/partner';
import { createHistoryRecord } from '@/api/history';
import { followUser, unfollowUser } from '@/api/follow';
import { addFavorite, deleteFavorite } from '@/api/favorite';
import { createComment } from '@/api/comment';
import { openMapLocation, getImageCdnUrl } from '@/utils';
import { useAuthStore } from '@/store/authStore';

const TYPE_LABELS: Record<number, string> = {
  0: '不限',
  1: '自由行',
  2: '跟团游',
  3: '自驾游',
};
const GENDER_LABELS: Record<number, string> = {
  0: '不限',
  1: '仅限男',
  2: '仅限女',
};
const FEE_LABELS: Record<number, string> = {
  0: '免费',
  1: 'AA制',
  2: '组织者全包',
  3: '人均预算',
};
const STATUS_LABELS: Record<
  number,
  { label: string; bg: string; text: string }
> = {
  0: { label: '招募中', bg: 'bg-emerald-500/90', text: 'text-white' },
  1: { label: '已满员', bg: 'bg-gray-500/80', text: 'text-white' },
  2: { label: '已解散', bg: 'bg-rose-500/80', text: 'text-white' },
  3: { label: '已结束', bg: 'bg-gray-500/80', text: 'text-white' },
  4: { label: '已结束', bg: 'bg-gray-500/80', text: 'text-white' },
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '时间待定';
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export default function PartnerDetail() {
  const { id } = useRouter().params;

  // --- States ---
  const [applyVisible, setApplyVisible] = useState(false);
  const [applyRemark, setApplyRemark] = useState('');
  const [applying, setApplying] = useState(false);
  const [unfollowVisible, setUnfollowVisible] = useState(false);
  const [commentRefreshKey, setCommentRefreshKey] = useState(0);
  const [replyTo, setReplyTo] = useState<{
    parentId: string;
    nickname: string;
  } | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dissolveVisible, setDissolveVisible] = useState(false);
  const [dissolveReason, setDissolveReason] = useState('');
  const [dissolving, setDissolving] = useState(false);
  const [leaveVisible, setLeaveVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // --- Data ---
  const {
    data: partner,
    mutate,
    refresh,
  } = useRequest(() => getPartnerDetail(id || ''), {
    refreshDeps: [id],
    onSuccess: (data: any) => {
      // 记录搭子浏览历史
      if (data?.title) {
        createHistoryRecord({
          targetId: id || '',
          targetType: 'partner',
          title: data.title || '',
          coverImage: data.cover || '',
        }).catch(() => {});
      }
    },
  });

  // 分享好友：标题用搭子标题，携带搭子 ID 与邀请码
  useShareAppMessage(() => {
    const inviteCode = useAuthStore.getState().userInfo?.inviteCode;
    return {
      title:
        partner?.title ||
        partner?.destination ||
        '发现一个有趣搭子，一起出发吧！',
      path: `/pages/partner/detail/index?id=${id}${inviteCode ? `&inviteCode=${inviteCode}` : ''}`,
      imageUrl: partner?.cover
        ? partner.cover
        : getImageCdnUrl('share.png'),
    };
  });

  // 分享朋友圈
  useShareTimeline(() => {
    const inviteCode = useAuthStore.getState().userInfo?.inviteCode;
    return {
      title:
        partner?.title ||
        partner?.destination ||
        '发现一个有趣搭子，一起出发吧！',
      query: `${id ? `id=${id}` : ''}${inviteCode ? `&inviteCode=${inviteCode}` : ''}`,
      imageUrl: partner?.cover
        ? partner.cover
        : getImageCdnUrl('share.png'),
    };
  });

  const isSelf = partner?.isSelf;
  const statusInfo = STATUS_LABELS[partner?.status ?? 0] || STATUS_LABELS[0];
  const canApply =
    !isSelf && !partner?.isApplied && (partner?.status ?? 0) === 0;
  // 距出发不足 24 小时（用于退出提醒）
  const nearStart =
    !!partner?.startDate &&
    new Date(partner.startDate).getTime() - Date.now() < 24 * 3600 * 1000;

  // --- Handlers ---
  // 关注/取关（取关前弹窗确认）
  const handleToggleFollow = () => {
    if (!partner?.userId) return;
    if (partner.isFollowed) {
      setUnfollowVisible(true);
    } else {
      handleFollow();
    }
  };

  const handleFollow = async () => {
    if (!partner?.userId) return;
    await followUser(partner.userId);
    refresh();
  };

  const handleConfirmUnfollow = async () => {
    if (!partner?.userId) return;
    setUnfollowVisible(false);
    await unfollowUser(partner.userId);
    refresh();
  };

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    const ok = await applyPartner(id, { remark: applyRemark })
      .then(() => true)
      .catch(() => false);
    setApplying(false);
    if (!ok) return;
    Taro.showToast({ title: '申请已发送', icon: 'success' });
    setApplyVisible(false);
    setApplyRemark('');
    refresh();
  };

  // 解散搭子（二次确认 + 可选原因）
  const handleDissolve = async () => {
    if (!id) return;
    setDissolving(true);
    const ok = await cancelPartner(id, dissolveReason)
      .then(() => true)
      .catch(() => false);
    setDissolving(false);
    if (!ok) return;
    Taro.showToast({ title: '已解散', icon: 'success' });
    setDissolveVisible(false);
    setDissolveReason('');
    refresh();
  };

  // 退出搭子
  const handleLeave = async () => {
    if (!id) return;
    setLeaving(true);
    const ok = await leavePartner(id)
      .then(() => true)
      .catch(() => false);
    setLeaving(false);
    if (!ok) return;
    Taro.showToast({ title: '已退出', icon: 'success' });
    setLeaveVisible(false);
    refresh();
  };

  const handleLikeToggle = async () => {
    if (!id) return;
    if (partner?.isLiked) await unlikePartner(id);
    else await likePartner(id);
    mutate((prev: any) => {
      const next = !prev?.isLiked;
      // 点赞与收藏独立，点赞只更新点赞状态与数字
      return {
        ...prev,
        isLiked: next,
        likeCount: Math.max(0, (prev.likeCount || 0) + (next ? 1 : -1)),
      };
    });
  };

  const handleCollectToggle = async () => {
    if (!id) return;
    if (partner?.isFavorited) await deleteFavorite(id, 'partner');
    else await addFavorite({ targetId: id, targetType: 'partner' });
    mutate((prev: any) => {
      const next = !prev?.isFavorited;
      // 点赞与收藏独立，收藏只更新收藏状态与数字
      return {
        ...prev,
        isFavorited: next,
        favoriteCount: Math.max(0, (prev.favoriteCount || 0) + (next ? 1 : -1)),
      };
    });
  };

  const handleReplyComment = (comment: any) => {
    setReplyTo({ parentId: comment.id, nickname: comment.nickname });
    setShowCommentInput(true);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting || !id) return;
    setSubmitting(true);
    const ok = await createComment({
      content: commentText.trim(),
      targetId: id,
      targetType: 'partner',
      parentId: replyTo?.parentId,
    })
      .then(() => true)
      .catch(() => false);
    setSubmitting(false);
    if (!ok) return;
    Taro.showToast({ title: '评论成功', icon: 'success' });
    setShowCommentInput(false);
    setCommentText('');
    setReplyTo(null);
    setCommentRefreshKey((v) => v + 1);
    mutate((prev: any) => ({
      ...prev,
      commentCount: (prev.commentCount || 0) + 1,
    }));
  };

  // Pull-to-refresh
  usePullDownRefresh(async () => {
    refresh();
    setCommentRefreshKey((v) => v + 1);
    Taro.stopPullDownRefresh();
  });

  if (!partner) return null;

  return (
    <>
      {/* ===== NavBar ===== */}
      <NavBar showBack backgroundColor="white">
        {partner?.userId ? (
          <View
            className="flex flex-row items-center flex-1"
            onClick={() =>
              Taro.navigateTo({
                url: `/pages/personal/index?userId=${partner.userId}`,
              })
            }
          >
            <Avatar
              name={partner.authorName}
              src={partner.authorAvatar}
              className="w-[40px] h-[40px] text-[20px] rounded-full border-2 border-white/80"
            />
            <Text className="ml-2 text-[26px] font-bold text-gray-800">
              {partner.authorName || ''}
            </Text>
            {!isSelf && (
              <View
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFollow();
                }}
                className={`ml-3 px-2 py-1 rounded-full border leading-0 font-medium ${partner.isFollowed ? 'bg-gray-400' : 'bg-[#F97316]'}`}
              >
                <Text className="text-white text-[20px]">
                  {partner.isFollowed ? '已关注' : '关注'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text className="text-[34px] font-semibold text-gray-700">
            搭子详情
          </Text>
        )}
        <View
          className="ml-auto flex flex-row items-center px-2 flex-shrink-0"
          onClick={() =>
            Taro.navigateTo({
              url: `/pages/accounting/list/index?targetType=partner&targetId=${id}&name=${encodeURIComponent(partner?.title || '')}`,
            })
          }
        >
          <Text className="iconfont icon-notepad text-orange-500 text-30px" />
          <Text className="ml-1 text-[24px] text-orange-500 font-bold">
            记账
          </Text>
        </View>
      </NavBar>

      <View className="min-h-screen bg-gray-100/70 pb-100px flex flex-col">
        {/* ===== Scrollable Content ===== */}
        <ScrollView scrollY className="flex-1 pb-[130px]">
          {/* ---- Cover Header ---- */}
          <View className="relative w-full h-60 bg-gray-900 overflow-hidden">
            {partner.cover ? (
              <Image
                src={partner.cover}
                mode="aspectFill"
                className="w-full h-full opacity-90"
              />
            ) : (
              <View className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <Text className="text-white/70 text-50px font-bold text-center line-clamp-2 break-all block px-6 max-w-560px">
                  {partner.title || partner.destination}
                </Text>
              </View>
            )}

            <View className="absolute top-3 left-4 flex items-center space-x-2 z-10">
              <View
                className={`${statusInfo.bg} ${statusInfo.text} text-[22px] px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-md`}
              >
                {statusInfo.label}
              </View>
            </View>

            <View className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <View className="absolute bottom-3 right-4 z-10">
              <View className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center">
                <Text className="iconfont icon-eye text-white/90 text-[22px] mr-1" />
                <Text className="text-white/90 text-[24px] font-medium">
                  {partner.viewCount ?? 0}
                </Text>
              </View>
            </View>
          </View>

          {/* ---- Content Cards ---- */}
          <View className="px-4 pt-3 space-y-3.5">
            {/* Card 1: 行程信息 */}
            <SectionCard title="行程信息">
              <Row
                label="目的地"
                value={
                  <View className="flex items-center justify-end">
                    <Image
                      src={LocationsSvg}
                      className="h-3.5 w-3.5 mr-6px flex-shrink-0"
                    />
                    <Text className="text-[26px] text-gray-800 font-medium break-all">
                      {partner.destination}
                    </Text>
                  </View>
                }
              />
              {partner.category && (
                <Row label="活动类型" value={partner.category} />
              )}
              {partner.type > 0 && (
                <Row label="出行方式" value={TYPE_LABELS[partner.type]} />
              )}
              {partner.address && (
                <Row
                  label="集合地点"
                  value={
                    <View
                      className="flex items-center justify-end active:opacity-70"
                      onClick={() => openMapLocation(partner.latitude, partner.longitude, partner.title, partner.address)}
                    >
                      <Image
                        src={LocationsSvg}
                        className="h-3.5 w-3.5 mr-6px flex-shrink-0"
                      />
                      <Text className="text-[26px] text-gray-800 font-medium break-all">
                        {partner.address}
                        {partner.latitude && partner.longitude && (
                          <Text className="text-[#F97316]">（点击导航）</Text>
                        )}
                      </Text>
                    </View>
                  }
                />
              )}

              <View className="flex items-center justify-between">
                <Text className="text-[26px] text-gray-500">出行时间</Text>
                <View className="text-right">
                  <Text className="text-[26px] text-gray-800 font-medium">
                    {formatDate(partner.startDate)}
                    {partner.days !== 1 && partner.endDate && partner.endDate !== partner.startDate && (
                      <> - {formatDate(partner.endDate)}</>
                    )}
                  </Text>
                  {partner.days > 0 && (
                    <Text className="text-[22px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded ml-1.5 font-medium">
                      {partner.days}天
                    </Text>
                  )}
                </View>
              </View>

              {partner.budgetPerPerson > 0 && (
                <Row
                  label="人均预算"
                  value={
                    <Text className="text-[32px] text-orange-600 font-bold">
                      ¥{partner.budgetPerPerson}
                    </Text>
                  }
                />
              )}

              {partner.desc && (
                <View className="pt-2 border-t border-gray-50">
                  <Text className="text-[24px] text-gray-400 block mb-1.5">
                    计划说明
                  </Text>
                  <Text className="text-[26px] text-gray-700 leading-relaxed bg-gray-50/80 p-3 rounded-xl block border border-gray-100/60 break-all">
                    {partner.desc}
                  </Text>
                </View>
              )}
            </SectionCard>

            {/* Card 2: 费用详情 */}
            {(partner.feeMode !== undefined ||
              partner.feeInclude ||
              partner.feeExclude ||
              (partner.estTotal ?? 0) > 0) && (
              <SectionCard title="费用详情">
                <Row
                  label="费用模式"
                  value={FEE_LABELS[partner.feeMode] || '未知'}
                />
                {(partner.estTotal ?? 0) > 0 && (
                  <Row label="预估总费用" value={`¥${partner.estTotal}`} />
                )}
                {partner.feeInclude && (
                  <Row label="费用包含" value={partner.feeInclude} />
                )}
                {partner.feeExclude && (
                  <Row label="费用不含" value={partner.feeExclude} />
                )}
              </SectionCard>
            )}

            {/* Card 3: 招募要求 */}
            <SectionCard title="招募要求">
              <Row
                label="当前成员"
                value={
                  <View className="flex items-center justify-end">
                    <Image
                      src={TeamSvg}
                      className="h-4 w-4 mr-6px flex-shrink-0"
                    />
                    <Text className="text-[26px] text-gray-800 font-medium">
                      {partner.currentMembers} / {partner.maxMembers} 人
                    </Text>
                  </View>
                }
              />
              {(partner.minMembers ?? 0) > 0 && (
                <Row label="最少成行" value={`${partner.minMembers} 人`} />
              )}
              <Row
                label="性别限制"
                value={GENDER_LABELS[partner.genderLimit] || '不限'}
              />
              {partner.maleCount > 0 &&
                partner.femaleCount > 0 &&
                partner.genderLimit === 3 && (
                  <Row
                    label="名额分配"
                    value={`男 ${partner.maleCount} / 女 ${partner.femaleCount}`}
                  />
                )}
              {(partner.minAge ?? 0) > 0 || (partner.maxAge ?? 0) > 0 ? (
                <Row
                  label="年龄要求"
                  value={`${partner.minAge || 0} - ${partner.maxAge || 99} 岁`}
                />
              ) : null}
              <Row
                label="加入方式"
                value={partner.joinMode === 0 ? '自由加入' : '需审核'}
              />
              {partner.requirement && (
                <View className="pt-2 border-t border-gray-50">
                  <Text className="text-[24px] text-gray-400 block mb-1.5">
                    报名条件
                  </Text>
                  <Text className="text-[26px] text-gray-700 bg-orange-50/50 border border-orange-100/80 rounded-xl p-3 leading-relaxed block break-all">
                    {partner.requirement}
                  </Text>
                </View>
              )}
            </SectionCard>

            {/* Card 4: 旅行标签 */}
            {partner.travelTags && (
              <SectionCard title="旅行标签">
                <View className="flex flex-row flex-wrap gap-2">
                  {partner.travelTags.split(',').map((tag, i) => (
                    <View
                      key={i}
                      className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 px-3 py-1 rounded-full"
                    >
                      <Text className="text-[24px] text-orange-600 font-medium">
                        #{tag.trim()}
                      </Text>
                    </View>
                  ))}
                </View>
              </SectionCard>
            )}

            {/* Card 5: 详细介绍 */}
            {partner.richDesc && (
              <SectionCard title="详细介绍">
                <Text className="text-[26px] text-gray-700 leading-relaxed whitespace-pre-line break-all">
                  {partner.richDesc}
                </Text>
              </SectionCard>
            )}

            {/* Card 6: 行程安排 */}
            {(Array.isArray(partner.itinerary) && partner.itinerary.length > 0) ||
              (partner.trip && (
                <SectionCard title="行程安排">
                  {Array.isArray(partner.itinerary) && partner.itinerary.length > 0 ? (
                    <View className="space-y-2">
                      {partner.itinerary.map((day: any, di: number) => (
                        <View key={di} className="bg-gray-50 rounded-xl p-3">
                          <View className="flex flex-row items-center mb-1">
                            <Text className="text-[22px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                              第{day.dayNumber || di + 1}天
                            </Text>
                            {day.title && (
                              <Text className="text-[24px] font-medium text-gray-800 ml-2 flex-1 line-clamp-1">
                                {day.title}
                              </Text>
                            )}
                          </View>
                          <Text className="text-[22px] text-gray-500 line-clamp-2">
                            {(day.items || [])
                              .map((it: any) => it.title)
                              .filter(Boolean)
                              .join(' · ') || '行程安排已就绪'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : partner.trip ? (
                    <View
                      className="bg-gray-50 rounded-xl p-3 space-y-2 active:opacity-80"
                      onClick={() =>
                        Taro.navigateTo({
                          url: `/pages/trip/view/index?id=${partner.trip.id}`,
                        })
                      }
                    >
                      <Text className="text-[26px] font-bold text-gray-800">
                        {partner.trip.title}
                      </Text>
                      {partner.trip.summary && (
                        <Text className="text-[24px] text-gray-500 line-clamp-2">
                          {partner.trip.summary}
                        </Text>
                      )}
                      <View className="flex flex-row flex-wrap gap-1.5">
                        {partner.trip.destinations?.map((d, i) => (
                          <Text
                            key={i}
                            className="text-[20px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded"
                          >
                            {d}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </SectionCard>
              ))}

            {/* ---- Comment Section ---- */}
            <View id="partner-comment-section">
              <CommentSection
                targetId={id || ''}
                className="mx-0"
                targetType="partner"
                data={partner}
                refreshKey={commentRefreshKey}
                onReplyComment={handleReplyComment}
              />
            </View>
          </View>
        </ScrollView>

        {/* ===== Bottom Action Bar ===== */}
        <View className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-100 px-4 pt-3 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.02)] z-50">
          <View className="flex flex-row items-center">
            {/* Left: 主操作区（任意状态均有内容，避免左侧空块） */}
            <View className="flex-1 mr-3">
              {canApply ? (
                <View
                  onClick={() => setApplyVisible(true)}
                  className="w-full bg-[#F97316] active:bg-[#EA580C] text-white text-center py-2.5 rounded-xl font-bold text-[28px] shadow-md active:scale-[0.98] transition-all"
                >
                  申请加入
                </View>
              ) : isSelf ? (
                partner?.status === 0 || partner?.status === 1 ? (
                  <View
                    onClick={() => setDissolveVisible(true)}
                    className="w-full border border-rose-300 text-rose-500 rounded-xl py-2.5 text-center text-[26px] font-medium active:scale-95 transition-all"
                  >
                    解散搭子
                  </View>
                ) : (
                  <View className="w-full bg-gray-100 text-gray-400 text-center py-2.5 rounded-xl font-medium text-[26px]">
                    {partner?.status === 2 ? '已解散' : '已结束'}
                  </View>
                )
              ) : partner?.isApplied ? (
                <View className="w-full bg-gray-100 text-gray-400 text-center py-2.5 rounded-xl font-medium text-[26px]">
                  {partner?.application?.status === 1 ? '已加入' : '已申请'}
                </View>
              ) : (
                <View className="w-full bg-gray-100 text-gray-400 text-center py-2.5 rounded-xl font-medium text-[26px]">
                  招募已结束或已满员
                </View>
              )}
            </View>

            {/* 已加入成员：退出搭子 */}
            {!isSelf &&
              partner?.isApplied &&
              partner?.application?.status === 1 &&
              (partner?.status === 0 || partner?.status === 1) && (
                <View
                  onClick={() => setLeaveVisible(true)}
                  className="mr-3 border border-orange-300 text-orange-500 rounded-xl px-4 py-2.5 text-[26px] font-medium active:scale-95 transition-all"
                >
                  退出搭子
                </View>
              )}

            {/* Right: Social Icons */}
            <View className="flex flex-row items-center space-x-3">
              {/* Like */}
              <View
                onClick={handleLikeToggle}
                className="flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform"
              >
                <Text
                  className={`iconfont ${partner.isLiked ? 'icon-follow-fill text-[36px]' : 'icon-follow text-[36px]'}`}
                  style={{ color: partner.isLiked ? '#f87171' : '#57534e' }}
                />
                <Text
                  className="text-[18px] mt-0.5 font-medium"
                  style={{ color: partner.isLiked ? '#F97316' : '#78716c' }}
                >
                  {partner.likeCount ?? 0}
                </Text>
              </View>

              {/* Comment */}
              <View
                onClick={() => setShowCommentInput(true)}
                className="flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform"
              >
                <Text className="iconfont icon-message text-[36px] text-stone-700" />
                <Text className="text-[18px] mt-0.5 text-stone-500 font-medium">
                  {partner.commentCount ?? 0}
                </Text>
              </View>

              {/* Favorite */}
              <View
                onClick={handleCollectToggle}
                className="flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform"
              >
                <Text
                  className={`iconfont ${partner.isFavorited ? 'icon-shoucang text-[36px]' : 'icon-weishoucang text-[36px]'}`}
                  style={{ color: partner.isFavorited ? '#F97316' : '#57534e' }}
                />
                <Text
                  className="text-[18px] mt-0.5 font-medium"
                  style={{ color: partner.isFavorited ? '#F97316' : '#78716c' }}
                >
                  {partner.favoriteCount ?? 0}
                </Text>
              </View>

              {/* Share */}
              <Button
                openType="share"
                className="flex flex-col items-center justify-center min-w-[55px] h-[80px] active:scale-90 transition-transform bg-transparent p-0 m-0 border-0 text-stone-700 after:border-0"
              >
                <Text className="iconfont icon-share text-[36px] text-stone-700" />
                <Text className="text-[18px] mt-0.5 text-stone-500 font-medium">
                  分享
                </Text>
              </Button>
            </View>
          </View>
        </View>

        {/* ===== Apply Modal ===== */}
        <Modal
          visible={applyVisible}
          title="申请加入"
          confirmText="发送申请"
          confirmLoading={applying}
          showCancel
          onConfirm={handleApply}
          onCancel={() => {
            setApplyVisible(false);
            setApplyRemark('');
          }}
        >
          <View className="pt-2">
            <Text className="text-[24px] text-gray-500 mb-2 block">
              打个招呼吧，让队长更了解你：
            </Text>
            <Textarea
              value={applyRemark}
              onInput={(e) => setApplyRemark(e.detail.value)}
              placeholder="例如：有丰富自驾经验 / 时间可微调 / 随和好相处…"
              placeholderClass="text-gray-400"
              className="w-full bg-gray-50 rounded-xl p-3 text-[26px] text-gray-800 border border-gray-200 box-border"
              style={{ minHeight: '100px' }}
            />
          </View>
        </Modal>

        {/* ===== Dissolve Modal ===== */}
        <Modal
          visible={dissolveVisible}
          title="解散搭子"
          confirmText="确认解散"
          confirmLoading={dissolving}
          showCancel
          onConfirm={handleDissolve}
          onCancel={() => {
            setDissolveVisible(false);
            setDissolveReason('');
          }}
        >
          <View className="pt-2">
            <Text className="text-[24px] text-gray-500 mb-2 block">
              解散后所有已加入成员将收到通知，且不再接收新报名，确定解散吗？
            </Text>
            <Textarea
              value={dissolveReason}
              onInput={(e) => setDissolveReason(e.detail.value)}
              placeholder="填写解散原因（选填）"
              placeholderClass="text-gray-400"
              maxlength={200}
              className="w-full bg-gray-50 rounded-xl p-3 text-[26px] text-gray-800 border border-gray-200 box-border"
              style={{ minHeight: '100px' }}
            />
          </View>
        </Modal>

        {/* ===== Leave Modal ===== */}
        <Modal
          visible={leaveVisible}
          title="退出搭子"
          confirmText="确认退出"
          confirmLoading={leaving}
          showCancel
          onConfirm={handleLeave}
          onCancel={() => setLeaveVisible(false)}
        >
          <View className="pt-2">
            <Text className="text-[24px] text-gray-500 block">
              {nearStart
                ? '距出发时间不足24小时，临时退出可能影响同行伙伴，请确认后再退出'
                : '退出后名额将释放给其他申请者，发起人会收到通知'}
            </Text>
          </View>
        </Modal>

        {/* ===== Comment Input Overlay ===== */}
        <View
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            showCommentInput
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
        >
          <View
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            onClick={() => {
              setShowCommentInput(false);
              setCommentText('');
              setReplyTo(null);
            }}
          />
          <View
            className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-5 pb-safe shadow-lg transition-transform duration-300 ease-out transform ${
              showCommentInput ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {replyTo && (
              <View className="flex flex-row items-center justify-between mb-3 px-3 py-2 bg-orange-50/60 rounded-xl border border-orange-100/50">
                <View className="flex flex-row items-center">
                  <Text className="text-[20px] bg-[#F97316] text-white px-2 py-0.5 rounded-md mr-2 font-bold">
                    回复
                  </Text>
                  <Text className="text-[24px] text-stone-700 font-medium">
                    @{replyTo.nickname}
                  </Text>
                </View>
                <Text
                  onClick={() => {
                    setCommentText('');
                    setReplyTo(null);
                  }}
                  className="text-[22px] text-stone-400 active:text-stone-600 px-2"
                >
                  取消
                </Text>
              </View>
            )}
            <View className="flex flex-row items-center space-x-3">
              <Input
                type="text"
                placeholder={
                  replyTo ? `回复 ${replyTo.nickname}...` : '说点什么...'
                }
                value={commentText}
                onInput={(e) => setCommentText(e.detail.value)}
                className="flex-1 h-12 bg-stone-50 border border-stone-100 rounded-2xl px-4 text-[26px] placeholder-stone-400"
                focus={showCommentInput}
                confirmType="send"
                onConfirm={handleSubmitComment}
              />
              <View
                onClick={handleSubmitComment}
                className={`h-12 px-6 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
                  !commentText.trim() || submitting
                    ? 'bg-stone-100 text-stone-400'
                    : 'bg-[#F97316] text-white shadow-md'
                }`}
              >
                <Text
                  className={`text-[24px] font-bold ${!commentText.trim() || submitting ? 'text-stone-400' : 'text-white'}`}
                >
                  发布
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

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
            确定不再关注「{partner?.authorName || '该用户'}」吗？
          </Text>
        </View>
      </Modal>
    </>
  );
}

// --- Helper Components ---

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
      <View className="flex items-center mb-1">
        <View className="w-1.5 h-3.5 bg-orange-500 rounded-full mr-2" />
        <Text className="text-[28px] font-bold text-gray-800">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <View className="flex items-center justify-between">
      <Text className="text-[26px] text-gray-500 flex-shrink-0">{label}</Text>
      <View className="text-right max-w-[60%]">
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text className="text-[26px] text-gray-800 font-medium break-all">
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}
