import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { Image } from '@/components'
import Taro from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { getUserInfo, updateProfile } from '@/api/auth';
import { uploadSingleFile } from '@/utils/upload';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
    const setUserInfo = useAuthStore(s => s.setUserInfo);

    const [avatar, setAvatar] = useState('');
    const [nickname, setNickname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [saving, setSaving] = useState(false);

    // 加载当前用户信息
    const { loading } = useRequest(getUserInfo, {
        onSuccess: (res: any) => {
            const info = res?.data || res;
            if (info) {
                setAvatar(info.avatarUrl || '');
                setNickname(info.nickname || '');
                setPhoneNumber(info.phone || '');
            }
        },
        onError: () => {
            Taro.showToast({ title: '加载用户信息失败', icon: 'none' });
        },
    });

    // 1. 头像选择 — 上传并更新
    const onChooseAvatar = async (e: any) => {
        const tempPath = e.detail.avatarUrl;
        if (!tempPath) return;
        // 先显示选中
        setAvatar(tempPath);
        try {
            const uploaded = await uploadSingleFile(tempPath);
            const url = uploaded?.url || uploaded;
            setAvatar(url);
        } catch {
            Taro.showToast({ title: '头像上传失败', icon: 'none' });
        }
    };

    // 2. 绑定手机号
    const onGetPhoneNumber = (e: any) => {
        const { code, errMsg } = e.detail;
        if (errMsg === 'getPhoneNumber:ok' && code) {
            Taro.showLoading({ title: '绑定中...' });
            setTimeout(() => {
                Taro.hideLoading();
                setPhoneNumber('138****8888');
                Taro.showToast({ title: '绑定成功', icon: 'success' });
            }, 1000);
        } else {
            Taro.showToast({ title: '授权失败', icon: 'none' });
        }
    };

    // 3. 保存资料
    const handleSave = async () => {
        if (!nickname.trim()) {
            Taro.showToast({ title: '昵称不能为空', icon: 'none' });
            return;
        }
        setSaving(true);
        Taro.showLoading({ title: '保存中...' });
        try {
            await updateProfile({ nickname: nickname.trim(), avatarUrl: avatar });
            // 同步更新 store
            setUserInfo({ nickname: nickname.trim(), avatarUrl: avatar } as any);
            Taro.hideLoading();
            Taro.showToast({ title: '保存成功', icon: 'success' });
        } catch {
            Taro.hideLoading();
            Taro.showToast({ title: '保存失败', icon: 'none' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className='w-full h-screen flex items-center justify-center bg-[#FAFAF9]'>
                <Text className='text-[28px] text-stone-400'>加载中...</Text>
            </View>
        );
    }

    return (
        <View className='min-h-screen bg-[#FAFAF9] pb-12 font-sans'>
            {/* 头像编辑区 */}
            <View className='flex flex-col items-center justify-center bg-white py-10 mb-3'>
                <Button
                    openType='chooseAvatar'
                    onChooseAvatar={onChooseAvatar}
                    className='p-0 bg-transparent after:border-none w-[96px] h-[96px] rounded-full overflow-hidden mb-3 shadow-sm'
                >
                    <Image
                        className='w-full h-full'
                        isAvatar
                        src={avatar}
                        mode='aspectFill'
                    />
                </Button>
                <Text className='text-[22px] text-stone-400 font-medium'>点击更换头像</Text>
            </View>

            {/* 表单区域 */}
            <View className='bg-white px-5 mx-4 rounded-3xl shadow-sm border border-stone-100'>
                {/* 昵称 */}
                <View className='flex items-center py-4 border-b border-stone-100'>
                    <Text className='w-[100px] text-[26px] text-stone-700 font-bold'>昵称</Text>
                    <Input
                        type='nickname'
                        className='flex-1 text-[26px] text-stone-800 h-9'
                        placeholder='请输入昵称'
                        value={nickname}
                        onInput={(e) => setNickname(e.detail.value)}
                        onBlur={(e) => setNickname(e.detail.value)}
                    />
                </View>

                {/* 手机号 */}
                <View className='flex items-center justify-between py-4'>
                    <Text className='w-[100px] text-[26px] text-stone-700 font-bold'>手机号</Text>
                    <View className='flex-1 flex items-center justify-between'>
                        {phoneNumber ? (
                            <Text className='text-[26px] text-stone-800 font-medium'>{phoneNumber}</Text>
                        ) : (
                            <Text className='text-[26px] text-stone-300'>未绑定手机号</Text>
                        )}
                        <Button
                            openType='getPhoneNumber'
                            onGetPhoneNumber={onGetPhoneNumber}
                            className='m-0 px-3 py-1 text-[22px] text-[#F97316] bg-orange-50 border border-orange-200 rounded-full active:opacity-80 after:border-none font-semibold'
                        >
                            {phoneNumber ? '重新绑定' : '立即绑定'}
                        </Button>
                    </View>
                </View>
            </View>

            {/* 底部保存按钮 */}
            <View className='px-4 mt-8'>
                <View
                    onClick={handleSave}
                    className={`w-full h-88px rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] ${saving ? 'bg-stone-300' : 'bg-[#F97316] shadow-[0_6px_20px_rgba(249,115,22,0.25)]'}`}
                >
                    <Text className='text-[28px] text-white font-bold tracking-wider'>
                        {saving ? '保存中...' : '保存修改'}
                    </Text>
                </View>
            </View>
        </View>
    );
}
