// ─── Cached data ────────────────────────────────────────────────────────────
let _cache = null

async function loadData() {
  if (_cache) return _cache
  const res = await fetch('/new-companies.json')
  _cache = await res.json()
  return _cache
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const CYRILLIC = {
  'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ж':'J','З':'Z','И':'I',
  'Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S',
  'Т':'T','У':'U','Ф':'F','Х':'X','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Sh',
  'Ъ':"'",'Ы':'I','Ь':'','Э':'E','Ю':'Yu','Я':'Ya',
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ж':'j','з':'z','и':'i',
  'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s',
  'т':'t','у':'u','ф':'f','х':'x','ц':'ts','ч':'ch','ш':'sh','щ':'sh',
  'ъ':"'",'ы':'i','ь':'','э':'e','ю':'yu','я':'ya',
  'Ғ':"G'",'Қ':'Q','Ҳ':'H','Ў':"O'",'ғ':"g'",'қ':'q','ҳ':'h','ў':"o'",
}

export function toLatin(text = '') {
  return text.split('').map(ch => CYRILLIC[ch] ?? ch).join('')
}

function getStatusLabel(status, appStatus = '') {
  if (status === 'CONCLUDED') return appStatus.includes('ижобий') ? 'ijobiy' : 'salbiy'
  if (status === 'CONCLUSION_REJECTED') return 'salbiy'
  return 'jarayonda'
}

// ─── Companies list ──────────────────────────────────────────────────────────
export async function getCompanies({ search = '', page = 1, pageSize = 50, sortBy = 'total' } = {}) {
  const records = await loadData()

  const grouped = {}
  for (const r of records) {
    const pin = r.consultant_pin
    if (!grouped[pin]) grouped[pin] = []
    grouped[pin].push(r)
  }

  const list = Object.entries(grouped).map(([pin, items]) => {
    const ratings = items.map(i => parseInt(i.expert_rating)).filter(n => !isNaN(n))
    const avgRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10 * 10) / 10 : 0
    const ijobiy = items.filter(i => getStatusLabel(i.status, i.application_status) === 'ijobiy').length
    const salbiy = items.filter(i => getStatusLabel(i.status, i.application_status) === 'salbiy').length
    const ijobiyPct = items.length ? Math.round((ijobiy / items.length) * 1000) / 10 : 0
    return {
      pin,
      name: items[0].consultant_name.replace(/""/g, '"'),
      total_projects: items.length,
      avg_expert_rating: avgRating,
      ijobiy,
      salbiy,
      ijobiy_pct: ijobiyPct,
    }
  })

  const sortFns = {
    total:  (a, b) => b.total_projects - a.total_projects,
    rating: (a, b) => b.avg_expert_rating - a.avg_expert_rating,
    ijobiy: (a, b) => b.ijobiy_pct - a.ijobiy_pct,
  }
  list.sort(sortFns[sortBy] ?? sortFns.total)

  const filtered = search
    ? list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.pin.includes(search))
    : list

  const total = filtered.length
  const start = (page - 1) * pageSize
  return {
    total,
    page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
    items: filtered.slice(start, start + pageSize),
  }
}

// ─── Company detail ──────────────────────────────────────────────────────────
export async function getCompanyProjects(pin) {
  const records = await loadData()
  const items = records.filter(r => r.consultant_pin === pin)
  if (!items.length) return null

  const projects = items.map(r => ({
    id: r.id,
    application_num: r.application_num,
    application_doc: r.application_doc,
    conclusion_num: r.conclusion_num ?? '',
    conclusion_doc: r.conclusion_doc ?? '',
    application_type: toLatin(r.application_type),
    applicant_name: r.applicant_name,
    applicant_tin: r.applicant_tin,
    material_type: toLatin(r.material_type ?? ''),
    expert_rating: (parseInt(r.expert_rating) || 0) * 10,
    expert_name: r.expert_name,
    receiver_rating: (parseInt(r.receiver_rating) || 0) * 10,
    receiver_name: r.receiver_name,
    application_status: r.application_status,
    conclusion_date: r.conclusion_date ?? '',
    status: r.status,
    status_label: getStatusLabel(r.status, r.application_status),
  }))

  return {
    pin,
    name: items[0].consultant_name.replace(/""/g, '"'),
    projects,
  }
}

// ─── Loyihachilar reytingi (toifalar bo'yicha taqsimot) ─────────────────────
const TIER_ORDER = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C']

function getTierKey(score) {
  if (score >= 94) return 'AAA'
  if (score >= 87) return 'AA'
  if (score >= 81) return 'A'
  if (score >= 71) return 'BBB'
  if (score >= 61) return 'BB'
  if (score >= 51) return 'B'
  if (score >= 34) return 'CCC'
  if (score >= 17) return 'CC'
  return 'C'
}

function getTierGroup(tier) {
  if (['AAA', 'AA', 'A'].includes(tier)) return 'A'
  if (['BBB', 'BB', 'B'].includes(tier)) return 'B'
  return 'C'
}

export async function getLoyihachilarRating() {
  const records = await loadData()

  const grouped = {}
  for (const r of records) {
    const pin = r.consultant_pin
    if (!grouped[pin]) grouped[pin] = []
    grouped[pin].push(r)
  }

  const counts = Object.fromEntries(TIER_ORDER.map(t => [t, 0]))
  for (const items of Object.values(grouped)) {
    const ratings = items.map(i => parseInt(i.expert_rating)).filter(n => !isNaN(n))
    const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10 : 0
    counts[getTierKey(avg)]++
  }

  return {
    total: Object.keys(grouped).length,
    tiers: TIER_ORDER.map(key => ({ key, group: getTierGroup(key), count: counts[key] })),
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export async function getDashboardData() {
  const records = await loadData()

  // Chart 2: By material type
  const mtCount = {}
  for (const r of records) {
    const mt = toLatin(r.material_type ?? 'Nomalum')
    mtCount[mt] = (mtCount[mt] ?? 0) + 1
  }
  const chart2 = Object.entries(mtCount).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

  // Chart 3: Positive/negative by toifa
  const toifaData = {}
  for (const r of records) {
    const toifa = r.application_type !== '-' ? toLatin(r.application_type) : 'Boshqa'
    if (!toifaData[toifa]) toifaData[toifa] = { ijobiy: 0, salbiy: 0, jarayonda: 0 }
    const label = getStatusLabel(r.status, r.application_status)
    toifaData[toifa][label]++
  }
  const chart3 = Object.entries(toifaData)
    .sort((a, b) => (b[1].ijobiy + b[1].salbiy) - (a[1].ijobiy + a[1].salbiy))
    .map(([name, v]) => ({ name, ...v }))

  return { chart2_material: chart2, chart3_toifa: chart3 }
}
