import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Text, View } from '@tarojs/components'
import { getRides, getSelectedGroup } from '../../store/session'
import './profile.scss'

export default function Profile() {
  const group = getSelectedGroup()
  const rides = getRides()
  const mine = rides.filter((ride) => ride.owner === '我的 KPOOL')

  return (
    <View className='page profile-page'>
      <View className='profile-hero' style={{ background: `linear-gradient(145deg, ${group.colors[0]}, ${group.colors[1]})` }}>
        <View className='status-space' />
        <View className='topbar'>
          <Text className='brand'>MY KPOOL</Text>
          <Button className='icon-button pressable'>···</Button>
        </View>
        <View className='profile-shape'>K</View>
        <View className='profile-identity'>
          <View className='profile-avatar'>K</View>
          <Text className='profile-name'>我的 KPOOL</Text>
          <Text className='profile-handle'>@kpool_member · {group.name}</Text>
        </View>
      </View>

      <View className='profile-content'>
        <View className='profile-stats card'>
          <View><Text className='stat-value'>{18 + mine.length}</Text><Text className='stat-label'>拼车次数</Text></View>
          <View><Text className='stat-value'>96%</Text><Text className='stat-label'>车主好评</Text></View>
          <View><Text className='stat-value'>24</Text><Text className='stat-label'>关注的人</Text></View>
        </View>

        <View className='world-card card'>
          <View>
            <Text className='eyebrow'>MY KPOP WORLDS</Text>
            <View className='world-title'>拼过的团体</View>
          </View>
          <View className='world-chips'>
            <Text style={{ background: `linear-gradient(135deg, ${group.colors[0]}, ${group.colors[1]})` }}>{group.name}</Text>
            <Text>aespa</Text>
            <Text>IVE</Text>
          </View>
        </View>

        <View className='profile-section'>
          <Text className='section-title'>我的拼车</Text>
          <View className='profile-menu card'>
            <Button className='menu-row pressable' onClick={() => Taro.switchTab({ url: '/pages/lobby/lobby' })}>
              <View className='menu-icon'>↗</View><View className='menu-copy'><Text>我创建的车队</Text><Text>{mine.length} 辆正在进行</Text></View><Text className='menu-arrow'>›</Text>
            </Button>
            <Button className='menu-row pressable'>
              <View className='menu-icon'>◇</View><View className='menu-copy'><Text>我加入的车队</Text><Text>3 个成员位置</Text></View><Text className='menu-arrow'>›</Text>
            </Button>
            <Button className='menu-row pressable'>
              <View className='menu-icon'>⌁</View><View className='menu-copy'><Text>退出申请</Text><Text>暂无待处理申请</Text></View><Text className='menu-arrow'>›</Text>
            </Button>
          </View>
        </View>

        <Button className='create-profile-button primary-button pressable' onClick={() => Taro.navigateTo({ url: '/pages/create-ride/create-ride' })}>
          创建一趟新火车　＋
        </Button>
      </View>
    </View>
  )
}
