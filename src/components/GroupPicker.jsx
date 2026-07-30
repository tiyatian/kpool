import { useEffect, useMemo, useState } from 'react'
import { Button, Image, Input, ScrollView, Text, View } from '@tarojs/components'
import { getAllGroups, saveDiscoveredGroup } from '../store/session'
import { searchKpopGroup } from '../services/groupSearch'
import './GroupPicker.scss'

const POPULAR = ['ENHYPEN', 'LE SSERAFIM', 'NMIXX', 'BABYMONSTER']

export default function GroupPicker({ visible, selectedId, required = false, initialKeyword = '', onSelect, onClose }) {
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
    if (visible && initialKeyword) setKeyword(initialKeyword)
  }, [visible, initialKeyword])

  useEffect(() => {
    const query = keyword.trim()
    setRemoteGroup(null)
    setSearchError(false)
    if (query.length < 2 || allGroups.some((group) => group.name.toLowerCase() === query.toLowerCase())) {
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
            <Text className='eyebrow'>DISCOVER YOUR WORLD</Text>
            <View className='picker-title'>搜索你的 K-pop 团体</View>
          </View>
          {!required && <Button className='picker-close' onClick={onClose}>×</Button>}
        </View>
        <View className='picker-search'>
          <Text className='search-symbol'>⌕</Text>
          <Input value={keyword} onInput={(event) => setKeyword(event.detail.value)} placeholder='搜索 KPOP 团体' />
          {keyword && <Button className='clear-search' aria-label='清空搜索' onClick={() => setKeyword('')}>×</Button>}
        </View>
        {!keyword && (
          <View className='popular-searches'>
            <Text>热门搜索</Text>
            <View className='popular-chips'>
              {POPULAR.map((name) => <Button key={name} onClick={() => setKeyword(name)}>{name}</Button>)}
            </View>
          </View>
        )}
        <ScrollView scrollY className='picker-list'>
          {searching && (
            <View className='picker-feedback searching-state'>
              <View className='search-loader' />
              <Text>正在匹配团体照片、成员与官方专辑…</Text>
            </View>
          )}
          {!searching && searchError && groups.length === 0 && (
            <View className='picker-feedback'>没有找到结果。试试英文全名或常用简称。</View>
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
