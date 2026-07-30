import Taro from '@tarojs/taro'

const ITUNES_API = 'https://itunes.apple.com'
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php'
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'

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

const findArtistAndAlbums = async (keyword) => {
  const payload = await request(`${ITUNES_API}/search`, {
    term: keyword,
    entity: 'album',
    media: 'music',
    limit: 30,
    country: 'KR',
  })
  const rows = payload?.results || []
  if (!rows.length) return null
  const normalized = keyword.toLowerCase().replace(/\s+/g, '')
  const ranked = [...rows].sort((a, b) => {
    const aName = String(a.artistName || '').toLowerCase().replace(/\s+/g, '')
    const bName = String(b.artistName || '').toLowerCase().replace(/\s+/g, '')
    return Number(bName === normalized) - Number(aName === normalized)
  })
  const artistName = ranked[0]?.artistName
  if (!artistName) return null
  const albums = ranked
    .filter((item) => item.artistName === artistName)
    .sort((a, b) => String(b.releaseDate || '').localeCompare(String(a.releaseDate || '')))
    .filter((item, index, list) => list.findIndex((candidate) => candidate.collectionName === item.collectionName) === index)
    .slice(0, 8)
    .map((album, index) => ({
      id: String(album.collectionId || index),
      name: album.collectionName,
      era: String(album.releaseDate || '').slice(0, 4) || 'Release',
      cover: album.artworkUrl100?.replace('100x100bb', '600x600bb'),
      colors: palettes[index % palettes.length],
    }))
  return { id: ranked[0].artistId || artistName, name: artistName, albums }
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

const findGroupPhoto = async (keyword) => {
  try {
    const payload = await request(WIKIPEDIA_API, {
      action: 'query',
      generator: 'search',
      gsrsearch: `${keyword} K-pop group`,
      gsrnamespace: 0,
      gsrlimit: 3,
      prop: 'pageimages|description',
      piprop: 'original|thumbnail',
      pithumbsize: 1200,
      format: 'json',
      origin: '*',
    })
    const pages = Object.values(payload?.query?.pages || {})
    const page = pages.find((item) => /group|band|k-pop/i.test(item.description || '')) || pages[0]
    return page?.original?.source || page?.thumbnail?.source || null
  } catch (error) {
    return null
  }
}

export async function searchKpopGroup(keyword) {
  const query = keyword.trim()
  if (query.length < 2) return null

  const artist = await findArtistAndAlbums(query)
  if (!artist) return null

  const [members, groupPhoto] = await Promise.all([findMembers(artist.name), findGroupPhoto(artist.name)])
  const albums = artist.albums
  const paletteIndex = String(artist.id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const colors = palettes[paletteIndex % palettes.length]
  const photo = groupPhoto || albums[0]?.cover

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
