import { useState } from 'react'
import { View, Text, Picker, Input, Textarea, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { NavBar } from '@/components'
import { submitComplaint } from '@/api/complaint'
import { uploadMultiImages } from '@/utils/upload'

// 投诉对象类型
const TARGET_OPTIONS = [
  { label: '用户', value: 'user' },
  { label: '攻略', value: 'guide' },
  { label: '行程', value: 'trip' },
  { label: '搭子', value: 'partner' },
  { label: '评论', value: 'comment' },
  { label: '其他', value: 'other' },
]
// 投诉原因
const REASON_OPTIONS = ['垃圾广告', '辱骂攻击', '违法违规', '虚假信息', '骚扰纠缠', '其他']

export default function ComplaintPage() {
  const router = useRouter()
  // 带参进入时预填（如"再次投诉"）
  const params = router.params || {}
  const preTargetIndex = TARGET_OPTIONS.findIndex((t) => t.value === params.targetType)
  const [targetIndex, setTargetIndex] = useState(
    preTargetIndex >= 0 ? preTargetIndex : 0
  ) // 默认第一个"用户"
  const [targetId, setTargetId] = useState(params.targetId || '')
  const [reasonIndex, setReasonIndex] = useState(-1)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 选择并上传图片（最多9张）
  const handleChooseImage = async () => {
    const remain = 9 - images.length
    if (remain <= 0) return
    try {
      const res = await Taro.chooseImage({ count: remain, sizeType: ['compressed'] })
      setUploading(true)
      const urls = await uploadMultiImages(res.tempFilePaths)
      setImages((prev) => [...prev, ...urls].slice(0, 9))
    } catch { /* ignore */ } finally {
      setUploading(false)
    }
  }

  // 删除已选图片
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // 预览图片
  const handlePreviewImage = (current: string) => {
    Taro.previewImage({ current, urls: images })
  }

  // 跳转我的投诉列表
  const goList = () => {
    Taro.navigateTo({ url: '/pages/complaint/list/index' })
  }

  const handleSubmit = async () => {
    if (reasonIndex < 0) {
      Taro.showToast({ title: '请选择投诉原因', icon: 'none' })
      return
    }
    if (content.trim().length < 5) {
      Taro.showToast({ title: '请至少填写5个字的问题描述', icon: 'none' })
      return
    }
    const target = TARGET_OPTIONS[targetIndex]
    setSubmitting(true)
    try {
      await submitComplaint({
        targetType: target.value,
        targetId: target.value === 'other' ? undefined : targetId.trim(),
        reason: REASON_OPTIONS[reasonIndex],
        content: content.trim(),
        images,
      })
      Taro.showToast({ title: '提交成功，我们会尽快处理', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1200)
    } catch {
      Taro.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='min-h-screen bg-[#FAFAF9] px-4 pb-10 font-sans'>
      <View className='bg-white rounded-2xl px-5 py-5 shadow-sm my-4'>
        <View className='flex flex-row items-center justify-between mb-4'>
          <Text className='text-[24px] text-stone-400'>请如实填写投诉信息，我们会尽快核实处理</Text>
          <Text className='text-[24px] text-orange-500 font-medium flex-shrink-0 ml-2 active:opacity-70' onClick={goList}>
            我的投诉 ›
          </Text>
        </View>

        {/* 投诉对象 */}
        <View className='mb-5'>
          <Text className='text-[26px] font-bold text-stone-800 block mb-2'>投诉对象</Text>
          <Picker
            mode='selector'
            range={TARGET_OPTIONS.map((t) => t.label)}
            value={targetIndex}
            onChange={(e) => setTargetIndex(Number(e.detail.value))}
          >
            <View className='bg-stone-50 rounded-xl px-4 py-3 flex flex-row items-center justify-between'>
              <Text className={targetIndex >= 0 ? 'text-[26px] text-stone-800' : 'text-[26px] text-stone-300'}>
                {TARGET_OPTIONS[targetIndex].label}
              </Text>
              <Text className='iconfont icon-next text-[26px] text-stone-300' />
            </View>
          </Picker>
        </View>

        {/* 对象ID */}
        {TARGET_OPTIONS[targetIndex].value !== 'other' && (
          <View className='mb-5'>
            <Text className='text-[26px] font-bold text-stone-800 block mb-2'>对象ID</Text>
            <View className='bg-stone-50 rounded-xl px-4 py-3 flex flex-row items-center'>
              <Input
                className='flex-1 text-[26px] text-stone-800'
                placeholder='请输入被投诉对象的ID'
                placeholderClass='text-stone-300'
                value={targetId}
                onInput={(e) => setTargetId(e.detail.value)}
              />
            </View>
          </View>
        )}

        {/* 投诉原因 */}
        <View className='mb-5'>
          <Text className='text-[26px] font-bold text-stone-800 block mb-2'>投诉原因</Text>
          <Picker
            mode='selector'
            range={REASON_OPTIONS}
            value={reasonIndex < 0 ? 0 : reasonIndex}
            onChange={(e) => setReasonIndex(Number(e.detail.value))}
          >
            <View className='bg-stone-50 rounded-xl px-4 py-3 flex flex-row items-center justify-between'>
              <Text className={reasonIndex >= 0 ? 'text-[26px] text-stone-800' : 'text-[26px] text-stone-300'}>
                {reasonIndex >= 0 ? REASON_OPTIONS[reasonIndex] : '请选择投诉原因'}
              </Text>
              <Text className='iconfont icon-next text-[26px] text-stone-300' />
            </View>
          </Picker>
        </View>

        {/* 图片证据（最多9张） */}
        <View className='mb-5'>
          <Text className='text-[26px] font-bold text-stone-800 block mb-2'>图片证据（最多9张）</Text>
          <View className='grid grid-cols-3 gap-2'>
            {images.map((img, i) => (
              <View key={i} className='relative w-full h-28'>
                <Image
                  className='w-full h-full rounded-xl bg-stone-100'
                  src={img}
                  mode='aspectFill'
                  onClick={() => handlePreviewImage(img)}
                />
                <View
                  className='absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center'
                  onClick={() => handleRemoveImage(i)}
                >
                  <Text className='iconfont icon-close text-[20px] text-white' />
                </View>
              </View>
            ))}
            {images.length < 9 && (
              <View
                className={`w-full h-28 rounded-xl bg-stone-50 border border-dashed border-stone-300 flex flex-col items-center justify-center ${uploading ? 'opacity-60' : ''}`}
                onClick={handleChooseImage}
              >
                <Text className='iconfont icon-plus text-[40px] text-stone-300' />
                <Text className='text-[22px] text-stone-300 mt-1'>{uploading ? '上传中...' : '添加图片'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 描述 */}
        <View>
          <Text className='text-[26px] font-bold text-stone-800 block mb-2'>问题描述</Text>
          <Textarea
            className='w-full bg-stone-50 rounded-xl p-4 text-[26px] text-stone-800 box-border h-40 leading-relaxed'
            placeholder='请详细描述投诉内容（5-500字）'
            placeholderClass='text-stone-300'
            maxlength={500}
            value={content}
            onInput={(e) => setContent(e.detail.value)}
          />
          <Text className='text-[22px] text-stone-300 block text-right mt-1'>{content.length}/500</Text>
        </View>
      </View>

      <View
        className={`bg-orange-500 text-white text-center text-[30px] font-bold rounded-full py-3.5 active:opacity-80 ${submitting ? 'opacity-60' : ''}`}
        onClick={handleSubmit}
      >
        提交投诉
      </View>
    </View>
  )
}
