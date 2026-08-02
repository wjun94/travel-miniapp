import { useState, useRef } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import { Avatar } from '@/components'
import Modal from '@/components/Modal';
import Taro from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { getUserInfo, updateProfile, bindWxPhone } from '@/api/auth';
import { uploadSingleFile } from '@/utils/upload';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
    const setUserInfo = useAuthStore(s => s.setUserInfo);

    const [avatar, setAvatar] = useState('');
    const [nickname, setNickname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    // 记录初始昵称，弹窗确定时仅在改动后才提交
    const initialNicknameRef = useRef('');
    // 昵称编辑弹窗
    const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
    const [nicknameInput, setNicknameInput] = useState('');

    // 加载当前用户信息
    const { loading } = useRequest(getUserInfo, {
        onSuccess: (res: any) => {
            const info = res?.data || res;
            if (info) {
                setAvatar(info.avatarUrl || '');
                setNickname(info.nickname || '');
                initialNicknameRef.current = info.nickname || '';
                setPhoneNumber(info.phone || '');
            }
        },
        onError: () => {
            Taro.showToast({ title: '加载用户信息失败', icon: 'none' });
        },
    });

    // 1. 头像选择 — 上传后直接更新头像
    const onChooseAvatar = async (e: any) => {
        const tempPath = e.detail.avatarUrl;
        if (!tempPath) return;
        // 先显示选中
        setAvatar(tempPath);
        // 全屏 loading 锁住页面，避免重复操作
        Taro.showLoading({ title: '上传中...', mask: true });
        try {
            const uploaded = await uploadSingleFile(tempPath);
            const url = uploaded?.url || uploaded;
            setAvatar(url);
            // 上传成功直接更新头像
            await updateProfile({ avatarUrl: url });
            setUserInfo({ avatarUrl: url } as any);
            Taro.showToast({ title: '头像已更新', icon: 'success' });
        } catch {
            Taro.showToast({ title: '头像上传失败', icon: 'none' });
        } finally {
            Taro.hideLoading();
        }
    };

    // 2. 绑定手机号
    const onGetPhoneNumber = async (e: any) => {
        const { code, errMsg } = e.detail;
        if (errMsg !== 'getPhoneNumber:ok' || !code) {
            Taro.showToast({ title: '授权失败', icon: 'none' });
            return;
        }
        // 全屏 loading 锁住页面，避免重复操作
        Taro.showLoading({ title: '绑定中...', mask: true });
        try {
            const res = await bindWxPhone(code);
            setPhoneNumber(res?.phone || '已绑定');
            Taro.showToast({ title: '绑定成功', icon: 'success' });
        } catch (e: any) {
            Taro.showToast({ title: e?.message || '绑定失败，请重试', icon: 'none' });
        } finally {
            Taro.hideLoading();
        }
    };

    // 3. 打开昵称编辑弹窗
    const openNicknameModal = () => {
        setNicknameInput(nickname);
        setNicknameModalVisible(true);
    };

    // 4. 昵称弹窗确定：调用更新用户信息接口
    const handleNicknameConfirm = async () => {
        const value = nicknameInput.trim();
        if (!value) {
            Taro.showToast({ title: '昵称不能为空', icon: 'none' });
            return;
        }
        // 未改动则直接关闭
        if (value === initialNicknameRef.current) {
            setNicknameModalVisible(false);
            return;
        }
        // 全屏 loading 锁住页面，避免重复操作
        Taro.showLoading({ title: '更新中...', mask: true });
        try {
            await updateProfile({ nickname: value });
            setNickname(value);
            initialNicknameRef.current = value;
            // 同步更新 store
            setUserInfo({ nickname: value } as any);
            setNicknameModalVisible(false);
            Taro.showToast({ title: '昵称已更新', icon: 'success' });
        } catch {
            Taro.showToast({ title: '昵称更新失败', icon: 'none' });
        } finally {
            Taro.hideLoading();
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
                    <Avatar
                        name={nickname}
                        className='w-full h-full'
                        src={avatar}
                        mode='aspectFill'
                    />
                </Button>
                <Text className='text-[22px] text-stone-400 font-medium'>点击更换头像</Text>
            </View>

            {/* 表单区域 */}
            <View className='bg-white px-5 mx-4 rounded-3xl shadow-sm border border-stone-100'>
                {/* 昵称 */}
                <View
                    className='flex items-center py-4 border-b border-stone-100 active:bg-stone-50'
                    onClick={openNicknameModal}
                >
                    <Text className='w-[100px] text-[26px] text-stone-700 font-bold'>昵称</Text>
                    <View className='flex-1 flex items-center justify-between'>
                        <Text className='text-[26px] text-stone-800 font-medium'>{nickname || '未设置昵称'}</Text>
                        <Text className='iconfont icon-next text-[24px]' />
                    </View>
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

            {/* 昵称编辑弹窗 */}
            <Modal
                visible={nicknameModalVisible}
                title="修改昵称"
                confirmText="确定"
                onConfirm={handleNicknameConfirm}
                onCancel={() => setNicknameModalVisible(false)}
                onMaskClick={() => setNicknameModalVisible(false)}
            >
                <View className="py-2">
                    <Input
                        type='nickname'
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 box-border h-11"
                        placeholder="请输入昵称"
                        placeholderClass="text-gray-400"
                        value={nicknameInput}
                        onInput={(e) => setNicknameInput(e.detail.value)}
                        focus
                    />
                </View>
            </Modal>
        </View>
    );
}
