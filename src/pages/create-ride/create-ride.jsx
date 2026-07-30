import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, Input, Picker, ScrollView, Text, View } from '@tarojs/components'
import { ALBUMS, MEMBER_ICONS } from '../../data/mock'
import { addRide, getSelectedGroup } from '../../store/session'
import './create-ride.scss'

export default function CreateRide() {
  const group = getSelectedGroup()
  const albums = group.albums?.length ? group.albums : (ALBUMS[group.id] || [{ id: 'latest', name: 'LATEST RELEASE', era: 'Current era', colors: group.colors }])
  const [albumQuery, setAlbumQuery] = useState(albums[0].name)
  const [selectedAlbum, setSelectedAlbum] = useState(albums[0])
  const [albumResults, setAlbumResults] = useState([])
  const [searchingAlbum, setSearchingAlbum] = useState(false)
  const [typeIndex, setTypeIndex] = useState(0)
  const [total, setTotal] = useState('1300')
  const [location, setLocation] = useState('上海')
  const [proof, setProof] = useState('')
  const [weights, setWeights] = useState(group.members.map(() => 1))
  const types = ['专辑＋成员特典', '仅成员特典']

  useEffect(() => {
    const query = albumQuery.trim()
    if (query.length < 2 || query === selectedAlbum?.name) {
      setAlbumResults([])
      return undefined
    }

    const timer = setTimeout(async () => {
      setSearchingAlbum(true)
      try {
        const response = await Taro.request({
          url: 'https://itunes.apple.com/search',
          data: {
            term: `${group.searchName || group.name} ${query}`,
            entity: 'album',
            limit: 8,
            country: 'US',
          },
        })
        const results = (response.data?.results || []).map((item) => ({
          id: String(item.collectionId),
          name: item.collectionName,
          artist: item.artistName,
          year: item.releaseDate ? item.releaseDate.slice(0, 4) : '',
          cover: item.artworkUrl100?.replace('100x100bb', '600x600bb'),
          source: 'Apple Music',
        }))
        setAlbumResults(results)
      } catch (error) {
        const fallback = albums
          .filter((album) => album.name.toLowerCase().includes(query.toLowerCase()))
          .map((album) => ({ ...album, artist: group.name, source: '本地专辑库' }))
        setAlbumResults(fallback)
      } finally {
        setSearchingAlbum(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [albumQuery, group.id])

  const prices = useMemo(() => {
    const sum = weights.reduce((value, weight) => value + Number(weight || 0), 0)
    if (!sum || !Number(total)) return weights.map(() => 0)
    const result = weights.map((weight) => Math.round(Number(total) * Number(weight || 0) / sum * 100) / 100)
    const difference = Math.round((Number(total) - result.reduce((value, price) => value + price, 0)) * 100) / 100
    result[result.length - 1] += difference
    return result
  }, [total, weights])

  const updateWeight = (index, value) => {
    const next = [...weights]
    next[index] = value
    setWeights(next)
  }

  const uploadProof = async () => {
    try {
      const result = await Taro.chooseImage({ count: 1 })
      setProof(result.tempFilePaths[0])
    } catch (error) {
      // User cancelled.
    }
  }

  const chooseAlbum = (album) => {
    setSelectedAlbum(album)
    setAlbumQuery(album.name)
    setAlbumResults([])
    Taro.showToast({ title: '已匹配专辑封面', icon: 'none' })
  }

  const submit = () => {
    if (!Number(total) || !location || weights.some((weight) => Number(weight) <= 0)) {
      Taro.showToast({ title: '请完成必填信息', icon: 'none' })
      return
    }
    if (!selectedAlbum?.cover) {
      Taro.showToast({ title: '请先选择匹配的专辑', icon: 'none' })
      return
    }
    const album = selectedAlbum
    addRide({
      id: `ride-${Date.now()}`,
      groupId: group.id,
      albumId: album.id,
      album: album.name,
      cover: album.cover,
      type: types[typeIndex],
      owner: '我的 KPOOL',
      location,
      total: Number(total),
      proof,
      status: 'open',
      occupied: [],
      prices,
      createdAt: Date.now(),
    })
    Taro.showToast({ title: '火车已进站', icon: 'success' })
    setTimeout(() => Taro.switchTab({ url: '/pages/lobby/lobby' }), 800)
  }

  return (
    <View className='page create-page'>
      <View className='status-space' />
      <View className='topbar'>
        <Button className='icon-button pressable' onClick={() => Taro.navigateBack()}>‹</Button>
        <Text className='top-title'>创建拼车</Text>
        <View className='icon-placeholder' />
      </View>
      <View className='create-intro'>
        <Text className='eyebrow'>{group.name} · NEW TRAIN</Text>
        <View className='title'>把这趟车，开得清清楚楚。</View>
        <Text className='muted'>价格会根据成员权重自动计算，创建后将锁定。</Text>
      </View>

      <View className='form-section card'>
        <Text className='form-section-title'>01 · 基本信息</Text>
        <View className='field'>
          <Text className='field-label'>专辑名称</Text>
          <View className='album-search-box'>
            {selectedAlbum?.cover && albumQuery === selectedAlbum.name && (
              <Image className='matched-cover' src={selectedAlbum.cover} mode='aspectFill' />
            )}
            <Input
              value={albumQuery}
              onInput={(event) => {
                setAlbumQuery(event.detail.value)
                if (event.detail.value !== selectedAlbum?.name) setSelectedAlbum(null)
              }}
              placeholder='输入专辑名称，自动匹配封面'
            />
            <Text className={`match-state ${selectedAlbum ? 'matched' : ''}`}>
              {searchingAlbum ? '搜索中' : selectedAlbum ? '已匹配 ✓' : '自动匹配'}
            </Text>
          </View>
          {albumResults.length > 0 && (
            <ScrollView scrollY className='album-result-list'>
              {albumResults.map((album) => (
                <Button key={album.id} className='album-result pressable' onClick={() => chooseAlbum(album)}>
                  <Image src={album.cover} mode='aspectFill' lazyLoad />
                  <View>
                    <Text className='result-name'>{album.name}</Text>
                    <Text className='result-meta'>{album.artist}{album.year ? ` · ${album.year}` : ''}</Text>
                  </View>
                  <Text className='result-arrow'>›</Text>
                </Button>
              ))}
            </ScrollView>
          )}
          <Text className='field-help'>会结合当前团体“{group.name}”搜索，选择候选结果后带入正式封面。</Text>
        </View>
        <View className='field'>
          <Text className='field-label'>拼车类型</Text>
          <Picker range={types} value={typeIndex} onChange={(event) => setTypeIndex(Number(event.detail.value))}>
            <View className='select-value'>{types[typeIndex]}<Text>⌄</Text></View>
          </Picker>
        </View>
        <View className='field'>
          <Text className='field-label'>购买总额</Text>
          <View className='money-input'><Text>¥</Text><Input type='digit' value={total} onInput={(event) => setTotal(event.detail.value)} /></View>
        </View>
        <View className='field'>
          <Text className='field-label'>发货城市</Text>
          <Input className='text-input' value={location} onInput={(event) => setLocation(event.detail.value)} placeholder='仅公开省/市' />
        </View>
        <View className='field no-border'>
          <Text className='field-label'>购买截图</Text>
          <Button className={`proof-upload pressable ${proof ? 'has-proof' : ''}`} onClick={uploadProof}>
            <Text>{proof ? '✓' : '＋'}</Text>
            <View><Text className='proof-title'>{proof ? '已选择购买截图' : '上传购买截图'}</Text><Text className='proof-copy'>支持相册或拍照，车队详情可查看</Text></View>
          </Button>
        </View>
      </View>

      <View className='form-section card'>
        <View className='price-head'>
          <View><Text className='form-section-title'>02 · 成员调价</Text><Text className='price-helper'>默认权重 1.00</Text></View>
          <View className='price-total'><Text>价格合计</Text><Text>¥{prices.reduce((sum, value) => sum + value, 0).toFixed(2)}</Text></View>
        </View>
        <View className='weight-list'>
          {group.members.map((member, index) => (
            <View className='weight-row' key={member}>
              <View className='weight-person'>
                <View className='small-glyph'>{MEMBER_ICONS[index % MEMBER_ICONS.length]}</View>
                <Text>{member}</Text>
              </View>
              <View className='weight-input'><Text>×</Text><Input type='digit' value={String(weights[index])} onInput={(event) => updateWeight(index, event.detail.value)} /></View>
              <Text className='member-price'>¥{prices[index].toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='submit-wrap'>
        <Button className='primary-button pressable' onClick={submit}>确认创建火车　↗</Button>
        <Text className='submit-note'>创建即表示你确认以上购买与价格信息真实有效</Text>
      </View>
    </View>
  )
}
