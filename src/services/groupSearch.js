import Taro from '@tarojs/taro'

const DEEZER_API = 'https://api.deezer.com'
const ITUNES_API = 'https://itunes.apple.com'
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php'

const palettes = [
  ['#FF8DB8', '#7357E8'],
  ['#77D9E8', '#4968D8'],
  ['#FFAF77', '#E34E82'],
  ['#A7E9C3', '#557AE8'],
  ['#D3A8FF', '#FF8FB1'],
]

const slugify = (value) => `remote-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`

const request = async (url, data) => {
  const result = await Taro.request({ url, data, timeout: 8000 })
  if (result.statusCode < 200 || result.statusCode >= 300) throw new Error('remote request failed')
  return result.data
}

const findArtist = async (keyword) => {
  const payload = await request(`${DEEZER_API}/search/artist`, { q: keyword, limit: 5 })
  const exact = payload?.data?.find((item) => item.name.toLowerCase() === keyword.toLowerCase())
  return exact || payload?.data?.[0]
}

const findAlbums = async (artist, keyword) => {
  try {
    const payload = await request(`${DEEZER_API}/artist/${artist.id}/albums`, { limit: 20 })
    return (payload?.data || [])
      .sort((a, b) => String(b.release_date || '').localeCompare(String(a.release_date || '')))
      .slice(0, 8)
      .map((album) => ({
        id: String(album.id),
        name: album.title,
        era: album.release_date?.slice(0, 4) || 'Release',
        cover: album.cover_xl || album.cover_big || album.cover_medium,
        colors: palettes[album.id % palettes.length],
      }))
  } catch (error) {
    const payload = await request(`${ITUNES_API}/search`, {
      term: `${artist.name || keyword}`,
      entity: 'album',
      media: 'music',
      limit: 12,
      country: 'KR',
    })
    return (payload?.results || []).slice(0, 8).map((album, index) => ({
      id: String(album.collectionId || index),
      name: album.collectionName,
      era: String(album.releaseDate || '').slice(0, 4) || 'Release',
      cover: album.artworkUrl100?.replace('100x100bb', '600x600bb'),
      colors: palettes[index % palettes.length],
    }))
  }
}

const findMembers = async (keyword) => {
  try {
    const search = await request(WIKIDATA_API, {
      action: 'wbsearchentities',
      search: keyword,
      language: 'en',
      format: 'json',
      origin: '*',
      limit: 8,
    })
    const group = (search?.search || []).find((item) =>
      /group|band|k-pop|musical/i.test(`${item.description || ''}`),
    ) || search?.search?.[0]
    if (!group) return []

    const entityPayload = await request(WIKIDATA_API, {
      action: 'wbgetentities',
      ids: group.id,
      props: 'claims',
      format: 'json',
      origin: '*',
    })
    const memberIds = (entityPayload?.entities?.[group.id]?.claims?.P527 || [])
      .map((claim) => claim?.mainsnak?.datavalue?.value?.id)
      .filter(Boolean)
    if (!memberIds.length) return []

    const labelsPayload = await request(WIKIDATA_API, {
      action: 'wbgetentities',
      ids: memberIds.join('|'),
      props: 'labels',
      languages: 'en',
      format: 'json',
      origin: '*',
    })
    return memberIds
      .map((id) => labelsPayload?.entities?.[id]?.labels?.en?.value)
      .filter(Boolean)
      .map((name) => name.toUpperCase())
  } catch (error) {
    return []
  }
}

export async function searchKpopGroup(keyword) {
  const query = keyword.trim()
  if (query.length < 2) return null

  const artist = await findArtist(query)
  if (!artist) return null

  const [albums, members] = await Promise.all([findAlbums(artist, query), findMembers(artist.name)])
  const colors = palettes[artist.id % palettes.length]
  const photo = artist.picture_xl || artist.picture_big || artist.picture_medium || albums[0]?.cover

  return {
    id: slugify(artist.name),
    remoteId: artist.id,
    name: artist.name,
    searchName: artist.name,
    label: albums[0] ? `最新收录 · ${albums[0].name}` : 'KPOP ARTIST',
    colors,
    accent: colors[1],
    photo,
    cover: albums[0]?.cover || photo,
    albums,
    members,
    marks: members.map((name) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)),
    discoveredAt: Date.now(),
  }
}
