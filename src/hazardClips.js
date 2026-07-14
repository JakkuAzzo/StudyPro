export const HAZARD_CLIP_COUNT = 14
export const HAZARD_PASS_MARK = 44
export const HAZARD_MAX_SCORE = 75

const clip = (id, title, author, license, duration, hazards) => ({
  id, title, author, license, duration, hazards,
  src: `./assets/hazards/${id}.webm`,
  sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title).replaceAll('%20', '_')}`,
})

// Training annotations for open-licence footage; not official DVSA windows.
export const hazardClips = [
  clip('cow-grid', 'Cow crosses cattle grid.webm', 'Luke Byers', 'CC BY 3.0', 30.8, [{ start: 8, end: 14, label: 'A cow begins to enter the vehicle path.' }]),
  clip('deer-road', 'Metskitsed autoteel.webm', 'Virgo Siil', 'CC0', 8.3, [{ start: 1.2, end: 5.8, label: 'Deer move into and across the carriageway.' }]),
  clip('motorway-crash', '400 SB Crash.webm', 'Dash', 'Public domain', 17.5, [{ start: 6.5, end: 12.5, label: 'Traffic ahead becomes unstable and a collision develops.' }]),
  clip('tunnel-meeting', 'Bad traffic meeting in cave tunnel.webm', 'CCTV footage', 'Public domain', 50, [{ start: 20, end: 27, label: 'Opposing traffic constricts the available path.' }]),
  clip('signal', 'Chinese Signal.webm', 'XZise', 'CC0', 9.4, [{ start: 2, end: 7, label: 'Traffic movement changes around the junction.' }]),
  clip('night-city', 'City at night.webm', 'Editor', 'CC BY 3.0', 29, [{ start: 12, end: 18, label: 'Traffic and vulnerable road users converge in reduced visibility.' }]),
  clip('bypass-incident', 'Connect to the opposite lane and bypass the traffic accident section.webm', 'CCTV footage', 'Public domain', 30.2, [{ start: 6, end: 12, label: 'A blocked lane requires a change of speed and direction.' }, { start: 18, end: 24, label: 'Oncoming traffic creates a second conflict.' }]),
  clip('narrow-pass-long', 'Conor Pass-1011765, Dingle Peninsula, Co. Kerry, Ireland.webm', 'Maoileann', 'CC BY-SA 4.0', 50, [{ start: 31, end: 38, label: 'The narrow road and approaching traffic require action.' }]),
  clip('narrow-pass-bend', 'Conor Pass-1012864, Dingle Peninsula, Co. Kerry, Ireland.webm', 'Maoileann', 'CC BY-SA 4.0', 8.6, [{ start: 2, end: 7, label: 'Restricted visibility and road width create a meeting hazard.' }]),
  clip('narrow-pass-traffic', 'Conor Pass-1012988, Dingle Peninusla, Co. Kerry, Ireland.webm', 'Maoileann', 'CC BY-SA 4.0', 25.9, [{ start: 10, end: 17, label: 'Approaching traffic on the narrow pass requires action.' }]),
  clip('airport-crosswalk', 'Crosswalk at San José International Airport Consolidated Rental Car Facility exit.webm', 'Minh Nguyen', 'CC BY-SA 4.0', 5.6, [{ start: .8, end: 4.8, label: 'The pedestrian crossing becomes an immediate conflict point.' }]),
  clip('busy-link-road', 'Moving vehicles in Link road, Cuttack, Odisha.webm', 'Subhashish Panigrahi', 'CC BY-SA 3.0', 45, [{ start: 19, end: 26, label: 'Mixed traffic begins to cross and merge.' }]),
  clip('rear-end', 'Multiple cars rear-end collision on highway.webm', 'CCTV footage', 'Public domain', 30, [{ start: 8, end: 15, label: 'Traffic ahead compresses rapidly.' }]),
  clip('road-closure', 'Road closure at Highway 12 - January 2023 - Sarah Stierch.webm', 'Sarah Stierch', 'CC BY 4.0', 8, [{ start: 1, end: 6, label: 'The closure and people in the road require action.' }]),
  clip('wintry-road', 'Wintry Dashcam (Feb 2016, 720p).webm', 'brownpau', 'CC BY 3.0', 45, [{ start: 24, end: 31, label: 'Snow and reduced grip make the situation hazardous.' }]),
  clip('zipper-truck', 'Zipper truck.webm', 'Pete Forsyth', 'CC0', 8.5, [{ start: 2, end: 7, label: 'The moving barrier vehicle changes the usable lane.' }]),
]

export function looksLikePatternClicking(clicks) {
  if (clicks.length >= 10) return true
  if (clicks.length < 6) return false
  const intervals = clicks.slice(1).map((time, index) => time - clicks[index])
  return Math.max(...intervals) - Math.min(...intervals) < .2
}

export function scoreClip(item, clicks) {
  if (looksLikePatternClicking(clicks)) return { score: 0, invalidPattern: true, hazardScores: item.hazards.map(() => 0) }
  const hazardScores = item.hazards.map((hazard) => {
    const time = clicks.filter((clickTime) => clickTime >= hazard.start && clickTime <= hazard.end).sort((a, b) => a - b)[0]
    if (time === undefined) return 0
    return Math.max(1, 5 - Math.floor(((time - hazard.start) / (hazard.end - hazard.start)) * 5))
  })
  return { score: hazardScores.reduce((sum, value) => sum + value, 0), invalidPattern: false, hazardScores }
}

function orderValue(seed, id) {
  let value = 0
  for (const character of `${seed}:${id}`) value = Math.imul(value ^ character.charCodeAt(0), 16777619)
  return value >>> 0
}

export function generateHazardTest(seed = Math.random()) {
  const double = hazardClips.find((item) => item.hazards.length === 2)
  const singles = hazardClips.filter((item) => item.hazards.length === 1).sort((a, b) => orderValue(seed, a.id) - orderValue(seed, b.id))
  return [double, ...singles.slice(0, 13)].sort((a, b) => orderValue(`${seed}:order`, a.id) - orderValue(`${seed}:order`, b.id))
}
