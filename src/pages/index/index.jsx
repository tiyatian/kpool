import { useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import GroupPicker from '../../components/GroupPicker'
import { GROUPS } from '../../data/mock'
import { finishOnboarding, getSelectedGroup, isOnboarded, selectGroup } from '../../store/session'
import './index.scss'

export default function Index() {
  const [group, setGroup] = useState(getSelectedGroup())
  const [picker, setPicker] = useState(false)
  const [onboarded, setOnboarded] = useState(isOnboarded())
  const [loginStep, setLoginStep] = useState(0)

  useDidShow(() => setGroup(getSelectedGroup()))
  useEffect(() => {
    if (!onboarded) setLoginStep(0)
  }, [onboarded])

  const chooseGroup = (nextGroup) => {
    selectGroup(nextGroup.id)
    setGroup(nextGroup)
    setPicker(false)
    if (!onboarded) {
      finishOnboarding()
      setOnboarded(true)
      Taro.showToast({ title: `欢迎来到 ${nextGroup.name}`, icon: 'none' })
    }
  }

  if (!onboarded && loginStep < 2) {
    return (
      <View className='welcome'>
        <View className='status-space' />
        <View className='welcome-art'>
          <View className='orbit orbit-one' />
          <View className='orbit orbit-two' />
          <View className='logo-seal'><Text>K</Text><View className='seal-star'>✦</View></View>
          <Text className='welcome-wordmark'>KPOOL</Text>
          <Text className='welcome-tagline'>Pick your bias. Catch your train.</Text>
        </View>
        <View className='welcome-bottom'>
          <Text className='eyebrow'>THE ALBUM POOLING CLUB</Text>
          <View className='welcome-title'>{loginStep === 0 ? '一起拼车，\n漂亮到站。' : '绑定手机号，\n不错过发车。'}</View>
          <Text className='welcome-copy'>
            {loginStep === 0 ? '按团体、专辑和成员找到真正适合你的拼车。' : '手机号仅用于账号安全与重要进度通知，不会公开展示。'}
          </Text>
          <Button className='wechat-button pressable' onClick={() => setLoginStep(loginStep + 1)}>
            <Text className='wechat-mark'>{loginStep === 0 ? 'W' : '+86'}</Text>
            {loginStep === 0 ? '微信一键登录' : '微信手机号快捷绑定'}
          </Button>
          <Text className='agreement'>继续即表示同意《用户协议》和《隐私政策》</Text>
        </View>
      </View>
    )
  }

  if (!onboarded && loginStep === 2 && !picker) setTimeout(() => setPicker(true), 0)

  return (
    <View className='page home'>
      <View className='home-hero' style={{ background: `linear-gradient(145deg, ${group.colors[0]}, ${group.colors[1]})` }}>
        <Image className='home-cover-image' src={group.photo} mode='aspectFill' />
        <View className='status-space' />
        <View className='topbar'>
          <Text className='brand'>KPOOL</Text>
          <Button className='icon-button pressable' onClick={() => Taro.switchTab({ url: '/pages/notifications/notifications' })}>◌</Button>
        </View>
        <View className='hero-noise' />
        <View className='hero-copy'>
          <Text className='eyebrow'>CURRENT WORLD</Text>
          <Text className='hero-group'>{group.name}</Text>
          <Text className='hero-tagline'>{group.label}</Text>
          <Button className='switch-group pressable' onClick={() => setPicker(true)}>切换团体　›</Button>
        </View>
        <View className='hero-monogram'>{group.name.slice(0, 1)}</View>
      </View>

      <View className='home-content'>
        <View className='quick-card card'>
          <View>
            <Text className='eyebrow'>NEXT DEPARTURE</Text>
            <View className='quick-title'>找到你的成员位置</View>
            <Text className='quick-copy'>当前有 12 辆车正在招募</Text>
          </View>
          <Button className='quick-arrow pressable' onClick={() => Taro.switchTab({ url: '/pages/lobby/lobby' })}>↗</Button>
        </View>

        <View className='section-head'>
          <Text className='section-title'>最近很热</Text>
          <Text className='muted'>本周</Text>
        </View>
        <View className='trend-grid'>
          {GROUPS.slice(0, 4).map((item, index) => (
            <Button key={item.id} className='trend-item pressable' onClick={() => chooseGroup(item)}>
              <View className='trend-art' style={{ background: `linear-gradient(145deg, ${item.colors[0]}, ${item.colors[1]})` }}>
                <Image className='trend-cover' src={item.photo} mode='aspectFill' lazyLoad />
                <Text>{item.name.slice(0, 2)}</Text>
                <View className='trend-ring' />
              </View>
              <Text className='trend-name'>{item.name}</Text>
              <Text className='trend-count'>{12 - index * 2} 辆车</Text>
            </Button>
          ))}
        </View>
      </View>

      <GroupPicker
        visible={picker}
        required={!onboarded}
        selectedId={group.id}
        onClose={() => setPicker(false)}
        onSelect={chooseGroup}
      />
    </View>
  )
}
