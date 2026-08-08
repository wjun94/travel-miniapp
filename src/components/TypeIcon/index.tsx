import { Text } from '@tarojs/components';
import Image from '../Image';
import LocationsSvg from '@/assets/itinerary/locations.svg';
import FoodSvg from '@/assets/itinerary/food.svg';
import HotelsSvg from '@/assets/itinerary/hotels.svg';
import ShoppingSvg from '@/assets/itinerary/shopping.svg';
import WarningsSvg from '@/assets/itinerary/warnings.svg';
import TransportationSvg from '@/assets/itinerary/transportation.svg';

const typeEmojiMap: Record<string, string> = {
  '📍': LocationsSvg,
  '🚄': TransportationSvg,
  '🏨': HotelsSvg,
  '🍜': FoodSvg,
  '🛍️': ShoppingSvg,
  '⚠️': WarningsSvg,
};

interface TypeIconProps {
  emoji: string;
  className?: string;
  fallbackClassName?: string;
}

export default function TypeIcon({ emoji, className = 'h-3.5 w-3.5 mr-6px', fallbackClassName = 'text-[24px]' }: TypeIconProps) {
  const src = typeEmojiMap[emoji];
  if (!src) {
    return <Text className={fallbackClassName}>{emoji}</Text>;
  }
  return <Image src={src} className={className} />;
}
