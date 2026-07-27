import React, { useState } from 'react';
import { View, Text, Input, Textarea, Switch, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';

// 推荐配置 Tailwind 的主题颜色:
// 主题色 Sunset Orange: #F97316 (Tailwind 原生 bg-orange-500 / text-orange-500)

export default function PublishForm() {
    // 表单状态管理，映射 JSON 结构
    const [formData, setFormData] = useState({
        title: '周末一起去看海！露营+赶海+日落摄影',
        category: '旅游',
        startDate: '2024-06-01 08:00',
        endDate: '2024-06-02 18:00',
        totalDays: 2,
        address: '广东省深圳市南山区深圳湾公园停车场',
        destination: '惠州市惠东县双月湾',
        maxMembers: 8,
        minMembers: 4,
        genderLimit: 3, // 0不限 1仅男生 2仅女生 3自定义
        maleCount: 4,
        femaleCount: 4,
        feeMode: 1, // 0免费 1AA 2组织者全包 3人均预算
        budgetPerPerson: 300,
        feeInclude: '交通费、住宿费、景点门票、保险',
        feeExclude: '餐饮费、个人消费、其他未提及费用',
        estTotal: 600,
        richDesc: 'Day1: 深圳出发 -> 双月湾 -> 入住海景房 -> 日落摄影\nDay2: 赶海体验 -> 盐洲岛打卡 -> 返程\n玩法：露营、赶海、摄影、海边BBQ\n注意事项：防晒必备，注意潮汐时间，环保出行~',
        minAge: 20,
        maxAge: 35,
        requirement: '开朗随和、好相处；无经验要求',
        tags: '能早起,会拍照,无晕车',
        cover: '',
        images: '',
        travelTags: '徒步,摄影,狂潮,美食,穷游,特种兵旅行',
        visibility: 0, // 0全部用户可见
        joinMode: 1, // 1需要审核
        autoClose: 1, // 1开启
        allowShare: 1,
        allowCollect: 1,
        isDraft: 0,
        isPublic: 1
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <View className="min-h-screen bg-[#FFFDF9] pb-10 text-gray-800">
            {/* 顶部导航 */}
            <View className="flex justify-between items-center px-4 py-3 bg-white sticky top-0 z-50 shadow-sm">
                <View className="text-lg font-bold">发布搭子</View>
                <Text className="text-orange-500 text-sm bg-orange-50 px-3 py-1 rounded-full">草稿箱</Text>
            </View>

            <ScrollView scrollY className="px-4 pt-3 box-border">
                {/* 1. 基础必需信息 */}
                <Section title="基础必需信息">
                    {/* 标题 */}
                    <View className="mb-4">
                        <View className="flex justify-between items-center mb-1">
                            <Text className="text-xs text-gray-500 font-medium">搭子标题 <Text className="text-red-500">*</Text></Text>
                            <Text className="text-xs text-gray-400">{formData.title.length}/30</Text>
                        </View>
                        <Input
                            className="bg-gray-50 rounded-lg p-2.5 text-sm w-full box-border"
                            value={formData.title}
                            maxlength={30}
                            onInput={e => handleInputChange('title', e.detail.value)}
                        />
                    </View>

                    {/* 活动类型 */}
                    <View className="mb-2">
                        <Text className="text-xs text-gray-500 font-medium block mb-2">活动类型 <Text className="text-red-500">*</Text></Text>
                        <View className="flex flex-wrap gap-2">
                            {['旅游', '美食', '运动', '学习', '探店', '看展', '桌游'].map((cat) => (
                                <View
                                    key={cat}
                                    onClick={() => handleInputChange('category', cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${formData.category === cat
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'bg-gray-50 text-gray-600 border-gray-100'
                                        }`}
                                >
                                    {cat}
                                </View>
                            ))}
                            <View className="px-3 py-1.5 rounded-full text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-300">+ 自定义</View>
                        </View>
                    </View>
                </Section>

                {/* 2. 时间设置 */}
                <Section title="时间设置">
                    <View className="space-y-3 text-sm">
                        <View className="flex justify-between items-center py-1 border-b border-gray-50">
                            <Text className="text-gray-500 text-xs">开始时间</Text>
                            <Text className="font-medium text-xs">{formData.startDate}</Text>
                        </View>
                        <View className="flex justify-between items-center py-1 border-b border-gray-50">
                            <Text className="text-gray-500 text-xs">结束时间</Text>
                            <Text className="font-medium text-xs">{formData.endDate}</Text>
                        </View>
                        <View className="flex justify-between items-center py-1">
                            <Text className="text-gray-500 text-xs">行程时长</Text>
                            <Text className="text-xs text-gray-600">2天1夜</Text>
                        </View>
                        <View className="flex justify-between items-center bg-orange-50/50 p-2 rounded-lg">
                            <Text className="text-xs text-gray-600">提醒设置</Text>
                            <Text className="text-xs text-orange-500">提前3小时提醒 &gt;</Text>
                        </View>
                    </View>
                </Section>

                {/* 3. 地点设置 */}
                <Section title="地点设置">
                    <View className="space-y-3">
                        <View>
                            <Text className="text-xs text-gray-400 block">集合地点</Text>
                            <Text className="text-xs font-medium text-gray-700">{formData.address}</Text>
                        </View>
                        <View>
                            <Text className="text-xs text-gray-400 block">目的地</Text>
                            <Text className="text-xs font-medium text-gray-700">{formData.destination}</Text>
                        </View>
                    </View>
                </Section>

                {/* 4. 人数管控 */}
                <Section title="人数管控">
                    <View className="grid grid-cols-3 gap-2 text-center bg-orange-50/30 p-3 rounded-xl mb-4">
                        <View>
                            <Text className="text-xs text-gray-400 block">招募上限</Text>
                            <Text className="text-base font-bold text-gray-800">{formData.maxMembers}人</Text>
                        </View>
                        <View>
                            <Text className="text-xs text-gray-400 block">当前占位</Text>
                            <Text className="text-base font-bold text-gray-800">6人</Text>
                        </View>
                        <View>
                            <Text className="text-xs text-gray-400 block">最少成行</Text>
                            <Text className="text-base font-bold text-gray-800">{formData.minMembers}人</Text>
                        </View>
                    </View>

                    {/* 性别比例 */}
                    <Text className="text-xs text-gray-400 block mb-2">性别比例限制</Text>
                    <View className="grid grid-cols-4 gap-2 mb-3">
                        {['不限', '仅男生', '仅女生', '自定义'].map((mode, idx) => (
                            <View
                                key={mode}
                                onClick={() => handleInputChange('genderLimit', idx)}
                                className={`py-1.5 text-center text-xs rounded-lg ${formData.genderLimit === idx
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {mode}
                            </View>
                        ))}
                    </View>
                    {formData.genderLimit === 3 && (
                        <View className="flex justify-around bg-gray-50 p-2 rounded-lg text-xs">
                            <Text className="text-gray-600">男生名额: {formData.maleCount}人</Text>
                            <Text className="text-gray-600">女生名额: {formData.femaleCount}人</Text>
                        </View>
                    )}
                </Section>

                {/* 5. 费用&规则 */}
                <Section title="费用&规则">
                    <Text className="text-xs text-gray-400 block mb-2">付费模式</Text>
                    <View className="grid grid-cols-4 gap-2 mb-4">
                        {['免费', 'AA制', '组织者全包', '人均预算'].map((fee, idx) => (
                            <View
                                key={fee}
                                onClick={() => handleInputChange('feeMode', idx)}
                                className={`py-1.5 text-center text-xs rounded-lg ${formData.feeMode === idx
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {fee}
                            </View>
                        ))}
                    </View>
                    <View className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg">
                        <Text className="text-xs text-gray-500">人均预算</Text>
                        <View className="flex items-center">
                            <Text className="text-xs text-orange-500 mr-1">¥</Text>
                            <Input
                                className="w-16 text-right text-xs font-bold text-orange-500"
                                value={String(formData.budgetPerPerson)}
                                onInput={e => handleInputChange('budgetPerPerson', Number(e.detail.value))}
                            />
                            <Text className="text-xs text-gray-400 ml-1">元/人</Text>
                        </View>
                    </View>
                </Section>

                {/* 6. 详细介绍 */}
                <Section title="详细介绍 (行程安排、玩法、注意事项等)">
                    <Textarea
                        className="w-full bg-gray-50 rounded-lg p-3 text-xs leading-relaxed h-28 box-border"
                        value={formData.richDesc}
                        maxlength={2000}
                        onInput={e => handleInputChange('richDesc', e.detail.value)}
                    />
                    <Text className="text-right text-xs text-gray-300 block mt-1">
                        {formData.richDesc.length}/2000
                    </Text>
                </Section>

                {/* 7. 发布权限设置 */}
                <Section title="发布权限设置">
                    <View className="space-y-3">
                        <View className="flex justify-between items-center py-1">
                            <Text className="text-xs text-gray-600">成团后自动关闭报名</Text>
                            <Switch
                                checked={formData.autoClose === 1}
                                color="#F97316"
                                onChange={e => handleInputChange('autoClose', e.detail.value ? 1 : 0)}
                            />
                        </View>
                        <View className="flex justify-between items-center py-1">
                            <Text className="text-xs text-gray-600">允许他人转发</Text>
                            <Switch
                                checked={formData.allowShare === 1}
                                color="#F97316"
                                onChange={e => handleInputChange('allowShare', e.detail.value ? 1 : 0)}
                            />
                        </View>
                        <View className="flex justify-between items-center py-1">
                            <Text className="text-xs text-gray-600">允许他人收藏</Text>
                            <Switch
                                checked={formData.allowCollect === 1}
                                color="#F97316"
                                onChange={e => handleInputChange('allowCollect', e.detail.value ? 1 : 0)}
                            />
                        </View>
                    </View>
                </Section>

                {/* 底部按钮栏 */}
                <View className="mt-6 mb-12 flex items-center justify-between gap-2">
                    <View className="flex-1 py-2.5 text-center text-xs border border-gray-200 rounded-full text-gray-600 bg-white">
                        一键清空
                    </View>
                    <View className="flex-1 py-2.5 text-center text-xs border border-orange-200 text-orange-500 rounded-full bg-orange-50">
                        预览
                    </View>
                    <View className="flex-1 py-2.5 text-center text-xs border border-orange-200 text-orange-500 rounded-full bg-orange-50">
                        保存草稿
                    </View>
                    <View className="flex-1 py-2.5 text-center text-xs bg-orange-500 text-white font-medium rounded-full shadow-md shadow-orange-200">
                        正式发布
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// 模块卡片通用容器组件
function Section({ title, children }) {
    return (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-orange-50/50">
            <View className="flex items-center mb-3">
                <View className="w-1.5 h-3.5 bg-orange-500 rounded-full mr-2"></View>
                <Text className="text-sm font-bold text-gray-800">{title}</Text>
            </View>
            {children}
        </View>
    );
}