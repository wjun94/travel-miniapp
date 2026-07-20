import { useState } from 'react'
import { View, Text, Input, Textarea, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { NavBar, Image } from '@/components'
import { createPartner } from '@/api/partner'
import { uploadMultiImages } from '@/utils/upload'

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
      Taro.showLoading({ title: '上传中...', mask: true })
      const urls = await uploadMultiImages(res.tempFilePaths)
      Taro.hideLoading()
      if (urls[0]) setCover(urls[0])
    } catch {
      Taro.hideLoading()
    }
  }

  const handleSubmit = async () => {
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
    <View className='min-h-screen bg-gray-50 flex flex-col'>
      <NavBar title='发布搭子' showBack />

      <View className='flex-1 px-4 pt-4 pb-6 overflow-y-auto'>
        {/* 标题 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>标题 *</Text>
          <Input
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            placeholder='给你的搭子起个名字吧'
            className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'
          />
        </View>

        {/* 描述 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>描述</Text>
          <Textarea
            value={desc}
            onInput={(e) => setDesc(e.detail.value)}
            placeholder='简单描述一下你的旅行计划'
            className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100 w-full'
            style={{ minHeight: '100px' }}
          />
        </View>

        {/* 目的地 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>目的地 *</Text>
          <Input
            value={destination}
            onInput={(e) => setDestination(e.detail.value)}
            placeholder='例如：大理、成都'
            className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'
          />
        </View>

        {/* 封面 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>封面图</Text>
          {cover ? (
            <View className='relative w-full h-40 rounded-xl overflow-hidden'>
              <Image src={cover} mode='aspectFill' className='w-full h-full' />
              <View
                onClick={() => setCover('')}
                className='absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center'
              >
                <Text className='text-white text-[20px]'>×</Text>
              </View>
            </View>
          ) : (
            <View
              onClick={handleChooseCover}
              className='w-full h-40 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center'
            >
              <Text className='text-gray-400 text-[28px]'>+ 选择封面</Text>
            </View>
          )}
        </View>

        {/* 时间 */}
        <View className='mb-4 flex flex-row space-x-3'>
          <View className='flex-1'>
            <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>开始日期</Text>
            <Picker mode='date' value={startDate} onChange={(e) => setStartDate(e.detail.value)}>
              <View className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'>
                <Text className={startDate ? 'text-gray-800' : 'text-gray-400'}>{startDate || '请选择'}</Text>
              </View>
            </Picker>
          </View>
          <View className='flex-1'>
            <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>结束日期</Text>
            <Picker mode='date' value={endDate} onChange={(e) => setEndDate(e.detail.value)}>
              <View className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'>
                <Text className={endDate ? 'text-gray-800' : 'text-gray-400'}>{endDate || '请选择'}</Text>
              </View>
            </Picker>
          </View>
        </View>

        {/* 最大人数 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>最大人数 *</Text>
          <Input
            value={maxMembers}
            onInput={(e) => setMaxMembers(e.detail.value)}
            placeholder='输入数字'
            type='number'
            className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'
          />
        </View>

        {/* 出行类型 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>出行方式</Text>
          <Picker
            mode='selector'
            range={TYPE_OPTIONS}
            rangeKey='label'
            value={type}
            onChange={(e) => setType(TYPE_OPTIONS[e.detail.value].value)}
          >
            <View className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'>
              <Text className='text-gray-800'>{TYPE_OPTIONS[type].label}</Text>
            </View>
          </Picker>
        </View>

        {/* 性别限制 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>性别限制</Text>
          <Picker
            mode='selector'
            range={GENDER_OPTIONS}
            rangeKey='label'
            value={genderLimit}
            onChange={(e) => setGenderLimit(GENDER_OPTIONS[e.detail.value].value)}
          >
            <View className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'>
              <Text className='text-gray-800'>{GENDER_OPTIONS[genderLimit].label}</Text>
            </View>
          </Picker>
        </View>

        {/* 标签 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>标签</Text>
          <Input
            value={travelTags}
            onInput={(e) => setTravelTags(e.detail.value)}
            placeholder='多个标签用逗号分隔'
            className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'
          />
        </View>

        {/* 预算 */}
        <View className='mb-4'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>人均预算（元）</Text>
          <Input
            value={budgetPerPerson}
            onInput={(e) => setBudgetPerPerson(e.detail.value)}
            placeholder='输入预算'
            type='digit'
            className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100'
          />
        </View>

        {/* 要求 */}
        <View className='mb-6'>
          <Text className='text-gray-700 text-[26px] font-medium mb-2 block'>加入要求</Text>
          <Textarea
            value={requirement}
            onInput={(e) => setRequirement(e.detail.value)}
            placeholder='对同行伙伴的要求…'
            className='bg-white rounded-xl px-4 py-3 text-[28px] border border-gray-100 w-full'
            style={{ minHeight: '80px' }}
          />
        </View>

        {/* 公开/私密切换 */}
        <View className='mb-6 flex flex-row items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100'>
          <Text className='text-gray-700 text-[28px] font-medium'>公开</Text>
          <View
            onClick={() => setIsPublic(isPublic ? 0 : 1)}
            className={`w-12 h-6 rounded-full px-0.5 flex items-center transition-colors ${isPublic ? 'bg-[#F97316] justify-end' : 'bg-gray-300 justify-start'}`}
          >
            <View className='w-5 h-5 bg-white rounded-full shadow-sm' />
          </View>
        </View>

        {/* 提交按钮 */}
        <View
          onClick={handleSubmit}
          className={`w-full py-3 rounded-xl text-center font-bold text-[30px] ${submitting ? 'bg-gray-300 text-gray-500' : 'bg-[#F97316] text-white active:opacity-90'}`}
        >
          {submitting ? '发布中...' : '发布搭子'}
        </View>
      </View>
    </View>
  )
}
