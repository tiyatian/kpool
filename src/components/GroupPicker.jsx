import { useEffect, useMemo, useState } from 'react'
import { Button, Image, Input, ScrollView, Text, View } from '@tarojs/components'
import { getAllGroups, saveDiscoveredGroup } from '../store/session'
import { searchKpopGroup } from '../services/groupSearch'
import './GroupPicker.scss'

export default function GroupPicker({ visible, selectedId, required = false, onSelect, onClose }) {
  const [keyword, setKeyword] = useState('')
  const [remoteGroup, setRemoteGroup] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const allGroups = getAllGroups()
  const groups = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    const local = query ? allGroups.filter((group) => group.name.toLowerCase().includes(query)) : allGroups
    return remoteGroup && !local.some((group) => group.id === remoteGroup.id) ? [remoteGroup, ...local] : local
  }, [keyword, remoteGroup])

  useEffect(() => {
    const query = keyword.trim()
    setRemoteGroup(null)
    setSearchError(false)
    if (query.length < 2) {
      setSearching(false)
      return undefined
    }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const result = await searchKpopGroup(query)
        setRemoteGroup(result)
        setSearchError(!result)
      } catch (error) {
        setSearchError(true)
      } finally {
        setSearching(false)
      }
    }, 550)
    return () => clearTimeout(timer)
  }, [keyword])

  const choose = (group) => {
    if (group.discoveredAt) saveDiscoveredGroup(group)
    onSelect(group)
  }

  if (!visible) return null

  return (
    <View className='picker-layer'>
      <View className='picker-backdrop' onClick={required ? undefined : onClose} />
      <View className='picker-sheet'>
        <View className='picker-handle' />
        <View className='picker-head'>
          <View>
            <Text className='eyebrow'>CHOOSE YOUR WORLD</Text>
            <View className='picker-title'>你想先去哪个团？</View>
          </View>
          {!required && <Button className='picker-close' onClick={onClose}>×</Button>}
        </View>
        <View className='picker-search'>
          <Text>⌕</Text>
          <Input value={keyword} onInput={(event) => setKeyword(event.detail.value)} placeholder='搜索 KPOP 团体' />
        </View>
        <ScrollView scrollY className='picker-list'>
          {searching && <View className='picker-feedback'>正在识别团体并匹配图片与专辑…</View>}
          {!searching && searchError && groups.length === 0 && (
            <View className='picker-feedback'>暂时没有匹配到，换个英文团名试试</View>
          )}
          {groups.map((group) => (
            <Button
              key={group.id}
              className={`group-row pressable ${selectedId === group.id ? 'is-selected' : ''}`}
              onClick={() => choose(group)}
            >
              <View className='group-orb' style={{ background: `linear-gradient(135deg, ${group.colors[0]}, ${group.colors[1]})` }}>
                <Image src={group.photo} mode='aspectFill' lazyLoad />
              </View>
              <View className='group-copy'>
                <Text className='group-name'>{group.name}</Text>
                <Text className='group-label'>{group.discoveredAt ? `自动匹配 · ${group.label}` : group.label}</Text>
              </View>
              <Text className='group-arrow'>{selectedId === group.id ? '✓' : '›'}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}
