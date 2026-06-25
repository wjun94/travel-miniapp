import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useRequest } from 'ahooks';
import { getTripDetail, Trip, DailyPlan } from '@/api/trip';
import { useState } from 'react';
import ScrollLoadList from '@/components/ScrollLoadList';

export default function TripDetail() {
  const { id } = useRouter().params;
  const { data: trip, run } = useRequest(() => getTripDetail(Number(id)));

  if (!trip) return <View className="p-4">加载中...</View>;

  return (
    <View className="p-4">
      <View className="text-xl font-bold">{trip.destination}</View>
      <View className="text-sm text-gray-500">{trip.days}天</View>

      {trip.weatherData && (
        <View className="my-2 p-2 bg-blue-50 rounded">
          <Text>{JSON.stringify(trip.weatherData)}</Text>
        </View>
      )}

      {/* 每日计划展示 */}
      {trip.dailyPlans?.map(day => (
        <View key={day.day} className="mt-4">
          <View className="font-bold">第{day.day}天</View>
          {day.items.map((item, idx) => (
            <View key={idx} className="flex justify-between py-1 border-b">
              <Text>{item.time} {item.name}</Text>
              <Text>{item.duration}</Text>
            </View>
          ))}
        </View>
      ))}

      <View className="mt-6">
        <Button
          onClick={() => Taro.showShareMenu({ withShareTicket: true })}
        >
          邀请好友协同编辑
        </Button>
      </View>
    </View>
  );
}