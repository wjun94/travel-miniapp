import { useState } from 'react'
import { View, Text, Input, Textarea, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { NavBar, Image } from '@/components'
import { createPartner } from '@/api/partner'
import { uploadSingleFile } from '@/utils/upload'

const TYPE_OPTIONS = [
  { value: 0, label: '不限' },
  { value: 1, label: '自由行' },
  { value: 2, label: '跟团游' },
  { value: 3, label: '自驾游' },
]

const GENDER_OPTIONS = [
  { value: 0, label: '不限' },
  { value: 1, label: '仅限男' },
  { value: 2, label: '仅限女' },
]

export default function CreatePartnerPage() {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [destination, setDestination] = useState('')
  const [cover, setCover] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [maxMembers, setMaxMembers] = useState('')
  const [travelTags, setTravelTags] = useState('')
  const [budgetPerPerson, setBudgetPerPerson] = useState('')
  const [requirement, setRequirement] = useState('')
  const [type, setType] = useState(0)
  const [genderLimit, setGenderLimit] = useState(0)
  const [isPublic, setIsPublic] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const handleChooseCover = async () => {
    try {
      const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'] })
      const data = await uploadSingleFile(res.tempFilePaths[0])
      if (data?.url) setCover(data.url)
    } catch { /* ignore */ }
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (!title.trim()) {
      Taro.showToast({ title: '请填写标题', icon: 'none' })
      return
    }
    if (!destination.trim()) {
      Taro.showToast({ title: '请填写目的地', icon: 'none' })
      return
    }
    if (!maxMembers || parseInt(maxMembers) < 1) {
      Taro.showToast({ title: '请填写有效最大人数', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const days = startDate && endDate
        ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 0

      await createPartner({
        id: '',
        tripId: '',
        userId: '',
        title: title.trim(),
        desc: desc.trim(),
        destination: destination.trim(),
        cover,
        startDate,
        endDate,
        days: Math.max(0, days),
        createdAt: '',
        updatedAt: '',
        currentMembers: 0,
        maxMembers: parseInt(maxMembers),
        minAge: 0,
        maxAge: 100,
        genderLimit,
        requirement: requirement.trim(),
        budgetPerPerson: parseFloat(budgetPerPerson) || 0,
        officialPrice: 0,
        latitude: 0,
        longitude: 0,
        travelTags,
        type,
        isPublic,
        status: 0,
        sortWeight: 0,
        viewCount: 0,
      })
      Taro.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch {
      Taro.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='min-h-screen bg-gray-100/60 flex flex-col'>
      <NavBar title='发布搭子' showBack />

      <View className='flex-1 px-4 pt-3 pb-8 overflow-y-auto space-y-4'>
        {/* 卡片 1：核心基本信息 */}
        <View className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 space-y-4'>
          {/* 标题 */}
          <View>
            <View className='flex items-center mb-1.5'>
              <Text className='text-gray-800 text-[26px] font-semibold'>标题</Text>
              <Text className='text-red-500 text-[26px] ml-0.5'>*</Text>
            </View>
            <Input
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              placeholder='给你的搭子起个吸引人的名字吧'
              placeholderClass='text-gray-400'
              className='bg-gray-50/80 rounded-xl px-3.5 h-11 text-[28px] text-gray-800 border border-gray-100'
            />
          </View>

          {/* 目的地 */}
          <View>
            <View className='flex items-center mb-1.5'>
              <Text className='text-gray-800 text-[26px] font-semibold'>目的地</Text>
              <Text className='text-red-500 text-[26px] ml-0.5'>*</Text>
            </View>
            <Input
              value={destination}
              onInput={(e) => setDestination(e.detail.value)}
              placeholder='例如：大理、成都、阿勒泰'
              placeholderClass='text-gray-400'
              className='bg-gray-50/80 rounded-xl px-3.5 h-11 text-[28px] text-gray-800 border border-gray-100'
            />
          </View>

          {/* 封面图 */}
          <View>
            <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>封面图</Text>
            {cover ? (
              <View className='relative w-full h-44 rounded-xl overflow-hidden shadow-inner group'>
                <Image src={cover} mode='aspectFill' className='w-full h-full' />
                <View
                  onClick={() => setCover('')}
                  className='absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center active:scale-90 transition-transform'
                >
                  <Text className='text-white text-[24px] leading-none mb-0.5'>×</Text>
                </View>
              </View>
            ) : (
              <View
                onClick={handleChooseCover}
                className='w-full h-32 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 active:bg-gray-100 flex flex-col items-center justify-center transition-colors'
              >
                <Text className='text-gray-400 text-[36px] font-light mb-1'>+</Text>
                <Text className='text-gray-400 text-[24px]'>上传吸引人的封面</Text>
              </View>
            )}
          </View>

          {/* 描述 */}
          <View>
            <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>描述</Text>
            <Textarea
              value={desc}
              onInput={(e) => setDesc(e.detail.value)}
              placeholder='简单描述一下你的旅行计划、行程亮点或想法…'
              placeholderClass='text-gray-400'
              className='bg-gray-50/80 rounded-xl p-3 text-[28px] text-gray-800 border border-gray-100 w-full box-border'
              style={{ minHeight: '90px' }}
            />
          </View>
        </View>

        {/* 卡片 2：行程参数 */}
        <View className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 space-y-4'>
          {/* 日期范围 */}
          <View className='flex flex-row space-x-3'>
            <View className='flex-1'>
              <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>开始日期</Text>
              <Picker mode='date' value={startDate} onChange={(e) => setStartDate(e.detail.value)}>
                <View className='bg-gray-50/80 rounded-xl px-3.5 h-11 border border-gray-100 flex items-center justify-between'>
                  <Text className={`text-[28px] ${startDate ? 'text-gray-800' : 'text-gray-400'}`}>
                    {startDate || '选择日期'}
                  </Text>
                  <Text className='text-gray-400 text-[20px]'>›</Text>
                </View>
              </Picker>
            </View>
            <View className='flex-1'>
              <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>结束日期</Text>
              <Picker mode='date' value={endDate} onChange={(e) => setEndDate(e.detail.value)}>
                <View className='bg-gray-50/80 rounded-xl px-3.5 h-11 border border-gray-100 flex items-center justify-between'>
                  <Text className={`text-[28px] ${endDate ? 'text-gray-800' : 'text-gray-400'}`}>
                    {endDate || '选择日期'}
                  </Text>
                  <Text className='text-gray-400 text-[20px]'>›</Text>
                </View>
              </Picker>
            </View>
          </View>

          {/* 最大人数 & 预算 */}
          <View className='flex flex-row space-x-3'>
            <View className='flex-1'>
              <View className='flex items-center mb-1.5'>
                <Text className='text-gray-800 text-[26px] font-semibold'>招募人数</Text>
                <Text className='text-red-500 text-[26px] ml-0.5'>*</Text>
              </View>
              <Input
                value={maxMembers}
                onInput={(e) => setMaxMembers(e.detail.value)}
                placeholder='例如: 4'
                placeholderClass='text-gray-400'
                type='number'
                className='bg-gray-50/80 rounded-xl px-3.5 h-11 text-[28px] text-gray-800 border border-gray-100'
              />
            </View>
            <View className='flex-1'>
              <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>人均预算 (元)</Text>
              <Input
                value={budgetPerPerson}
                onInput={(e) => setBudgetPerPerson(e.detail.value)}
                placeholder='例如: 2000'
                placeholderClass='text-gray-400'
                type='digit'
                className='bg-gray-50/80 rounded-xl px-3.5 h-11 text-[28px] text-gray-800 border border-gray-100'
              />
            </View>
          </View>

          {/* 出行类型 & 性别限制 */}
          <View className='flex flex-row space-x-3'>
            <View className='flex-1'>
              <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>出行方式</Text>
              <Picker
                mode='selector'
                range={TYPE_OPTIONS}
                rangeKey='label'
                value={type}
                onChange={(e) => setType(TYPE_OPTIONS[e.detail.value].value)}
              >
                <View className='bg-gray-50/80 rounded-xl px-3.5 h-11 border border-gray-100 flex items-center justify-between'>
                  <Text className='text-gray-800 text-[28px]'>{TYPE_OPTIONS[type].label}</Text>
                  <Text className='text-gray-400 text-[20px]'>›</Text>
                </View>
              </Picker>
            </View>
            <View className='flex-1'>
              <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>性别限制</Text>
              <Picker
                mode='selector'
                range={GENDER_OPTIONS}
                rangeKey='label'
                value={genderLimit}
                onChange={(e) => setGenderLimit(GENDER_OPTIONS[e.detail.value].value)}
              >
                <View className='bg-gray-50/80 rounded-xl px-3.5 h-11 border border-gray-100 flex items-center justify-between'>
                  <Text className='text-gray-800 text-[28px]'>{GENDER_OPTIONS[genderLimit].label}</Text>
                  <Text className='text-gray-400 text-[20px]'>›</Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>

        {/* 卡片 3：要求与偏好 */}
        <View className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 space-y-4'>
          {/* 标签 */}
          <View>
            <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>旅行标签</Text>
            <Input
              value={travelTags}
              onInput={(e) => setTravelTags(e.detail.value)}
              placeholder='例如: 摄影, 随性, 摄影发烧友 (逗号分隔)'
              placeholderClass='text-gray-400'
              className='bg-gray-50/80 rounded-xl px-3.5 h-11 text-[28px] text-gray-800 border border-gray-100'
            />
          </View>

          {/* 要求 */}
          <View>
            <Text className='text-gray-800 text-[26px] font-semibold mb-1.5 block'>加入要求</Text>
            <Textarea
              value={requirement}
              onInput={(e) => setRequirement(e.detail.value)}
              placeholder='对队友的期望（如：性格随和、会开车、不计较等）…'
              placeholderClass='text-gray-400'
              className='bg-gray-50/80 rounded-xl p-3 text-[28px] text-gray-800 border border-gray-100 w-full box-border'
              style={{ minHeight: '80px' }}
            />
          </View>

          {/* 公开/私密开关 */}
          <View className='flex flex-row items-center justify-between pt-1'>
            <View className='flex-1 pr-4'>
              <Text className='text-gray-800 text-[28px] font-semibold block'>公开此搭子</Text>
              <Text className='text-gray-400 text-[22px] block mt-0.5'>关闭后将不展示在公共推荐列表中</Text>
            </View>

            {/* 开关轨道 */}
            <View
              onClick={() => setIsPublic(isPublic ? 0 : 1)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${isPublic ? 'bg-[#F97316]' : 'bg-gray-300'
                }`}
            >
              {/* 开关滑块 */}
              <View
                className='absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200'
                style={{
                  transform: isPublic ? 'translateX(24px)' : 'translateX(0px)',
                }}
              />
            </View>
          </View>
        </View>

        {/* 提交按钮区域 */}
        <View className='pt-2 pb-4'>
          <View
            onClick={handleSubmit}
            className={`w-full h-12 rounded-xl flex items-center justify-center font-semibold text-[30px] text-white shadow-md active:scale-[0.98] transition-all ${submitting ? 'bg-orange-300 pointer-events-none' : 'bg-[#F97316] active:bg-[#EA580C]'
              }`}
          >
            {submitting ? '发布中...' : '发布搭子'}
          </View>
        </View>
      </View>
    </View>
  )
}