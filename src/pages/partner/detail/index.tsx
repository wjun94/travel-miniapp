import { View, Button, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState } from 'react';
import { useRequest } from 'ahooks';
import { getPartnerList, applyPartner } from '@/api/partner'; // 需要单独获取详情接口，若没有则模拟
import Modal from '@/components/Modal';

export default function PartnerDetail() {
  const { id } = useRouter().params;
  const [showApply, setShowApply] = useState(false);
  const [message, setMessage] = useState('');

  // 假设有一个 getPartnerDetail 接口，这里简化从列表获取
  const { data: partner } = useRequest(() => getPartnerList(1).then(res => res.list[0])); // 占位

  const handleApply = async () => {
    await applyPartner(Number(id), message);
    setShowApply(false);
    Taro.showToast({ title: '申请已发送' });
  };

  if (!partner) return null;

  return (
    <View className="p-4">
      <View className="text-xl font-bold">{partner.destination}</View>
      <View className="text-sm text-gray-600">{partner.startDate} 出发，{partner.days}天</View>
      <View className="mt-4">{partner.requirement}</View>
      <View className="mt-4">
        <Button onClick={() => setShowApply(true)}>申请加入</Button>
      </View>

      <Modal
        visible={showApply}
        title="申请加入"
        onCancel={() => setShowApply(false)}
        onConfirm={handleApply}
        confirmText="发送"
      >
        <Textarea
          placeholder="留言给队长"
          value={message}
          onInput={e => setMessage(e.detail.value)}
        />
      </Modal>
    </View>
  );
}