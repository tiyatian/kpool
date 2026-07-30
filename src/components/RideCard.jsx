import Taro from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { ALBUMS, MEMBER_ICONS } from '../data/mock'
import './RideCard.scss'

export default function RideCard({ ride, group }) {
  const free = group.members.length - ride.occupied.length
  const album = (ALBUMS[group.id] || []).find((item) => item.id === ride.albumId)
  const openDetail = () => Taro.navigateTo({ url: `/pages/train-detail/train-detail?id=${ride.id}` })

  return (
    <Button className='ride-card card pressable' onClick={openDetail}>
      <View className='ride-cover' style={{ background: `linear-gradient(145deg, ${group.colors[0]}, ${group.colors[1]})` }}>
        {(ride.cover || album?.cover) && <Image className='ride-cover-image' src={ride.cover || album.cover} mode='aspectFill' lazyLoad />}
        <Text className='cover-kicker'>KPOOL EDITION</Text>
        <Text className='cover-title'>{ride.album}</Text>
        <View className='cover-disc' />
      </View>
      <View className='ride-body'>
        <View className='ride-meta'>
          <Text className='ride-type'>{ride.type}</Text>
          <Text className={`status-tag ${ride.status}`}>
            {ride.status === 'open' ? `${free} 个空位` : ride.status === 'departed' ? '已发车' : '已满员'}
          </Text>
        </View>
        <View className='ride-owner'>
          <Text>by {ride.owner}</Text>
          <Text>{ride.location} 发货</Text>
        </View>
        <View className='seat-preview'>
          {group.members.map((member, index) => (
            <View key={member} className={`seat-dot ${ride.occupied.includes(index) ? 'occupied' : ''}`}>
              <Text>{MEMBER_ICONS[index % MEMBER_ICONS.length]}</Text>
            </View>
          ))}
        </View>
        <View className='ride-footer'>
          <Text>成员价 ¥{Math.min(...ride.prices)} 起</Text>
          <Text className='detail-link'>查看火车 ›</Text>
        </View>
      </View>
    </Button>
  )
}
