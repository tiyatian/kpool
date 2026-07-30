import seventeenSpill from '../assets/albums/seventeen-spill.jpg'
import aespaArmageddon from '../assets/albums/aespa-armageddon.jpg'
import skzAte from '../assets/albums/skz-ate.jpg'
import iveEmpathy from '../assets/albums/ive-empathy.jpg'
import txtSanctuary from '../assets/albums/txt-sanctuary.jpg'
import blackpinkBornPink from '../assets/albums/blackpink-born-pink.jpg'
import seventeenGroup from '../assets/groups/seventeen.jpg'
import aespaGroup from '../assets/groups/aespa.jpg'
import skzGroup from '../assets/groups/skz.jpg'
import iveGroup from '../assets/groups/ive.jpg'
import txtGroup from '../assets/groups/txt.jpg'
import blackpinkGroup from '../assets/groups/blackpink.jpg'

export const GROUPS = [
  {
    id: 'seventeen',
    name: 'SEVENTEEN',
    searchName: 'SEVENTEEN',
    label: '13 voices, one diamond',
    colors: ['#F6AFC5', '#A9D7F2'],
    accent: '#D44878',
    cover: seventeenSpill,
    photo: seventeenGroup,
    members: ['S.COUPS', 'JEONGHAN', 'JOSHUA', 'JUN', 'HOSHI', 'WONWOO', 'WOOZI', 'THE 8', 'MINGYU', 'DK', 'SEUNGKWAN', 'VERNON', 'DINO'],
    marks: ['C', 'JH', 'JS', 'J', 'H', 'W', 'WZ', '8', 'MG', 'DK', 'SK', 'V', 'D'],
  },
  {
    id: 'aespa',
    name: 'aespa',
    searchName: 'aespa',
    label: 'Armageddon energy',
    colors: ['#B8A7FF', '#6AE3D9'],
    accent: '#684CE6',
    cover: aespaArmageddon,
    photo: aespaGroup,
    members: ['KARINA', 'GISELLE', 'WINTER', 'NINGNING'],
    marks: ['K', 'G', 'W', 'N'],
  },
  {
    id: 'skz',
    name: 'Stray Kids',
    searchName: 'Stray Kids',
    label: 'You make Stray Kids stay',
    colors: ['#FF5353', '#1D1B22'],
    accent: '#D93636',
    cover: skzAte,
    photo: skzGroup,
    members: ['BANG CHAN', 'LEE KNOW', 'CHANGBIN', 'HYUNJIN', 'HAN', 'FELIX', 'SEUNGMIN', 'I.N'],
    marks: ['BC', 'LK', 'CB', 'HJ', 'H', 'F', 'SM', 'IN'],
  },
  {
    id: 'ive',
    name: 'IVE',
    searchName: 'IVE',
    label: 'I have what I show',
    colors: ['#FFB5DE', '#B9A9FF'],
    accent: '#B84394',
    cover: iveEmpathy,
    photo: iveGroup,
    members: ['YUJIN', 'GAEUL', 'REI', 'WONYOUNG', 'LIZ', 'LEESEO'],
    marks: ['YJ', 'G', 'R', 'WY', 'L', 'LS'],
  },
  {
    id: 'txt',
    name: 'TXT',
    searchName: 'TOMORROW X TOGETHER',
    label: 'Tomorrow by together',
    colors: ['#55D9F2', '#5877FF'],
    accent: '#2466CF',
    cover: txtSanctuary,
    photo: txtGroup,
    members: ['SOOBIN', 'YEONJUN', 'BEOMGYU', 'TAEHYUN', 'HUENING KAI'],
    marks: ['SB', 'YJ', 'BG', 'TH', 'HK'],
  },
  {
    id: 'blackpink',
    name: 'BLACKPINK',
    searchName: 'BLACKPINK',
    label: 'Born pink',
    colors: ['#FF87B7', '#171217'],
    accent: '#D63879',
    cover: blackpinkBornPink,
    photo: blackpinkGroup,
    members: ['JISOO', 'JENNIE', 'ROSÉ', 'LISA'],
    marks: ['JS', 'JN', 'R', 'L'],
  },
]

export const ALBUMS = {
  seventeen: [
    { id: 'spill', name: 'SPILL THE FEELS', era: '12th Mini Album', colors: ['#F8C7D6', '#8DCFEA'], cover: seventeenSpill },
    { id: 'maestro', name: '17 IS RIGHT HERE', era: 'Best Album', colors: ['#D8C7B5', '#2A2A2A'] },
    { id: 'fml', name: 'FML', era: '10th Mini Album', colors: ['#F2D7E0', '#A9D3EA'] },
  ],
  aespa: [
    { id: 'armageddon', name: 'ARMAGEDDON', era: '1st Full Album', colors: ['#AFA3FF', '#22232A'], cover: aespaArmageddon },
    { id: 'whiplash', name: 'WHIPLASH', era: '5th Mini Album', colors: ['#99E7DD', '#51418C'] },
  ],
  skz: [
    { id: 'ate', name: 'ATE', era: '9th Mini Album', colors: ['#F1483E', '#161419'], cover: skzAte },
  ],
  ive: [
    { id: 'empathy', name: 'IVE EMPATHY', era: '3rd EP', colors: ['#FF9ECD', '#6F90D9'], cover: iveEmpathy },
  ],
  txt: [
    { id: 'sanctuary', name: 'THE STAR CHAPTER: SANCTUARY', era: '7th Mini Album', colors: ['#E9F0F7', '#637DA5'], cover: txtSanctuary },
  ],
  blackpink: [
    { id: 'born-pink', name: 'BORN PINK', era: '2nd Full Album', colors: ['#FF8CBA', '#171217'], cover: blackpinkBornPink },
  ],
}

export const RIDES = [
  {
    id: 'ride-1',
    groupId: 'seventeen',
    albumId: 'spill',
    album: 'SPILL THE FEELS',
    type: '专辑＋成员特典',
    owner: 'peach train',
    location: '上海',
    total: 1560,
    status: 'open',
    occupied: [1, 4, 8, 11],
    prices: [110, 118, 108, 112, 126, 120, 102, 98, 144, 105, 100, 96, 121],
  },
  {
    id: 'ride-2',
    groupId: 'seventeen',
    albumId: 'spill',
    album: 'SPILL THE FEELS',
    type: '仅成员特典',
    owner: 'diamond line',
    location: '广东',
    total: 1300,
    status: 'open',
    occupied: [0, 2, 3, 6, 9, 10, 12],
    prices: [96, 105, 92, 98, 116, 104, 88, 86, 130, 92, 86, 84, 123],
  },
  {
    id: 'ride-3',
    groupId: 'seventeen',
    albumId: 'fml',
    album: 'FML',
    type: '专辑＋成员特典',
    owner: 'carat cloud',
    location: '浙江',
    total: 1430,
    status: 'full',
    occupied: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    prices: [108, 112, 100, 106, 118, 114, 95, 92, 134, 98, 94, 90, 119],
  },
]

export const MEMBER_ICONS = ['✦', '◇', '⊹', '⌁', '✶', '◌', '✹', '△', '✦', '□', '∿', '◈', '○']
