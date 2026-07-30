import Taro from '@tarojs/taro'
import { GROUPS, RIDES } from '../data/mock'

const KEYS = {
  group: 'kpool-v2-group',
  discoveredGroups: 'kpool-v2-discovered-groups',
  onboarded: 'kpool-v2-onboarded',
  rides: 'kpool-v2-rides',
}

export function getDiscoveredGroups() {
  return Taro.getStorageSync(KEYS.discoveredGroups) || []
}

export function getAllGroups() {
  return [...GROUPS, ...getDiscoveredGroups().filter((item) => !GROUPS.some((group) => group.id === item.id))]
}

export function saveDiscoveredGroup(group) {
  if (GROUPS.some((item) => item.id === group.id)) return group
  const groups = getDiscoveredGroups().filter((item) => item.id !== group.id)
  Taro.setStorageSync(KEYS.discoveredGroups, [group, ...groups].slice(0, 20))
  return group
}

export function getGroupById(id) {
  return getAllGroups().find((group) => group.id === id)
}

export function getSelectedGroup() {
  const id = Taro.getStorageSync(KEYS.group) || 'seventeen'
  return getGroupById(id) || GROUPS[0]
}

export function selectGroup(id) {
  Taro.setStorageSync(KEYS.group, id)
}

export function isOnboarded() {
  return Boolean(Taro.getStorageSync(KEYS.onboarded))
}

export function finishOnboarding() {
  Taro.setStorageSync(KEYS.onboarded, true)
}

export function getRides() {
  return Taro.getStorageSync(KEYS.rides) || RIDES
}

export function saveRides(rides) {
  Taro.setStorageSync(KEYS.rides, rides)
}

export function getRide(id) {
  return getRides().find((ride) => ride.id === id) || getRides()[0]
}

export function occupySeat(rideId, memberIndex) {
  const rides = getRides()
  const ride = rides.find((item) => item.id === rideId)
  if (!ride || ride.occupied.includes(memberIndex)) return false
  ride.occupied = [...ride.occupied, memberIndex]
  ride.claims = {
    ...(ride.claims || {}),
    [memberIndex]: {
      userId: 'me',
      nickname: '我的 KPOOL',
      occupiedAt: Date.now(),
      exitStatus: null,
    },
  }
  ride.status = ride.occupied.length === ride.prices.length ? 'full' : 'open'
  saveRides(rides)
  return true
}

export function getMyClaim(ride) {
  if (!ride?.claims) return null
  const entry = Object.entries(ride.claims).find(([, claim]) => claim.userId === 'me')
  if (!entry) return null
  return { memberIndex: Number(entry[0]), ...entry[1] }
}

export function leaveOrRequestExit(rideId) {
  const rides = getRides()
  const ride = rides.find((item) => item.id === rideId)
  const claim = getMyClaim(ride)
  if (!ride || !claim || ride.status === 'departed') return { status: 'blocked' }

  const elapsed = Date.now() - claim.occupiedAt
  if (elapsed <= 10 * 60 * 1000) {
    ride.occupied = ride.occupied.filter((index) => index !== claim.memberIndex)
    delete ride.claims[claim.memberIndex]
    ride.status = 'open'
    saveRides(rides)
    return { status: 'left' }
  }

  ride.claims[claim.memberIndex].exitStatus = 'pending'
  ride.claims[claim.memberIndex].exitRequestedAt = Date.now()
  saveRides(rides)
  return { status: 'requested' }
}

export function departRide(rideId, qrPath) {
  const rides = getRides()
  const ride = rides.find((item) => item.id === rideId)
  if (!ride || ride.status !== 'full') return false
  ride.qrPath = qrPath
  ride.status = 'departed'
  ride.departedAt = Date.now()
  saveRides(rides)
  return true
}

export function addRide(ride) {
  saveRides([ride, ...getRides()])
}
