import { Text, View } from '@tarojs/components'
import './notifications.scss'

const notices = [
  { mark: '✓', title: '占位成功', copy: '你已成功占位 SPILL THE FEELS · MINGYU', time: '刚刚', tone: 'green' },
  { mark: '✦', title: '车队已满员', copy: 'diamond line 的火车已经满员，等待车主上传群聊二维码。', time: '12 分钟前', tone: 'pink' },
  { mark: '↗', title: '群聊二维码已更新', copy: '请进入车队详情查看，并尽快加入拼车群。', time: '昨天', tone: 'blue' },
  { mark: '⌁', title: '退出申请待处理', copy: '一名车员申请退出你创建的车队。', time: '星期一', tone: 'sand' },
]

export default function Notifications() {
  return (
    <View className='page notice-page'>
      <View className='status-space' />
      <View className='notice-header'>
        <Text className='eyebrow'>KPOOL UPDATES</Text>
        <View className='title'>消息</View>
        <Text className='muted'>重要进度都会留在这里。</Text>
      </View>
      <View className='notice-list'>
        <View className='today-label'>今天</View>
        {notices.map((notice) => (
          <View className='notice-row card pressable' key={`${notice.title}-${notice.time}`}>
            <View className={`notice-mark ${notice.tone}`}>{notice.mark}</View>
            <View className='notice-copy'>
              <View className='notice-line'><Text className='notice-title'>{notice.title}</Text><Text className='notice-time'>{notice.time}</Text></View>
              <Text className='notice-body'>{notice.copy}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
