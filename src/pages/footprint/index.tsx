import { View, Map } from '@tarojs/components';
import { useRequest } from 'ahooks';
import { getFootprints } from '@/api/footprint';
import { useMemo } from 'react';

export default function FootprintMap() {
  const { data } = useRequest(getFootprints);
  const markers = useMemo(() => {
    if (!data) return [];
    return data.map(city => ({
      id: city.id,
      latitude: city.lat,
      longitude: city.lng,
      title: city.city,
    }));
  }, [data]);

  return (
    <View className="h-full">
      <Map
        style={{ width: '100%', height: '100%' }}
        markers={markers}
        longitude={116.4}
        latitude={39.9}
        scale={5}
      />
    </View>
  );
}