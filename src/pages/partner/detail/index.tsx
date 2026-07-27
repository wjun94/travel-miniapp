import { useState } from 'react'
import { View, Text, Textarea, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { useRouter, usePullDownRefresh } from '@tarojs/taro'
import { useRequest } from 'ahooks'
import { NavBar, Image, Modal } from '@/components'
import { CommentSection } from '@/features'
import { getPartnerDetail, applyPartner, likePartner, unlikePartner } from '@/api/partner'
import { followUser, unfollowUser } from '@/api/follow'
import { addFavorite, deleteFavorite } from '@/api/favorite'
import { createComment } from '@/api/comment'

const TYPE_LABELS: Record<number, string> = { 0: '不限', 1: '自由行', 2: '跟团游', 3: '自驾游' }
const GENDER_LABELS: Record<number, string> = { 0: '不限', 1: '仅限男', 2: '仅限女' }
const FEE_LABELS: Record<number, string> = { 0: '免费', 1: 'AA制', 2: '组织者全包', 3: '人均预算' }
const STATUS_LABELS: Record<number, { label: string; bg: string; text: string }> = {
  0: { label: '招募中', bg: 'bg-emerald-500/90', text: 'text-white' },
  1: { label: '已满员', bg: 'bg-gray-500/80', text: 'text-white' },
  2: { label: '已结束', bg: 'bg-rose-500/80', text: 'text-white' },
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '时间待定'
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default function PartnerDetail() {
  const { id } = useRouter().params

  // --- States ---
  const [applyVisible, setApplyVisible] = useState(false)
  const [applyRemark, setApplyRemark] = useState('')
  const [applying, setApplying] = useState(false)
  const [commentRefreshKey, setCommentRefreshKey] = useState(0)
  const [replyTo, setReplyTo] = useState<{ parentId: string; nickname: string } | null>(null)
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // --- Data ---
  const { data: partner, mutate, refresh } = useRequest(
    () => getPartnerDetail(id || ''),
    { refreshDeps: [id] },
  )

  const isSelf = partner?.isSelf
  const statusInfo = STATUS_LABELS[partner?.status ?? 0] || STATUS_LABELS[0]
  const canApply = !isSelf && (partner?.status ?? 0) === 0

  // --- Handlers ---
  const handleToggleFollow = async () => {
    if (!partner?.userId) return
    try {
      if (partner.isFollowed) await unfollowUser(partner.userId)
      else await followUser(partner.userId)
      refresh()
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleApply = async () => {
    if (!id) return
    setApplying(true)
    try {
      await applyPartner(id, { remark: applyRemark })
      Taro.showToast({ title: '申请已发送', icon: 'success' })
      setApplyVisible(false)
      setApplyRemark('')
      refresh()
    } catch {
      Taro.showToast({ title: '申请失败', icon: 'none' })
    } finally {
      setApplying(false)
    }
  }

  const handleLikeToggle = async () => {
    if (!id) return
    try {
      if (partner?.isLiked) await unlikePartner(id)
      else await likePartner(id)
      mutate((prev: any) => {
        const next = !prev?.isLiked
        return { ...prev, isLiked: next, likeCount: Math.max(0, (prev.likeCount || 0) + (next ? 1 : -1)) }
      })
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleCollectToggle = async () => {
    if (!id) return
    try {
      if (partner?.isFavorited) await deleteFavorite(id, 'partner')
      else await addFavorite({ targetId: id, targetType: 'partner' })
      mutate((prev: any) => {
        const next = !prev?.isFavorited
        return { ...prev, isFavorited: next, favoriteCount: Math.max(0, (prev.favoriteCount || 0) + (next ? 1 : -1)) }
      })
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleReplyComment = (comment: any) => {
    setReplyTo({ parentId: comment.id, nickname: comment.nickname })
    setShowCommentInput(true)
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting || !id) return
    setSubmitting(true)
    try {
      await createComment({
        content: commentText.trim(),
        targetId: id,
        targetType: 'partner',
        parentId: replyTo?.parentId,
      })
      Taro.showToast({ title: '评论成功', icon: 'success' })
      setShowCommentInput(false)
      setCommentText('')
      setReplyTo(null)
      setCommentRefreshKey(v => v + 1)
      mutate((prev: any) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }))
    } catch {
      Taro.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  // Pull-to-refresh
  usePullDownRefresh(async () => {
    refresh()
    setCommentRefreshKey(v => v + 1)
    Taro.stopPullDownRefresh()
  })

  if (!partner) return null

  return (
    <View className='min-h-screen bg-gray-100/70 pb-100px flex flex-col'>
      {/* ===== NavBar ===== */}
      <NavBar showBack backgroundColor='white'>
        {partner?.userId ? (
          <View
            className='flex flex-row items-center flex-1'
            onClick={() => Taro.navigateTo({ url: `/pages/personal/index?userId=${partner.userId}` })}
          >
            <Image isAvatar src={partner.authorAvatar} className='w-[40px] h-[40px] text-[20px] rounded-full border-2 border-white/80' />
            <Text className='ml-2 text-[26px] font-bold text-gray-800'>{partner.authorName || ''}</Text>
            {!isSelf && (
              <View
                onClick={(e) => { e.stopPropagation(); handleToggleFollow() }}
                className={`ml-3 px-2 py-1 rounded-full border leading-0 font-medium ${partner.isFollowed ? 'bg-gray-400' : 'bg-[#F97316]'}`}
              >
                <Text className='text-white text-[20px]'>{partner.isFollowed ? '已关注' : '关注'}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text className='text-[34px] font-semibold text-gray-700'>搭子详情</Text>
        )}
      </NavBar>

      {/* ===== Scrollable Content ===== */}
      <ScrollView scrollY className='flex-1 pb-[130px]'>
        {/* ---- Cover Header ---- */}
        <View className='relative w-full h-60 bg-gray-900 overflow-hidden'>
          {partner.cover ? (
            <Image src={partner.cover} mode='aspectFill' className='w-full h-full opacity-90' />
          ) : (
            <View className='w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center'>
              <Text className='text-white/40 text-4xl font-bold'>TRAVEL</Text>
            </View>
          )}

          <View className='absolute top-3 left-4 flex items-center space-x-2 z-10'>
            <View className={`${statusInfo.bg} ${statusInfo.text} text-[22px] px-3 py-1 rounded-full font-medium shadow-sm backdrop-blur-md`}>
              {statusInfo.label}
            </View>
          </View>

          <View className='absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />

          <View className='absolute bottom-3 left-4 right-4 flex items-end justify-between z-10'>
            <View className='flex-1 mr-3'>
              <Text className='text-white text-2xl font-bold leading-tight line-clamp-2 drop-shadow-md'>
                {partner.title || partner.destination}
              </Text>
            </View>
            <View className='bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center'>
              <Text className='text-white/90 text-[22px] font-medium'>👁 {partner.viewCount ?? 0}</Text>
            </View>
          </View>
        </View>

        {/* ---- Content Cards ---- */}
        <View className='px-4 pt-3 space-y-3.5'>

          {/* Card 1: 行程信息 */}
          <SectionCard title='行程信息'>
            <Row label='目的地' value={`📍 ${partner.destination}`} />
            {partner.category && <Row label='活动类型' value={partner.category} />}
            {partner.type > 0 && <Row label='出行方式' value={TYPE_LABELS[partner.type]} />}
            {partner.address && <Row label='集合地点' value={partner.address} />}

            <View className='flex items-center justify-between'>
              <Text className='text-[26px] text-gray-500'>出行时间</Text>
              <View className='text-right'>
                <Text className='text-[26px] text-gray-800 font-medium'>
                  {formatDate(partner.startDate)} - {formatDate(partner.endDate)}
                </Text>
                {partner.days > 0 && (
                  <Text className='text-[22px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded ml-1.5 font-medium'>
                    {partner.days}天
                  </Text>
                )}
              </View>
            </View>

            {partner.budgetPerPerson > 0 && (
              <Row label='人均预算' value={<Text className='text-[32px] text-orange-600 font-bold'>¥{partner.budgetPerPerson}</Text>} />
            )}

            {partner.desc && (
              <View className='pt-2 border-t border-gray-50'>
                <Text className='text-[24px] text-gray-400 block mb-1.5'>计划说明</Text>
                <Text className='text-[26px] text-gray-700 leading-relaxed bg-gray-50/80 p-3 rounded-xl block border border-gray-100/60'>
                  {partner.desc}
                </Text>
              </View>
            )}
          </SectionCard>

          {/* Card 2: 费用详情 */}
          {(partner.feeMode !== undefined || partner.feeInclude || partner.feeExclude || (partner.estTotal ?? 0) > 0) && (
            <SectionCard title='费用详情'>
              <Row label='费用模式' value={FEE_LABELS[partner.feeMode] || '未知'} />
              {(partner.estTotal ?? 0) > 0 && <Row label='预估总费用' value={`¥${partner.estTotal}`} />}
              {partner.feeInclude && <Row label='费用包含' value={partner.feeInclude} />}
              {partner.feeExclude && <Row label='费用不含' value={partner.feeExclude} />}
            </SectionCard>
          )}

          {/* Card 3: 招募要求 */}
          <SectionCard title='招募要求'>
            <Row label='当前成员' value={`👥 ${partner.currentMembers} / ${partner.maxMembers} 人`} />
            {(partner.minMembers ?? 0) > 0 && <Row label='最少成行' value={`${partner.minMembers} 人`} />}
            <Row label='性别限制' value={GENDER_LABELS[partner.genderLimit] || '不限'} />
            {partner.maleCount > 0 && partner.femaleCount > 0 && partner.genderLimit === 3 && (
              <Row label='名额分配' value={`男 ${partner.maleCount} / 女 ${partner.femaleCount}`} />
            )}
            {(partner.minAge ?? 0) > 0 || (partner.maxAge ?? 0) > 0 ? (
              <Row label='年龄要求' value={`${partner.minAge || 0} - ${partner.maxAge || 99} 岁`} />
            ) : null}
            <Row label='加入方式' value={partner.joinMode === 0 ? '自由加入' : '需审核'} />
            {partner.requirement && (
              <View className='pt-2 border-t border-gray-50'>
                <Text className='text-[24px] text-gray-400 block mb-1.5'>报名条件</Text>
                <Text className='text-[26px] text-gray-700 bg-orange-50/50 border border-orange-100/80 rounded-xl p-3 leading-relaxed block'>
                  {partner.requirement}
                </Text>
              </View>
            )}
          </SectionCard>

          {/* Card 4: 旅行标签 */}
          {partner.travelTags && (
            <SectionCard title='旅行标签'>
              <View className='flex flex-row flex-wrap gap-2'>
                {partner.travelTags.split(',').map((tag, i) => (
                  <View
                    key={i}
                    className='bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 px-3 py-1 rounded-full'
                  >
                    <Text className='text-[24px] text-orange-600 font-medium'>#{tag.trim()}</Text>
                  </View>
                ))}
              </View>
            </SectionCard>
          )}

          {/* Card 5: 详细介绍 */}
          {partner.richDesc && (
            <SectionCard title='详细介绍'>
              <Text className='text-[26px] text-gray-700 leading-relaxed whitespace-pre-line'>
                {partner.richDesc}
              </Text>
            </SectionCard>
          )}

          {/* Card 6: 关联行程 */}
          {partner.trip && (
            <SectionCard title='关联行程'>
              <View
                className='bg-gray-50 rounded-xl p-3 space-y-2 active:opacity-80'
                onClick={() => Taro.navigateTo({ url: `/pages/trip/detail/index?id=${partner.trip.id}` })}
              >
                <Text className='text-[26px] font-bold text-gray-800'>{partner.trip.title}</Text>
                {partner.trip.summary && (
                  <Text className='text-[24px] text-gray-500 line-clamp-2'>{partner.trip.summary}</Text>
                )}
                <View className='flex flex-row flex-wrap gap-1.5'>
                  {partner.trip.destinations?.map((d, i) => (
                    <Text key={i} className='text-[20px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded'>{d}</Text>
                  ))}
                </View>
              </View>
            </SectionCard>
          )}

          {/* ---- Comment Section ---- */}
          <View id='partner-comment-section'>
            <CommentSection
              targetId={id || ''}
              className="mx-0"
              targetType='partner'
              data={partner}
              refreshKey={commentRefreshKey}
              onReplyComment={handleReplyComment}
            />
          </View>
        </View>
      </ScrollView>

      {/* ===== Bottom Action Bar ===== */}
      <View className='fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 z-30 shadow-lg pb-[max(12px,env(safe-area-inset-bottom))]'>
        <View className='flex flex-row items-center'>
          {/* Left: Apply / Status */}
          <View className='flex-1 mr-3'>
            {canApply ? (
              <View
                onClick={() => setApplyVisible(true)}
                className='w-full bg-[#F97316] active:bg-[#EA580C] text-white text-center py-2.5 rounded-xl font-bold text-[28px] shadow-md active:scale-[0.98] transition-all'
              >
                申请加入
              </View>
            ) : isSelf ? (
              <View className='w-full bg-gray-100 text-gray-400 text-center py-2.5 rounded-xl font-medium text-[26px]'>
                你创建的搭子行程
              </View>
            ) : (
              <View className='w-full bg-gray-100 text-gray-400 text-center py-2.5 rounded-xl font-medium text-[26px]'>
                招募已结束或已满员
              </View>
            )}
          </View>

          {/* Right: Social Icons */}
          <View className='flex flex-row items-center space-x-3'>
            {/* Like */}
            <View
              onClick={handleLikeToggle}
              className='flex flex-col items-center min-w-[50px] active:scale-90 transition-transform'
            >
              <Text
                className={`iconfont ${partner.isLiked ? 'icon-follow-fill text-[32px]' : 'icon-follow text-[32px]'}`}
                style={{ color: partner.isLiked ? '#f87171' : '#57534e' }}
              />
              <Text
                className='text-[18px] font-medium'
                style={{ color: partner.isLiked ? '#F97316' : '#78716c' }}
              >
                {partner.likeCount ?? 0}
              </Text>
            </View>

            {/* Comment */}
            <View
              onClick={() => setShowCommentInput(true)}
              className='flex flex-col items-center min-w-[50px] active:scale-90 transition-transform'
            >
              <Text className='iconfont icon-message text-[32px] text-stone-700' />
              <Text className='text-[18px] text-stone-500 font-medium'>{partner.commentCount ?? 0}</Text>
            </View>

            {/* Favorite */}
            <View
              onClick={handleCollectToggle}
              className='flex flex-col items-center min-w-[50px] active:scale-90 transition-transform'
            >
              <Text
                className={`iconfont ${partner.isFavorited ? 'icon-shoucang text-[32px]' : 'icon-weishoucang text-[32px]'}`}
                style={{ color: partner.isFavorited ? '#F97316' : '#57534e' }}
              />
              <Text
                className='text-[18px] font-medium'
                style={{ color: partner.isFavorited ? '#F97316' : '#78716c' }}
              >
                {partner.favoriteCount ?? 0}
              </Text>
            </View>

            {/* Share */}
            <Button
              openType='share'
              className='flex flex-col items-center min-w-[50px] active:scale-90 transition-transform bg-transparent p-0 m-0 border-0 after:border-0'
            >
              <Text className='iconfont icon-share text-[32px]' />
              <Text className='text-[18px] text-stone-500 font-medium'>分享</Text>
            </Button>
          </View>
        </View>
      </View>

      {/* ===== Apply Modal ===== */}
      <Modal
        visible={applyVisible}
        title='申请加入'
        confirmText='发送申请'
        confirmLoading={applying}
        showCancel
        onConfirm={handleApply}
        onCancel={() => { setApplyVisible(false); setApplyRemark('') }}
      >
        <View className='pt-2'>
          <Text className='text-[24px] text-gray-500 mb-2 block'>打个招呼吧，让队长更了解你：</Text>
          <Textarea
            value={applyRemark}
            onInput={(e) => setApplyRemark(e.detail.value)}
            placeholder='例如：有丰富自驾经验 / 时间可微调 / 随和好相处…'
            placeholderClass='text-gray-400'
            className='w-full bg-gray-50 rounded-xl p-3 text-[26px] text-gray-800 border border-gray-200 box-border'
            style={{ minHeight: '100px' }}
          />
        </View>
      </Modal>

      {/* ===== Comment Input Overlay ===== */}
      <View
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          showCommentInput ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <View
          className='absolute inset-0 bg-black/35 backdrop-blur-[2px]'
          onClick={() => { setShowCommentInput(false); setCommentText(''); setReplyTo(null) }}
        />
        <View
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-5 pb-safe shadow-lg transition-transform duration-300 ease-out transform ${
            showCommentInput ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {replyTo && (
            <View className='flex flex-row items-center justify-between mb-3 px-3 py-2 bg-orange-50/60 rounded-xl border border-orange-100/50'>
              <View className='flex flex-row items-center'>
                <Text className='text-[20px] bg-[#F97316] text-white px-2 py-0.5 rounded-md mr-2 font-bold'>回复</Text>
                <Text className='text-[24px] text-stone-700 font-medium'>@{replyTo.nickname}</Text>
              </View>
              <Text
                onClick={() => { setCommentText(''); setReplyTo(null) }}
                className='text-[22px] text-stone-400 active:text-stone-600 px-2'
              >
                取消
              </Text>
            </View>
          )}
          <View className='flex flex-row items-center space-x-3'>
            <Input
              type='text'
              placeholder={replyTo ? `回复 ${replyTo.nickname}...` : '说点什么...'}
              value={commentText}
              onInput={(e) => setCommentText(e.detail.value)}
              className='flex-1 h-12 bg-stone-50 border border-stone-100 rounded-2xl px-4 text-[26px] placeholder-stone-400'
              focus={showCommentInput}
              confirmType='send'
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
  )
}

// --- Helper Components ---

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3'>
      <View className='flex items-center mb-1'>
        <View className='w-1.5 h-3.5 bg-orange-500 rounded-full mr-2' />
        <Text className='text-[28px] font-bold text-gray-800'>{title}</Text>
      </View>
      {children}
    </View>
  )
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <View className='flex items-center justify-between'>
      <Text className='text-[26px] text-gray-500 flex-shrink-0'>{label}</Text>
      <View className='text-right max-w-[60%]'>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text className='text-[26px] text-gray-800 font-medium'>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  )
}
