import { useEffect, useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Image, Text, View } from '@tarojs/components'
import { MEMBER_ICONS } from '../../data/mock'
import { departRide, getGroupById, getMyClaim, getRide, leaveOrRequestExit, occupySeat } from '../../store/session'
import './train-detail.scss'

export default function TrainDetail() {
  const [ride, setRide] = useState(null)
  const [selected, setSelected] = useState(null)
  const [now, setNow] = useState(Date.now())
  useLoad((params) => setRide(getRide(params.id)))
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!ride) return <View className='page' />
  const group = getGroupById(ride.groupId) || getGroupById('seventeen')
  const free = group.members.length - ride.occupied.length
  const myClaim = getMyClaim(ride)
  const isOwner = ride.owner === '我的 KPOOL'
  const remainingSeconds = myClaim ? Math.max(0, Math.ceil((10 * 60 * 1000 - (now - myClaim.occupiedAt)) / 1000)) : 0
  const remainingText = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`

  const confirmSeat = () => {
    if (selected === null) return
    const success = occupySeat(ride.id, selected)
    if (!success) {
      Taro.showToast({ title: '这个位置刚刚被占了', icon: 'none' })
      setRide(getRide(ride.id))
      return
    }
    Taro.showToast({ title: '占位成功', icon: 'success' })
    setRide(getRide(ride.id))
    setSelected(null)
  }

  const handleExit = async () => {
    if (myClaim?.exitStatus === 'pending') return
    const direct = remainingSeconds > 0
    const modal = await Taro.showModal({
      title: direct ? '确认离开这个位置？' : '向车主申请退出？',
      content: direct
        ? `你仍在 10 分钟自由退出期内，退出后 ${group.members[myClaim.memberIndex]} 将立即恢复为空位。`
        : '自由退出期已结束，车主同意后位置才会释放。',
      confirmText: direct ? '直接退出' : '发送申请',
      confirmColor: '#171513',
    })
    if (!modal.confirm) return
    const result = leaveOrRequestExit(ride.id)
    setRide(getRide(ride.id))
    Taro.showToast({
      title: result.status === 'left' ? '已退出并释放空位' : '退出申请已发送',
      icon: 'none',
    })
  }

  const handleDepart = async () => {
    try {
      const result = await Taro.chooseImage({ count: 1 })
      if (!departRide(ride.id, result.tempFilePaths[0])) return
      setRide(getRide(ride.id))
      Taro.showToast({ title: '火车已发车', icon: 'success' })
    } catch (error) {
      // User cancelled image selection.
    }
  }

  return (
    <View className='page detail-page'>
      <View className='detail-hero' style={{ background: `linear-gradient(145deg, ${group.colors[0]}, ${group.colors[1]})` }}>
        {ride.cover && <Image className='detail-cover-image' src={ride.cover} mode='aspectFill' />}
        <View className='status-space' />
        <View className='topbar'>
          <Button className='icon-button pressable' onClick={() => Taro.navigateBack()}>‹</Button>
          <Button className='icon-button pressable'>···</Button>
        </View>
        <View className='detail-disc' />
        <View className='detail-album'>
          <Text className='eyebrow'>{group.name} · KPOOL TRAIN</Text>
          <Text className='detail-album-name'>{ride.album}</Text>
          <Text className='detail-type'>{ride.type}</Text>
        </View>
      </View>

      <View className='detail-content'>
        <View className='summary-card card'>
          <View><Text className='summary-value'>{free}</Text><Text className='summary-label'>剩余空位</Text></View>
          <View><Text className='summary-value'>¥{ride.total}</Text><Text className='summary-label'>购买总额</Text></View>
          <View><Text className='summary-value'>{ride.location}</Text><Text className='summary-label'>发货城市</Text></View>
        </View>

        {myClaim && (
          <View className='my-seat-card card'>
            <View className='my-seat-mark'>✓</View>
            <View className='my-seat-copy'>
              <Text className='eyebrow'>MY SEAT</Text>
              <Text className='my-seat-title'>{group.members[myClaim.memberIndex]} · ¥{ride.prices[myClaim.memberIndex].toFixed(2)}</Text>
              <Text className='my-seat-status'>
                {ride.status === 'departed'
                  ? '车队已发车'
                  : myClaim.exitStatus === 'pending'
                    ? '退出申请等待车主处理'
                    : remainingSeconds > 0
                      ? `自由退出还剩 ${remainingText}`
                      : '退出需要车主同意'}
              </Text>
            </View>
            {ride.status !== 'departed' && (
              <Button className='exit-button pressable' disabled={myClaim.exitStatus === 'pending'} onClick={handleExit}>
                {myClaim.exitStatus === 'pending' ? '已申请' : '退出'}
              </Button>
            )}
          </View>
        )}

        {isOwner && ride.status === 'full' && (
          <View className='depart-card card'>
            <View><Text className='eyebrow'>READY TO GO</Text><Text className='depart-title'>全员到齐，可以发车</Text><Text className='muted'>上传群聊二维码后，所有车员会收到通知。</Text></View>
            <Button className='primary-button pressable' onClick={handleDepart}>上传二维码并发车</Button>
          </View>
        )}

        <View className='owner-card card'>
          <View className='owner-avatar'>P</View>
          <View className='owner-copy'><Text className='owner-name'>{ride.owner}</Text><Text className='muted'>已发车 18 次 · 96% 好评</Text></View>
          <Text className='owner-arrow'>›</Text>
        </View>

        <View className='detail-section-head'>
          <View><Text className='eyebrow'>SELECT YOUR SEAT</Text><View className='section-title'>选择成员位置</View></View>
          <View className='legend'><Text className='legend-free'>可选</Text><Text className='legend-taken'>已占</Text></View>
        </View>

        <View className='train-track'>
          <View className='train-line' />
          <View className='train-grid'>
            {group.members.map((member, index) => {
              const occupied = ride.occupied.includes(index)
              return (
                <Button
                  key={member}
                  disabled={occupied || ride.status === 'full'}
                  className={`train-seat pressable ${occupied ? 'occupied' : ''} ${selected === index ? 'selected' : ''}`}
                  onClick={() => setSelected(index)}
                >
                  <View className='seat-top'><Text>{MEMBER_ICONS[index % MEMBER_ICONS.length]}</Text><Text>0{index + 1}</Text></View>
                  <Text className='train-member'>{member}</Text>
                  <Text className='train-price'>¥{ride.prices[index]?.toFixed(2)}</Text>
                  <Text className='seat-state'>
                    {myClaim?.memberIndex === index ? '我的位置' : occupied ? '已占位' : selected === index ? '已选择' : '可上车'}
                  </Text>
                </Button>
              )
            })}
          </View>
        </View>

        <View className='proof-card card'>
          <View className='proof-head'><Text className='section-title'>购买凭证</Text><Text className='muted'>车主上传</Text></View>
          {ride.proof ? <Image className='proof-image' src={ride.proof} mode='aspectFill' /> : (
            <View className='proof-placeholder'><Text>RECEIPT</Text><Text>模拟数据暂未上传凭证</Text></View>
          )}
        </View>
      </View>

      {!myClaim && ride.status === 'open' && (
        <View className='seat-action'>
          <View><Text className='action-label'>{selected === null ? '请选择一个空位' : group.members[selected]}</Text><Text className='action-price'>{selected === null ? '—' : `¥${ride.prices[selected].toFixed(2)}`}</Text></View>
          <Button className='primary-button pressable' disabled={selected === null} onClick={confirmSeat}>确认占位</Button>
        </View>
      )}
    </View>
  )
}
