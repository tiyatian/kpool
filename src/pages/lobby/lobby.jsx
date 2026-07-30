import { useMemo, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Button, Image, ScrollView, Text, View } from '@tarojs/components'
import GroupPicker from '../../components/GroupPicker'
import RideCard from '../../components/RideCard'
import { ALBUMS, MEMBER_ICONS } from '../../data/mock'
import { getRides, getSelectedGroup, selectGroup } from '../../store/session'
import './lobby.scss'

export default function Lobby() {
  const [group, setGroup] = useState(getSelectedGroup())
  const [rides, setRides] = useState(getRides())
  const [albumId, setAlbumId] = useState((ALBUMS[group.id] || ALBUMS.seventeen)[0].id)
  const [memberIndex, setMemberIndex] = useState(null)
  const [picker, setPicker] = useState(false)
  const albums = group.albums?.length ? group.albums : (ALBUMS[group.id] || [{ id: 'latest', name: 'LATEST RELEASE', era: 'Current era', colors: group.colors }])

  useDidShow(() => {
    const nextGroup = getSelectedGroup()
    setGroup(nextGroup)
    setRides(getRides())
    setAlbumId((nextGroup.albums?.length ? nextGroup.albums : (ALBUMS[nextGroup.id] || [{ id: 'latest' }]))[0].id)
  })

  const selectedAlbum = albums.find((album) => album.id === albumId) || albums[0]
  const groupRides = rides.filter((ride) => ride.groupId === group.id)
  const filtered = useMemo(() => groupRides.filter((ride) => {
    const sameAlbum = ride.albumId === albumId || albums.length === 1
    const memberOpen = memberIndex === null || !ride.occupied.includes(memberIndex)
    return sameAlbum && memberOpen
  }), [rides, group.id, albumId, memberIndex])

  const handleGroup = (nextGroup) => {
    selectGroup(nextGroup.id)
    setGroup(nextGroup)
    setAlbumId((nextGroup.albums?.length ? nextGroup.albums : (ALBUMS[nextGroup.id] || [{ id: 'latest' }]))[0].id)
    setMemberIndex(null)
    setPicker(false)
  }

  return (
    <View className='page lobby'>
      <View className='lobby-hero' style={{ background: `linear-gradient(145deg, ${selectedAlbum.colors[0]}, ${selectedAlbum.colors[1]})` }}>
        {selectedAlbum.cover && <Image className='lobby-cover-image' src={selectedAlbum.cover} mode='aspectFill' />}
        <View className='status-space' />
        <View className='topbar'>
          <Button className='group-switch pressable' onClick={() => setPicker(true)}>{group.name}　⌄</Button>
          <Button className='icon-button pressable' onClick={() => Taro.navigateTo({ url: '/pages/create-ride/create-ride' })}>＋</Button>
        </View>
        <View className='album-vinyl' />
        <View className='album-copy'>
          <Text className='eyebrow'>{selectedAlbum.era}</Text>
          <Text className='album-title'>{selectedAlbum.name}</Text>
          <Text className='album-stat'>{filtered.length} 辆车正在等你</Text>
        </View>
      </View>

      <ScrollView scrollX className='album-tabs' enableFlex>
        <View className='album-tabs-inner'>
          {albums.map((album) => (
            <Button key={album.id} className={`album-tab ${albumId === album.id ? 'active' : ''}`} onClick={() => { setAlbumId(album.id); setMemberIndex(null) }}>
              {album.name}
            </Button>
          ))}
        </View>
      </ScrollView>

      <View className='member-section'>
        <View className='member-head'>
          <Text className='section-title'>按成员找空位</Text>
          {memberIndex !== null && <Button className='clear-filter' onClick={() => setMemberIndex(null)}>清除</Button>}
        </View>
        <ScrollView scrollX className='member-scroll'>
          <View className='member-row'>
            {group.members.map((member, index) => {
              const count = groupRides.filter((ride) => (ride.albumId === albumId || albums.length === 1) && !ride.occupied.includes(index)).length
              return (
                <Button key={member} className={`member-filter pressable ${memberIndex === index ? 'active' : ''}`} onClick={() => setMemberIndex(index)}>
                  <View className='member-glyph'>{MEMBER_ICONS[index % MEMBER_ICONS.length]}</View>
                  <Text className='member-name'>{member}</Text>
                  <Text className='member-free'>{count} 辆</Text>
                </Button>
              )
            })}
          </View>
        </ScrollView>
      </View>

      <View className='ride-list'>
        <View className='list-head'>
          <Text className='section-title'>{memberIndex === null ? '全部车队' : `${group.members[memberIndex]} 的空位`}</Text>
          <Text className='muted'>{filtered.length} results</Text>
        </View>
        {filtered.length ? filtered.map((ride) => <RideCard key={ride.id} ride={ride} group={group} />) : (
          <View className='empty card'>
            <Text className='empty-mark'>◇</Text>
            <Text className='empty-title'>这一站暂时没有车</Text>
            <Text className='muted'>换个成员看看，或者成为第一个车主。</Text>
            <Button className='primary-button' onClick={() => Taro.navigateTo({ url: '/pages/create-ride/create-ride' })}>创建拼车</Button>
          </View>
        )}
      </View>

      <GroupPicker visible={picker} selectedId={group.id} onClose={() => setPicker(false)} onSelect={handleGroup} />
    </View>
  )
}
