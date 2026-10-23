import { useState, useId, useEffect, useRef } from 'react'
import {
  Home, Beef, Milk, Baby, Heart, ChevronRight, ChevronLeft,
  Plus, Edit2, Trash2, Eye, Clock,
  Wifi, WifiOff, RefreshCw, Search, X, Check,
  TrendingUp, Activity, LogOut, Lock, Mail,
  ArrowLeft, AlertTriangle, Calendar, Bell,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = 'login' | 'dashboard' | 'vacas' | 'vacaProfile' | 'toros' | 'crias' | 'reproduccion' | 'partos' | 'destetes' | 'calendario' | 'notificaciones' | 'usuarios'
type SyncStatus = 'online' | 'offline' | 'syncing'
type Account = { id: number; email: string; is_admin: boolean; active: boolean }

interface Vaca {
  id: string; nombre: string; raza: string; fechaNacimiento: string; peso: string
  estado: 'Preñada' | 'Vacía' | 'En celo' | 'Lactando' | 'Seca'
  ultimoParto: string; proximoParto: string; partos: number; observaciones: string
  padre: string; madre: string
}
interface Toro {
  id: string; nombre: string; raza: string; fechaNacimiento: string; peso: string
  estado: 'Activo' | 'En cuarentena' | 'Inactivo'
  observaciones: string
}
interface Cria {
  id: string; nombre: string; sexo: 'Macho' | 'Hembra'; fechaNacimiento: string
  madre: string; padre: string; peso: string
  estado: 'Saludable' | 'En observación' | 'Enfermo'; fechaDestete: string; observaciones: string
}
interface Reproduccion {
  id: string; vacaId: string; toroId: string; fecha: string; tipo: 'Natural' | 'IA' | 'FTIV'
  observaciones: string; fechaParto: string; fechaDestete: string; fechaReinicio: string
}
interface Parto {
  id: string; vacaId: string; criaId: string; fecha: string; tipo: 'Normal' | 'Distócico' | 'Cesárea'
  pesoNacimiento: string; observaciones: string
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const seedVacas: Vaca[] = [
  { id: 'V-001', nombre: 'Estrella', raza: 'Holstein', fechaNacimiento: '2021-02-15', peso: '520', estado: 'Preñada', ultimoParto: '2025-03-12', proximoParto: '2026-01-18', partos: 3, observaciones: 'Excelente productora.', padre: 'Titán (T-002)', madre: 'Bella' },
  { id: 'V-002', nombre: 'Luna', raza: 'Angus', fechaNacimiento: '2020-06-10', peso: '480', estado: 'Vacía', ultimoParto: '2024-08-01', proximoParto: '', partos: 4, observaciones: '', padre: 'Zeus (T-003)', madre: 'Celia' },
  { id: 'V-003', nombre: 'Paloma', raza: 'Brahman', fechaNacimiento: '2022-09-22', peso: '440', estado: 'Preñada', ultimoParto: '', proximoParto: '2026-02-05', partos: 1, observaciones: '', padre: 'Fuerte (T-001)', madre: 'Rosita' },
  { id: 'V-004', nombre: 'Rosa', raza: 'Simmental', fechaNacimiento: '2019-03-05', peso: '560', estado: 'En celo', ultimoParto: '2024-11-20', proximoParto: '', partos: 5, observaciones: 'Ciclos regulares.', padre: 'T-001', madre: 'Nena' },
  { id: 'V-005', nombre: 'Canela', raza: 'Hereford', fechaNacimiento: '2021-07-18', peso: '490', estado: 'Lactando', ultimoParto: '2025-12-10', proximoParto: '', partos: 2, observaciones: '', padre: 'Zeus (T-003)', madre: 'Mora' },
  { id: 'V-006', nombre: 'Niebla', raza: 'Holstein', fechaNacimiento: '2020-11-30', peso: '530', estado: 'Preñada', ultimoParto: '2025-04-15', proximoParto: '2026-02-22', partos: 3, observaciones: '', padre: 'Fuerte (T-001)', madre: 'Lila' },
]
const seedToros: Toro[] = [
  { id: 'T-001', nombre: 'Fuerte', raza: 'Angus', fechaNacimiento: '2019-05-10', peso: '720', estado: 'Activo', observaciones: 'Alto índice reproductivo.' },
  { id: 'T-002', nombre: 'Titán', raza: 'Brahman', fechaNacimiento: '2017-08-20', peso: '850', estado: 'Activo', observaciones: '' },
  { id: 'T-003', nombre: 'Zeus', raza: 'Hereford', fechaNacimiento: '2020-11-04', peso: '690', estado: 'En cuarentena', observaciones: 'En observación veterinaria.' },
]
const seedCrias: Cria[] = [
  { id: 'C-001', nombre: 'Lucero', sexo: 'Hembra', fechaNacimiento: '2025-12-10', madre: 'V-005', padre: 'T-001', peso: '42', estado: 'Saludable', fechaDestete: '2026-06-10', observaciones: '' },
  { id: 'C-002', nombre: 'Trueno', sexo: 'Macho', fechaNacimiento: '2025-11-05', madre: 'V-001', padre: 'T-002', peso: '48', estado: 'Saludable', fechaDestete: '2026-05-05', observaciones: '' },
  { id: 'C-003', nombre: 'Nube', sexo: 'Hembra', fechaNacimiento: '2025-10-20', madre: 'V-003', padre: 'T-003', peso: '38', estado: 'En observación', fechaDestete: '2026-04-20', observaciones: 'Bajo peso al nacer.' },
]
const seedReproducciones: Reproduccion[] = [
  { id: 'R-001', vacaId: 'V-004', toroId: 'T-001', fecha: '2026-01-20', tipo: 'Natural', observaciones: 'Celo confirmado', fechaParto: '2026-11-29', fechaDestete: '2027-05-28', fechaReinicio: '2027-08-26' },
]
const seedPartos: Parto[] = [
  { id: 'P-001', vacaId: 'V-005', criaId: 'C-001', fecha: '2025-12-10', tipo: 'Normal', pesoNacimiento: '42', observaciones: '' },
  { id: 'P-002', vacaId: 'V-001', criaId: 'C-002', fecha: '2025-11-05', tipo: 'Normal', pesoNacimiento: '48', observaciones: '' },
]

const birthData = [
  { mes: 'Ene', nacimientos: 4 }, { mes: 'Feb', nacimientos: 6 }, { mes: 'Mar', nacimientos: 3 },
  { mes: 'Abr', nacimientos: 8 }, { mes: 'May', nacimientos: 5 }, { mes: 'Jun', nacimientos: 7 },
  { mes: 'Jul', nacimientos: 9 }, { mes: 'Ago', nacimientos: 4 }, { mes: 'Sep', nacimientos: 6 },
  { mes: 'Oct', nacimientos: 5 }, { mes: 'Nov', nacimientos: 3 }, { mes: 'Dic', nacimientos: 2 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcEdad(fecha: string) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  const now = new Date()
  const years = Math.floor((now.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000))
  return years === 1 ? '1 año' : `${years} años`
}
function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
function fmtDate(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, dd] = dateStr.split('-')
  return `${dd}/${m}/${y}`
}
function nextId(list: { id: string }[], prefix: string) {
  const nums = list.map(x => parseInt(x.id.replace(prefix + '-', ''), 10)).filter(n => !isNaN(n))
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}

function hasPendingReproduction(vacaId: string, reprod: Reproduccion[], partos: Parto[]) {
  const lastBirth = partos.filter(p => p.vacaId === vacaId).map(p => p.fecha).sort().at(-1) ?? ''
  return reprod.some(r => r.vacaId === vacaId && (!lastBirth || r.fecha > lastBirth))
}

const estadoBadge = (estado: string) => {
  const map: Record<string, string> = {
    'Preñada': 'bg-emerald-100 text-emerald-800',
    'Vacía': 'bg-gray-100 text-gray-600',
    'Lactando': 'bg-blue-100 text-blue-800',
    'En celo': 'bg-orange-100 text-orange-800',
    'Seca': 'bg-slate-100 text-slate-600',
    'Activo': 'bg-emerald-100 text-emerald-800',
    'En cuarentena': 'bg-amber-100 text-amber-800',
    'Inactivo': 'bg-gray-100 text-gray-600',
    'Saludable': 'bg-emerald-100 text-emerald-800',
    'En observación': 'bg-amber-100 text-amber-800',
    'Enfermo': 'bg-red-100 text-red-800',
  }
  return map[estado] || 'bg-gray-100 text-gray-600'
}

const calEventColor = (tipo: string) => {
  const map: Record<string, string> = { monta: 'bg-blue-500', parto: 'bg-emerald-600', destete: 'bg-orange-500', alerta: 'bg-red-500', vacuna: 'bg-purple-500' }
  return map[tipo] || 'bg-gray-400'
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4ddd0]">
          <h2 className="font-semibold text-[#1a2318]">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#f4f6f3] rounded-lg transition-colors"><X size={16} className="text-[#6b7c5e]" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Field helpers ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6b7c5e] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
const inp = "w-full border border-[#d4ddd0] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30 focus:border-[#2d5a27] bg-white"
const sel = inp

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <p className="text-sm text-[#1a2318] leading-relaxed pt-1">{msg}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-[#d4ddd0] rounded-xl hover:bg-[#f4f6f3] text-[#6b7c5e]">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Eliminar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Vaca Form ────────────────────────────────────────────────────────────────
function VacaForm({ initial, toros, onSave, onClose }: {
  initial?: Vaca; toros: Toro[]; onSave: (v: Vaca) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Vaca, 'id'>>({
    nombre: initial?.nombre ?? '', raza: initial?.raza ?? '', fechaNacimiento: initial?.fechaNacimiento ?? '',
    peso: initial?.peso ?? '', estado: initial?.estado ?? 'Vacía', ultimoParto: initial?.ultimoParto ?? '',
    proximoParto: initial?.proximoParto ?? '', partos: initial?.partos ?? 0,
    observaciones: initial?.observaciones ?? '', padre: initial?.padre ?? '', madre: initial?.madre ?? '',
  })
  const up = (k: keyof typeof form, v: string | number) => setForm(p => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...(initial ?? { id: '' }), ...form } as Vaca) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre *"><input required className={inp} value={form.nombre} onChange={e => up('nombre', e.target.value)} /></Field>
        <Field label="Raza *"><input required className={inp} value={form.raza} onChange={e => up('raza', e.target.value)} /></Field>
        <Field label="Fecha de nacimiento *"><input required type="date" className={inp} value={form.fechaNacimiento} onChange={e => up('fechaNacimiento', e.target.value)} /></Field>
        <Field label="Peso (kg)"><input type="number" className={inp} value={form.peso} onChange={e => up('peso', e.target.value)} /></Field>
        <Field label="Estado reproductivo">
          <select className={sel} value={form.estado} onChange={e => up('estado', e.target.value as Vaca['estado'])}>
            {['Preñada','Vacía','En celo','Lactando','Seca'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="N° de partos"><input type="number" min={0} className={inp} value={form.partos} onChange={e => up('partos', parseInt(e.target.value) || 0)} /></Field>
        <Field label="Fecha último parto"><input type="date" className={inp} value={form.ultimoParto} onChange={e => up('ultimoParto', e.target.value)} /></Field>
        <Field label="Próximo parto est."><input type="date" className={inp} value={form.proximoParto} onChange={e => up('proximoParto', e.target.value)} /></Field>
        <Field label="Padre (código/nombre)">
          <select className={sel} value={form.padre} onChange={e => up('padre', e.target.value)}>
            <option value="">— Sin registrar —</option>
            {toros.map(t => <option key={t.id} value={`${t.nombre} (${t.id})`}>{t.nombre} ({t.id})</option>)}
          </select>
        </Field>
        <Field label="Madre (nombre)"><input className={inp} value={form.madre} onChange={e => up('madre', e.target.value)} /></Field>
      </div>
      <Field label="Observaciones"><textarea rows={2} className={inp + ' resize-none'} value={form.observaciones} onChange={e => up('observaciones', e.target.value)} /></Field>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 py-2.5 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">{initial ? 'Guardar cambios' : 'Registrar vaca'}</button>
        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#d4ddd0] rounded-xl text-sm text-[#6b7c5e] hover:bg-[#f4f6f3]">Cancelar</button>
      </div>
    </form>
  )
}

// ─── Toro Form ────────────────────────────────────────────────────────────────
function ToroForm({ initial, onSave, onClose }: { initial?: Toro; onSave: (t: Toro) => void; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Toro, 'id'>>({
    nombre: initial?.nombre ?? '', raza: initial?.raza ?? '', fechaNacimiento: initial?.fechaNacimiento ?? '',
    peso: initial?.peso ?? '', estado: initial?.estado ?? 'Activo', observaciones: initial?.observaciones ?? '',
  })
  const up = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...(initial ?? { id: '' }), ...form } as Toro) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre *"><input required className={inp} value={form.nombre} onChange={e => up('nombre', e.target.value)} /></Field>
        <Field label="Raza *"><input required className={inp} value={form.raza} onChange={e => up('raza', e.target.value)} /></Field>
        <Field label="Fecha de nacimiento *"><input required type="date" className={inp} value={form.fechaNacimiento} onChange={e => up('fechaNacimiento', e.target.value)} /></Field>
        <Field label="Peso (kg)"><input type="number" className={inp} value={form.peso} onChange={e => up('peso', e.target.value)} /></Field>
        <Field label="Estado" className="col-span-2">
          <select className={sel} value={form.estado} onChange={e => up('estado', e.target.value as Toro['estado'])}>
            {['Activo','En cuarentena','Inactivo'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Observaciones"><textarea rows={2} className={inp + ' resize-none'} value={form.observaciones} onChange={e => up('observaciones', e.target.value)} /></Field>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 py-2.5 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">{initial ? 'Guardar cambios' : 'Registrar toro'}</button>
        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#d4ddd0] rounded-xl text-sm text-[#6b7c5e] hover:bg-[#f4f6f3]">Cancelar</button>
      </div>
    </form>
  )
}

// ─── Cria Form ────────────────────────────────────────────────────────────────
function CriaForm({ initial, vacas, toros, onSave, onClose }: {
  initial?: Cria; vacas: Vaca[]; toros: Toro[]; onSave: (c: Cria) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Cria, 'id'>>({
    nombre: initial?.nombre ?? '', sexo: initial?.sexo ?? 'Hembra', fechaNacimiento: initial?.fechaNacimiento ?? '',
    madre: initial?.madre ?? '', padre: initial?.padre ?? '', peso: initial?.peso ?? '',
    estado: initial?.estado ?? 'Saludable', fechaDestete: initial?.fechaDestete ?? '', observaciones: initial?.observaciones ?? '',
  })
  const up = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))
  const autoDestete = (fn: string) => fn ? addDays(fn, 210) : ''
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...(initial ?? { id: '' }), ...form } as Cria) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre *"><input required className={inp} value={form.nombre} onChange={e => up('nombre', e.target.value)} /></Field>
        <Field label="Sexo">
          <select className={sel} value={form.sexo} onChange={e => up('sexo', e.target.value as Cria['sexo'])}>
            <option>Hembra</option><option>Macho</option>
          </select>
        </Field>
        <Field label="Fecha de nacimiento *">
          <input required type="date" className={inp} value={form.fechaNacimiento} onChange={e => {
            up('fechaNacimiento', e.target.value)
            setForm(p => ({ ...p, fechaNacimiento: e.target.value, fechaDestete: autoDestete(e.target.value) }))
          }} />
        </Field>
        <Field label="Peso al nacer (kg)"><input type="number" className={inp} value={form.peso} onChange={e => up('peso', e.target.value)} /></Field>
        <Field label="Madre">
          <select className={sel} value={form.madre} onChange={e => up('madre', e.target.value)}>
            <option value="">— Sin registrar —</option>
            {vacas.map(v => <option key={v.id} value={v.id}>{v.nombre} ({v.id})</option>)}
          </select>
        </Field>
        <Field label="Padre">
          <select className={sel} value={form.padre} onChange={e => up('padre', e.target.value)}>
            <option value="">— Sin registrar —</option>
            {toros.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.id})</option>)}
          </select>
        </Field>
        <Field label="Estado">
          <select className={sel} value={form.estado} onChange={e => up('estado', e.target.value as Cria['estado'])}>
            {['Saludable','En observación','Enfermo'].map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Fecha destete est."><input type="date" className={inp} value={form.fechaDestete} onChange={e => up('fechaDestete', e.target.value)} /></Field>
      </div>
      <Field label="Observaciones"><textarea rows={2} className={inp + ' resize-none'} value={form.observaciones} onChange={e => up('observaciones', e.target.value)} /></Field>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 py-2.5 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">{initial ? 'Guardar cambios' : 'Registrar cría'}</button>
        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#d4ddd0] rounded-xl text-sm text-[#6b7c5e] hover:bg-[#f4f6f3]">Cancelar</button>
      </div>
    </form>
  )
}

// ─── Reproduccion Form ────────────────────────────────────────────────────────
function ReproduccionForm({ vacas, toros, reprod, partos, onSave, onClose }: {
  vacas: Vaca[]; toros: Toro[]; reprod: Reproduccion[]; partos: Parto[]; onSave: (r: Reproduccion) => void; onClose: () => void
}) {
  const availableVacas = vacas.filter(v => v.estado !== 'Preñada' && !hasPendingReproduction(v.id, reprod, partos))
  const [form, setForm] = useState({ vacaId: availableVacas[0]?.id ?? '', toroId: toros.find(t => t.estado === 'Activo')?.id ?? '', fecha: new Date().toISOString().slice(0,10), tipo: 'Natural' as Reproduccion['tipo'], observaciones: '' })
  const [error, setError] = useState('')
  const up = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))
  const fechaParto = form.fecha ? addDays(form.fecha, 283) : ''
  const fechaDestete = fechaParto ? addDays(fechaParto, 210) : ''
  const fechaReinicio = fechaParto ? addDays(fechaParto, 60) : ''
  return (
    <form onSubmit={e => {
      e.preventDefault()
      const vaca = vacas.find(v => v.id === form.vacaId)
      if (!vaca || vaca.estado === 'Preñada' || hasPendingReproduction(form.vacaId, reprod, partos)) {
        setError('Esta vaca ya está preñada o tiene una reproducción pendiente. Registra el parto o elimina el registro incorrecto antes de otra monta.')
        return
      }
      const lastBirth = partos.filter(p => p.vacaId === form.vacaId).map(p => p.fecha).sort().at(-1) ?? ''
      if (form.fecha <= lastBirth) {
        setError('La fecha de monta debe ser posterior al último parto de la vaca.')
        return
      }
      if (!toros.some(t => t.id === form.toroId && t.estado === 'Activo')) {
        setError('Selecciona un toro activo.')
        return
      }
      onSave({ id: '', ...form, fechaParto, fechaDestete, fechaReinicio } as Reproduccion)
    }} className="space-y-4">
      {availableVacas.length === 0 && <p role="alert" className="text-sm text-amber-800 bg-amber-50 rounded-xl p-3">No hay vacas disponibles para una nueva monta.</p>}
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Vaca *">
          <select required className={sel} value={form.vacaId} onChange={e => up('vacaId', e.target.value)}>
            {availableVacas.map(v => <option key={v.id} value={v.id}>{v.nombre} ({v.id})</option>)}
          </select>
        </Field>
        <Field label="Toro *">
          <select required className={sel} value={form.toroId} onChange={e => up('toroId', e.target.value)}>
            {toros.filter(t => t.estado === 'Activo').map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.id})</option>)}
          </select>
        </Field>
        <Field label="Fecha de monta *"><input required type="date" className={inp} value={form.fecha} onChange={e => up('fecha', e.target.value)} /></Field>
        <Field label="Tipo">
          <select className={sel} value={form.tipo} onChange={e => up('tipo', e.target.value as Reproduccion['tipo'])}>
            <option value="Natural">Monta natural</option>
            <option value="IA">Inseminación artificial</option>
            <option value="FTIV">Fertilización in vitro</option>
          </select>
        </Field>
      </div>
      <Field label="Observaciones"><textarea rows={2} className={inp + ' resize-none'} value={form.observaciones} onChange={e => up('observaciones', e.target.value)} /></Field>
      {form.fecha && (
        <div className="grid grid-cols-3 gap-3 p-4 bg-[#f4f6f3] rounded-xl border border-[#d4ddd0]">
          <div><div className="text-[10px] font-semibold text-[#6b7c5e] mb-0.5">Parto estimado</div><div className="text-sm font-bold text-[#2d5a27]">{fmtDate(fechaParto)}</div></div>
          <div><div className="text-[10px] font-semibold text-[#6b7c5e] mb-0.5">Destete estimado</div><div className="text-sm font-bold text-[#1a2318]">{fmtDate(fechaDestete)}</div></div>
          <div><div className="text-[10px] font-semibold text-[#6b7c5e] mb-0.5">Nueva reproducción</div><div className="text-sm font-bold text-[#1a2318]">{fmtDate(fechaReinicio)}</div></div>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={availableVacas.length === 0 || !toros.some(t => t.estado === 'Activo')} className="flex-1 py-2.5 bg-[#2d5a27] disabled:opacity-50 text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">Guardar registro</button>
        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#d4ddd0] rounded-xl text-sm text-[#6b7c5e] hover:bg-[#f4f6f3]">Cancelar</button>
      </div>
    </form>
  )
}

// ─── Parto Form ───────────────────────────────────────────────────────────────
function PartoForm({ vacas, crias, onSave, onClose }: {
  vacas: Vaca[]; crias: Cria[]; onSave: (p: Parto) => void; onClose: () => void
}) {
  const [form, setForm] = useState({ vacaId: vacas[0]?.id ?? '', criaId: crias[0]?.id ?? '', fecha: new Date().toISOString().slice(0,10), tipo: 'Normal' as Parto['tipo'], pesoNacimiento: '', observaciones: '' })
  const up = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ id: '', ...form } as Parto) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Vaca madre *">
          <select required className={sel} value={form.vacaId} onChange={e => up('vacaId', e.target.value)}>
            {vacas.map(v => <option key={v.id} value={v.id}>{v.nombre} ({v.id})</option>)}
          </select>
        </Field>
        <Field label="Cría asociada">
          <select className={sel} value={form.criaId} onChange={e => up('criaId', e.target.value)}>
            <option value="">— Sin cría registrada —</option>
            {crias.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.id})</option>)}
          </select>
        </Field>
        <Field label="Fecha del parto *"><input required type="date" className={inp} value={form.fecha} onChange={e => up('fecha', e.target.value)} /></Field>
        <Field label="Tipo de parto">
          <select className={sel} value={form.tipo} onChange={e => up('tipo', e.target.value as Parto['tipo'])}>
            <option>Normal</option><option>Distócico</option><option>Cesárea</option>
          </select>
        </Field>
        <Field label="Peso nacimiento (kg)"><input type="number" className={inp} value={form.pesoNacimiento} onChange={e => up('pesoNacimiento', e.target.value)} /></Field>
      </div>
      <Field label="Observaciones"><textarea rows={2} className={inp + ' resize-none'} value={form.observaciones} onChange={e => up('observaciones', e.target.value)} /></Field>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 py-2.5 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">Registrar parto</button>
        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#d4ddd0] rounded-xl text-sm text-[#6b7c5e] hover:bg-[#f4f6f3]">Cancelar</button>
      </div>
    </form>
  )
}

// ─── Sync Indicator ───────────────────────────────────────────────────────────
function SyncIndicator({ status, onSync }: { status: SyncStatus; onSync: () => void }) {
  return (
    <div className="flex items-center gap-2">
      {status === 'online' && <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"><Wifi size={12} /> Sincronizado</span>}
      {status === 'offline' && <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200"><WifiOff size={12} /> Sin conexión</span>}
      {status === 'syncing' && <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"><RefreshCw size={12} className="animate-spin" /> Sincronizando...</span>}
      <button onClick={onSync} className="text-xs text-[#6b7c5e] hover:text-[#2d5a27] flex items-center gap-1 transition-colors">
        <RefreshCw size={12} /> Sincronizar
      </button>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard', label: 'Inicio', Icon: Home },
  { id: 'vacas', label: 'Vacas', Icon: Milk },
  { id: 'toros', label: 'Toros', Icon: Beef },
  { id: 'crias', label: 'Crías', Icon: Baby },
  { id: 'reproduccion', label: 'Reproducción', Icon: Heart },
  { id: 'partos', label: 'Partos', Icon: Activity },
  { id: 'destetes', label: 'Destetes', Icon: TrendingUp },
  { id: 'calendario', label: 'Calendario', Icon: Calendar },
  { id: 'notificaciones', label: 'Recordatorios', Icon: Bell },
  { id: 'usuarios', label: 'Usuarios', Icon: Lock },
]

function Sidebar({ current, onNav, collapsed, onToggle, onLogout, account }: {
  current: Screen; onNav: (s: Screen) => void; collapsed: boolean; onToggle: () => void; onLogout: () => void; account: Account
}) {
  return (
    <aside className="h-full flex flex-col border-r border-[#d4ddd0] bg-[#1a2318] transition-all duration-300" style={{ width: collapsed ? 64 : 220 }}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-[#2d5a27] flex items-center justify-center flex-shrink-0">
          <Beef size={20} className="text-white" />
        </div>
        {!collapsed && <div><div className="text-white font-semibold text-sm leading-tight">BoviControl</div><div className="text-[#6b7c5e] text-xs font-medium">Pro</div></div>}
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.filter(item => item.id !== 'usuarios' || account.is_admin).map(({ id, label, Icon }) => {
          const active = current === id || (id === 'vacas' && current === 'vacaProfile')
          return (
            <button key={id} onClick={() => onNav(id as Screen)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${active ? 'bg-[#2d5a27] text-white' : 'text-[#9aad8e] hover:bg-white/5 hover:text-white'}`}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-1 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#2d5a27] flex items-center justify-center text-white text-sm font-semibold">{account.email.slice(0,2).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{account.email}</div>
              <div className="text-[#6b7c5e] text-xs truncate">{account.is_admin ? 'Administrador' : 'Usuario'}</div>
            </div>
            <button onClick={onLogout} title="Cerrar sesión" className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <LogOut size={14} className="text-[#6b7c5e] hover:text-white" />
            </button>
          </div>
        )}
        {collapsed && (
          <button onClick={onLogout} title="Cerrar sesión" className="w-full flex items-center justify-center py-1.5 mb-1 text-[#6b7c5e] hover:text-white transition-colors rounded-lg hover:bg-white/5">
            <LogOut size={16} />
          </button>
        )}
        <button onClick={onToggle} className="w-full flex items-center justify-center py-1.5 text-[#6b7c5e] hover:text-white transition-colors rounded-lg hover:bg-white/5">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ title, syncStatus, onSync, pendingCount, onBell }: {
  title: string; syncStatus: SyncStatus; onSync: () => void; pendingCount: number; onBell: () => void
}) {
  return (
    <header className="h-14 bg-white border-b border-[#d4ddd0] flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-[#1a2318]">{title}</h1>
      <div className="flex items-center gap-4">
        <SyncIndicator status={syncStatus} onSync={onSync} />
        <button onClick={onBell} className="relative">
          <Bell size={18} className="text-[#6b7c5e] hover:text-[#2d5a27]" />
          {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">{pendingCount}</span>}
        </button>
      </div>
    </header>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, Icon }: {
  label: string; value: string | number; sub?: string; color: string; Icon: React.FC<{ size?: number; className?: string }>
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#d4ddd0] shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-[#1a2318]">{value}</div>
        <div className="text-sm font-medium text-[#1a2318]">{label}</div>
        {sub && <div className="text-xs text-[#6b7c5e] mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, setup }: { onLogin: (email: string, password: string, remember: boolean) => Promise<void>; setup: boolean }) {
  const [remember, setRemember] = useState(false)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !pwd) { setErr('Ingrese correo y contraseña.'); return }
    setBusy(true)
    setErr('')
    try { await onLogin(email, pwd, remember) }
    catch (error) { setErr(error instanceof Error ? error.message : 'No se pudo iniciar sesión.') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <img src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1600&h=900&fit=crop&auto=format" alt="Finca ganadera" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2318]/85 via-[#2d5a27]/70 to-[#1a2318]/80 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 mb-4">
            <Beef size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">BoviControl Pro</h1>
          <p className="text-white/60 text-sm mt-1">{setup ? 'Crea la cuenta de tu finca' : 'Gestión reproductiva bovina'}</p>
        </div>
        <form onSubmit={handle} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {err && <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-white text-sm">{err}</div>}
          <div className="mb-5">
            <label className="block text-white/80 text-sm font-medium mb-1.5">Correo electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/40" placeholder="usuario@finca.com" />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-white/80 text-sm font-medium mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="password" required minLength={setup ? 8 : undefined} autoComplete={setup ? 'new-password' : 'current-password'} value={pwd} onChange={e => setPwd(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/40" />
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <button type="button" onClick={() => setRemember(!remember)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${remember ? 'bg-[#2d5a27] border-[#2d5a27]' : 'border-white/40 bg-transparent'}`}>
                {remember && <Check size={10} className="text-white" />}
              </button>
              <span className="text-white/70 text-sm">Recordarme</span>
            </label>
            {setup && <span className="text-white/70 text-xs">Mínimo 8 caracteres</span>}
          </div>
          <button type="submit" disabled={busy} className="w-full bg-[#2d5a27] hover:bg-[#3a7232] text-white font-semibold py-2.5 rounded-xl text-sm shadow-lg shadow-[#2d5a27]/30 disabled:opacity-50">
            {busy ? 'Espera…' : setup ? 'Crear cuenta e ingresar' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="text-center text-white/40 text-xs mt-6">BoviControl Pro v3.2.1 — © 2026</p>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ vacas, toros, crias, reprod, partos, onNav }: {
  vacas: Vaca[]; toros: Toro[]; crias: Cria[]; reprod: Reproduccion[]; partos: Parto[]; onNav: (s: Screen) => void
}) {
  const pregnant = vacas.filter(v => v.estado === 'Preñada').length
  const enCelo = vacas.filter(v => v.estado === 'En celo').length
  const today = new Date()
  const year = today.getFullYear(), month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay()
  const monthTitle = today.toLocaleDateString('es-CO',{month:'long',year:'numeric'})
  const monthlyBirths = Array.from({length:12},(_,i)=>({mes:new Date(year,i,1).toLocaleDateString('es-CO',{month:'short'}),nacimientos:crias.filter(c=>c.fechaNacimiento.startsWith(`${year}-${String(i+1).padStart(2,'0')}`)).length}))

  const calEvents: Record<string, { tipo: string; texto: string }[]> = {}
  reprod.forEach(r => {
    if (r.fechaParto) {
      const k = r.fechaParto
      if (!calEvents[k]) calEvents[k] = []
      const vaca = vacas.find(v => v.id === r.vacaId)
      calEvents[k].push({ tipo: 'parto', texto: `Parto: ${vaca?.nombre ?? r.vacaId}` })
    }
  })
  vacas.filter(v => v.proximoParto).forEach(v => {
    const k = v.proximoParto
    if (!calEvents[k]) calEvents[k] = []
    calEvents[k].push({ tipo: 'parto', texto: `Parto: ${v.nombre}` })
  })

  const estadoData = [
    { name: 'Preñadas', value: pregnant, color: '#2d5a27' },
    { name: 'Vacías', value: vacas.filter(v => v.estado === 'Vacía').length, color: '#6b7c5e' },
    { name: 'Lactando', value: vacas.filter(v => v.estado === 'Lactando').length, color: '#1e6fa8' },
    { name: 'En celo', value: enCelo, color: '#e8862a' },
    { name: 'Secas', value: vacas.filter(v => v.estado === 'Seca').length, color: '#9ca3af' },
  ].filter(d => d.value > 0)

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <button onClick={() => onNav('vacas')} className="text-left">
          <StatCard label="Total vacas" value={vacas.length} sub="Activas en finca" color="bg-[#2d5a27]" Icon={Milk} />
        </button>
        <button onClick={() => onNav('vacas')} className="text-left">
          <StatCard label="Vacas preñadas" value={pregnant} sub={`${Math.round(pregnant / (vacas.length || 1) * 100)}% del hato`} color="bg-[#1e6fa8]" Icon={Heart} />
        </button>
        <button onClick={() => onNav('partos')} className="text-left">
          <StatCard label="Partos registrados" value={partos.length} sub="Total histórico" color="bg-emerald-500" Icon={Activity} />
        </button>
        <button onClick={() => onNav('crias')} className="text-left">
          <StatCard label="Crías registradas" value={crias.length} sub="En el sistema" color="bg-orange-500" Icon={Baby} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <button onClick={() => onNav('vacas')} className="text-left">
          <StatCard label="Listas para preñar" value={enCelo} sub="En celo actualmente" color="bg-violet-500" Icon={Heart} />
        </button>
        <button onClick={() => onNav('toros')} className="text-left">
          <StatCard label="Toros registrados" value={toros.length} sub={`${toros.filter(t => t.estado === 'Activo').length} activos`} color="bg-[#6b7c5e]" Icon={Beef} />
        </button>
        <button onClick={() => onNav('reproduccion')} className="text-left">
          <StatCard label="Registros reproductivos" value={reprod.length} sub="Total registrados" color="bg-teal-500" Icon={Heart} />
        </button>
        <button onClick={() => onNav('destetes')} className="text-left">
          <StatCard label="Próximos destetes" value={crias.filter(c => { const d = new Date(c.fechaDestete); const diff = (d.getTime() - today.getTime()) / 86400000; return diff >= 0 && diff <= 30 }).length} sub="En los próximos 30 días" color="bg-rose-500" Icon={TrendingUp} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1a2318] text-sm capitalize">{monthTitle}</h3>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {['D','L','M','X','J','V','S'].map(d => <div key={d} className="text-[10px] font-semibold text-[#6b7c5e] py-1">{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2, '0')}`
              const events = calEvents[dateKey]
              const isToday = day === today.getDate()
              return (
                <div key={day} className={`relative flex flex-col items-center py-1 rounded-lg ${isToday ? 'bg-[#2d5a27] text-white' : 'text-[#1a2318]'}`}>
                  <span className="text-xs">{day}</span>
                  {events && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isToday ? 'bg-white' : calEventColor(events[0].tipo)}`} />}
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[['bg-blue-500','Montas'],['bg-emerald-600','Partos'],['bg-orange-500','Destetes']].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1 text-[10px] text-[#6b7c5e]"><span className={`w-2 h-2 rounded-full ${c}`} />{l}</span>
            ))}
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2318] text-sm mb-4">Próximos partos</h3>
          <div className="space-y-3">
            {vacas.filter(v => v.proximoParto).sort((a, b) => a.proximoParto.localeCompare(b.proximoParto)).slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center gap-3 p-2.5 bg-[#f4f6f3] rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#1a2318]">{v.nombre}</div>
                  <div className="text-[10px] text-[#6b7c5e]">{v.id} · {v.raza}</div>
                </div>
                <div className="text-xs font-mono text-[#6b7c5e]">{fmtDate(v.proximoParto)}</div>
              </div>
            ))}
            {vacas.filter(v => v.proximoParto).length === 0 && <p className="text-xs text-[#6b7c5e] text-center py-4">Sin partos programados</p>}
          </div>
        </div>

        {/* Vacas en celo */}
        <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2318] text-sm mb-4">Vacas en celo / listas</h3>
          <div className="space-y-3">
            {vacas.filter(v => v.estado === 'En celo' || v.estado === 'Vacía').slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center gap-3 p-2.5 bg-[#f4f6f3] rounded-xl">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.estado === 'En celo' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#1a2318]">{v.nombre}</div>
                  <div className="text-[10px] text-[#6b7c5e]">{v.id} · {v.raza}</div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${estadoBadge(v.estado)}`}>{v.estado}</span>
              </div>
            ))}
            {vacas.filter(v => v.estado === 'En celo' || v.estado === 'Vacía').length === 0 && <p className="text-xs text-[#6b7c5e] text-center py-4">No hay vacas en celo</p>}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2318] text-sm mb-4">Nacimientos por mes — {year}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyBirths} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ede5" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7c5e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7c5e' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d4ddd0', fontSize: 12 }} />
              <Bar dataKey="nacimientos" fill="#2d5a27" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
          <h3 className="font-semibold text-[#1a2318] text-sm mb-4">Estado reproductivo del hato</h3>
          {estadoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={estadoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {estadoData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#6b7c5e' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d4ddd0', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[#6b7c5e] text-center py-10">Sin datos</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Vacas Screen ─────────────────────────────────────────────────────────────
function VacasScreen({ vacas, toros, onAdd, onEdit, onDelete, onProfile }: {
  vacas: Vaca[]; toros: Toro[]; onAdd: (v: Vaca) => void; onEdit: (v: Vaca) => void; onDelete: (id: string) => void; onProfile: (v: Vaca) => void
}) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'new' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Vaca | undefined>()
  const [confirm, setConfirm] = useState<string | null>(null)

  const filtered = vacas.filter(v => v.nombre.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 h-full overflow-y-auto">
      {modal && (
        <Modal title={modal === 'new' ? 'Registrar nueva vaca' : 'Editar vaca'} onClose={() => setModal(null)}>
          <VacaForm initial={editing} toros={toros} onSave={v => { modal === 'new' ? onAdd(v) : onEdit(v); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {confirm && <ConfirmDialog msg="¿Eliminar esta vaca? Esta acción no se puede deshacer." onConfirm={() => { onDelete(confirm); setConfirm(null) }} onCancel={() => setConfirm(null)} />}

      <div className="flex items-center justify-between mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c5e]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código..."
            className="w-72 bg-white border border-[#d4ddd0] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30 focus:border-[#2d5a27]" />
        </div>
        <button onClick={() => { setEditing(undefined); setModal('new') }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors shadow-sm">
          <Plus size={14} /> Nueva vaca
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d4ddd0] bg-[#f4f6f3]">
              {['Código','Nombre','Raza','Edad','Estado','Último parto','Próximo parto','Acciones'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#6b7c5e] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v, i) => (
              <tr key={v.id} className={`border-b border-[#d4ddd0]/60 hover:bg-[#f4f6f3] transition-colors ${i % 2 !== 0 ? 'bg-[#f4f6f3]/30' : ''}`}>
                <td className="px-4 py-3 text-xs font-mono font-semibold text-[#6b7c5e]">{v.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#1a2318]">{v.nombre}</td>
                <td className="px-4 py-3 text-sm text-[#6b7c5e]">{v.raza}</td>
                <td className="px-4 py-3 text-sm text-[#6b7c5e]">{calcEdad(v.fechaNacimiento)}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoBadge(v.estado)}`}>{v.estado}</span></td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(v.ultimoParto)}</td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(v.proximoParto)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => onProfile(v)} title="Ver perfil" className="p-1.5 hover:bg-[#e8ede5] rounded-lg text-[#2d5a27]"><Eye size={13} /></button>
                    <button onClick={() => { setEditing(v); setModal('edit') }} title="Editar" className="p-1.5 hover:bg-[#e8ede5] rounded-lg text-[#1e6fa8]"><Edit2 size={13} /></button>
                    <button onClick={() => setConfirm(v.id)} title="Eliminar" className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-sm text-[#6b7c5e]">No se encontraron vacas</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#d4ddd0]">
          <span className="text-xs text-[#6b7c5e]">Mostrando {filtered.length} de {vacas.length} registros</span>
        </div>
      </div>
    </div>
  )
}

// ─── Vaca Profile ─────────────────────────────────────────────────────────────
function VacaProfile({ vaca, reprod, partos, crias, toros, onBack, onEdit }: {
  vaca: Vaca; reprod: Reproduccion[]; partos: Parto[]; crias: Cria[]; toros: Toro[]; onBack: () => void; onEdit: (v: Vaca) => void
}) {
  const [editModal, setEditModal] = useState(false)
  const vacaReprod = reprod.filter(r => r.vacaId === vaca.id)
  const vacaPartos = partos.filter(p => p.vacaId === vaca.id)
  const vacaCrias = crias.filter(c => c.madre === vaca.id)

  const timeline = [
    ...vacaReprod.map(r => ({ fecha: r.fecha, tipo: r.tipo === 'Natural' ? 'monta' : 'inseminacion', desc: `${r.tipo} con ${toros.find(t => t.id === r.toroId)?.nombre ?? r.toroId}` })),
    ...vacaPartos.map(p => ({ fecha: p.fecha, tipo: 'parto', desc: `Parto ${p.tipo.toLowerCase()} — ${p.pesoNacimiento ? p.pesoNacimiento + ' kg' : ''}` })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha))

  const timelineColor = (tipo: string) => ({ monta: 'bg-blue-500', inseminacion: 'bg-cyan-500', parto: 'bg-emerald-600', destete: 'bg-orange-500', celo: 'bg-rose-500' }[tipo] || 'bg-gray-400')

  return (
    <div className="p-6 h-full overflow-y-auto">
      {editModal && (
        <Modal title="Editar vaca" onClose={() => setEditModal(false)}>
          <VacaForm initial={vaca} toros={toros} onSave={v => { onEdit(v); setEditModal(false) }} onClose={() => setEditModal(false)} />
        </Modal>
      )}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#6b7c5e] hover:text-[#2d5a27] mb-5 transition-colors">
        <ArrowLeft size={16} /> Volver a vacas
      </button>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-6">
            <div className="flex gap-5">
              <div className="w-28 h-28 rounded-2xl bg-[#e8ede5] flex items-center justify-center flex-shrink-0">
                <Milk size={40} className="text-[#6b7c5e]" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#1a2318]">{vaca.nombre}</h2>
                    <span className="text-sm font-mono text-[#6b7c5e]">{vaca.id}</span>
                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${estadoBadge(vaca.estado)}`}>{vaca.estado}</span>
                  </div>
                  <button onClick={() => setEditModal(true)} className="p-2 border border-[#d4ddd0] rounded-xl hover:bg-[#f4f6f3] transition-colors"><Edit2 size={15} className="text-[#6b7c5e]" /></button>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[['Raza', vaca.raza],['Edad', calcEdad(vaca.fechaNacimiento)],['Peso', vaca.peso ? vaca.peso + ' kg' : '—'],['Nacimiento', fmtDate(vaca.fechaNacimiento)],['Partos', vaca.partos],['Padre', vaca.padre || '—'],['Madre', vaca.madre || '—'],['Crías reg.', vacaCrias.length]].map(([k, v2]) => (
                    <div key={String(k)}><div className="text-xs text-[#6b7c5e] font-medium">{k}</div><div className="text-sm text-[#1a2318] font-medium mt-0.5">{String(v2)}</div></div>
                  ))}
                </div>
              </div>
            </div>
            {vaca.observaciones && (
              <div className="mt-4 pt-4 border-t border-[#d4ddd0]">
                <div className="text-xs text-[#6b7c5e] font-medium mb-1">Observaciones</div>
                <p className="text-sm text-[#1a2318] leading-relaxed">{vaca.observaciones}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-6">
            <h3 className="font-semibold text-[#1a2318] text-sm mb-5">Historial reproductivo</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-[#6b7c5e] text-center py-6">Sin registros reproductivos</p>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-[#d4ddd0]" />
                {timeline.map((ev, i) => (
                  <div key={i} className="relative mb-5 last:mb-0">
                    <div className={`absolute -left-4 top-1 w-4 h-4 rounded-full border-2 border-white ${timelineColor(ev.tipo)}`} />
                    <div className="text-xs font-mono text-[#6b7c5e] mb-0.5">{fmtDate(ev.fecha)}</div>
                    <div className="text-sm font-medium text-[#1a2318] capitalize">{ev.tipo.replace('inseminacion','Inseminación')}</div>
                    <div className="text-xs text-[#6b7c5e] mt-0.5">{ev.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {vaca.proximoParto && (
            <div className="bg-[#2d5a27] rounded-xl p-5 text-white">
              <div className="text-xs text-white/70 font-medium mb-1">Próximo parto estimado</div>
              <div className="text-lg font-bold">{fmtDate(vaca.proximoParto)}</div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
            <h4 className="text-xs font-semibold text-[#1a2318] mb-3">Registros reproductivos</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-[#6b7c5e]">Montas/IA</span><span className="font-semibold text-[#1a2318]">{vacaReprod.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#6b7c5e]">Partos</span><span className="font-semibold text-[#1a2318]">{vacaPartos.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#6b7c5e]">Crías</span><span className="font-semibold text-[#1a2318]">{vacaCrias.length}</span></div>
            </div>
          </div>
          {vacaCrias.length > 0 && (
            <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
              <h4 className="text-xs font-semibold text-[#1a2318] mb-3">Crías registradas</h4>
              {vacaCrias.map(c => (
                <div key={c.id} className="flex items-center gap-2 mb-2 last:mb-0">
                  <Baby size={12} className="text-[#6b7c5e]" />
                  <div>
                    <div className="text-xs font-medium text-[#1a2318]">{c.nombre} ({c.sexo})</div>
                    <div className="text-[10px] text-[#6b7c5e]">{fmtDate(c.fechaNacimiento)} · {c.peso} kg</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Toros Screen ─────────────────────────────────────────────────────────────
function TorosScreen({ toros, crias, onAdd, onEdit, onDelete }: {
  toros: Toro[]; crias: Cria[]; onAdd: (t: Toro) => void; onEdit: (t: Toro) => void; onDelete: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'new' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Toro | undefined>()
  const [confirm, setConfirm] = useState<string | null>(null)
  const filtered = toros.filter(t => t.nombre.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 h-full overflow-y-auto">
      {modal && (
        <Modal title={modal === 'new' ? 'Registrar nuevo toro' : 'Editar toro'} onClose={() => setModal(null)}>
          <ToroForm initial={editing} onSave={t => { modal === 'new' ? onAdd(t) : onEdit(t); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {confirm && <ConfirmDialog msg="¿Eliminar este toro?" onConfirm={() => { onDelete(confirm); setConfirm(null) }} onCancel={() => setConfirm(null)} />}

      <div className="flex items-center justify-between mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c5e]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar toro..."
            className="w-64 bg-white border border-[#d4ddd0] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30" />
        </div>
        <button onClick={() => { setEditing(undefined); setModal('new') }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">
          <Plus size={14} /> Nuevo toro
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d4ddd0] bg-[#f4f6f3]">
              {['Código','Nombre','Raza','Edad','Peso','Crías','Estado','Observaciones','Acciones'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#6b7c5e] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} className={`border-b border-[#d4ddd0]/60 hover:bg-[#f4f6f3] transition-colors ${i % 2 !== 0 ? 'bg-[#f4f6f3]/30' : ''}`}>
                <td className="px-4 py-3 text-xs font-mono font-semibold text-[#6b7c5e]">{t.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#1a2318]">{t.nombre}</td>
                <td className="px-4 py-3 text-sm text-[#6b7c5e]">{t.raza}</td>
                <td className="px-4 py-3 text-sm text-[#6b7c5e]">{calcEdad(t.fechaNacimiento)}</td>
                <td className="px-4 py-3 text-sm text-[#6b7c5e]">{t.peso ? t.peso + ' kg' : '—'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#1a2318]">{crias.filter(c => c.padre === t.id).length}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoBadge(t.estado)}`}>{t.estado}</span></td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e] max-w-32 truncate">{t.observaciones || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(t); setModal('edit') }} title="Editar" className="p-1.5 hover:bg-[#e8ede5] rounded-lg text-[#1e6fa8]"><Edit2 size={13} /></button>
                    <button onClick={() => setConfirm(t.id)} title="Eliminar" className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-sm text-[#6b7c5e]">No se encontraron toros</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#d4ddd0]">
          <span className="text-xs text-[#6b7c5e]">Mostrando {filtered.length} de {toros.length} registros</span>
        </div>
      </div>
    </div>
  )
}

// ─── Crías Screen ─────────────────────────────────────────────────────────────
function CriasScreen({ crias, vacas, toros, onAdd, onEdit, onDelete }: {
  crias: Cria[]; vacas: Vaca[]; toros: Toro[]; onAdd: (c: Cria) => void; onEdit: (c: Cria) => void; onDelete: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'new' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Cria | undefined>()
  const [confirm, setConfirm] = useState<string | null>(null)
  const filtered = crias.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  const vacaName = (id: string) => vacas.find(v => v.id === id)?.nombre ?? id
  const toroName = (id: string) => toros.find(t => t.id === id)?.nombre ?? id

  return (
    <div className="p-6 h-full overflow-y-auto">
      {modal && (
        <Modal title={modal === 'new' ? 'Registrar nueva cría' : 'Editar cría'} onClose={() => setModal(null)}>
          <CriaForm initial={editing} vacas={vacas} toros={toros} onSave={c => { modal === 'new' ? onAdd(c) : onEdit(c); setModal(null) }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {confirm && <ConfirmDialog msg="¿Eliminar esta cría?" onConfirm={() => { onDelete(confirm); setConfirm(null) }} onCancel={() => setConfirm(null)} />}

      <div className="flex items-center justify-between mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c5e]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cría..."
            className="w-64 bg-white border border-[#d4ddd0] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30" />
        </div>
        <button onClick={() => { setEditing(undefined); setModal('new') }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">
          <Plus size={14} /> Registrar cría
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-[#e8ede5] flex items-center justify-center flex-shrink-0">
                <Baby size={24} className="text-[#6b7c5e]" />
              </div>
              <div>
                <div className="font-semibold text-[#1a2318]">{c.nombre}</div>
                <div className="text-xs font-mono text-[#6b7c5e]">{c.id}</div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${estadoBadge(c.estado)}`}>{c.estado}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[['Sexo', c.sexo],['Nacimiento', fmtDate(c.fechaNacimiento)],['Peso', c.peso ? c.peso + ' kg' : '—'],['Destete est.', fmtDate(c.fechaDestete)],['Madre', vacaName(c.madre)],['Padre', toroName(c.padre)]].map(([k, v]) => (
                <div key={String(k)}><div className="text-[#6b7c5e] font-medium">{k}</div><div className="text-[#1a2318] font-medium mt-0.5 truncate">{String(v)}</div></div>
              ))}
            </div>
            {c.observaciones && <p className="text-xs text-[#6b7c5e] mt-3 pt-3 border-t border-[#d4ddd0]">{c.observaciones}</p>}
            <div className="flex gap-2 mt-4 pt-4 border-t border-[#d4ddd0]">
              <button onClick={() => { setEditing(c); setModal('edit') }} className="flex-1 py-1.5 text-xs border border-[#d4ddd0] rounded-lg hover:bg-[#f4f6f3] text-[#6b7c5e] flex items-center justify-center gap-1 transition-colors">
                <Edit2 size={11} /> Editar
              </button>
              <button onClick={() => setConfirm(c.id)} className="py-1.5 px-3 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-sm text-[#6b7c5e]">No se encontraron crías registradas</div>
        )}
      </div>
    </div>
  )
}

// ─── Reproduccion Screen ──────────────────────────────────────────────────────
function ReproduccionScreen({ reprod, partos, vacas, toros, onAdd, onDelete }: {
  reprod: Reproduccion[]; partos: Parto[]; vacas: Vaca[]; toros: Toro[]; onAdd: (r: Reproduccion) => void; onDelete: (id: string) => void
}) {
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState<string | null>(null)
  const vacaName = (id: string) => { const v = vacas.find(x => x.id === id); return v ? `${v.nombre} (${v.id})` : id }
  const toroName = (id: string) => { const t = toros.find(x => x.id === id); return t ? `${t.nombre} (${t.id})` : id }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {modal && (
        <Modal title="Nuevo registro de reproducción" onClose={() => setModal(false)}>
          <ReproduccionForm vacas={vacas} toros={toros} reprod={reprod} partos={partos} onSave={r => { onAdd(r); setModal(false) }} onClose={() => setModal(false)} />
        </Modal>
      )}
      {confirm && <ConfirmDialog msg="¿Eliminar este registro?" onConfirm={() => { onDelete(confirm); setConfirm(null) }} onCancel={() => setConfirm(null)} />}

      <div className="flex justify-end mb-5">
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">
          <Plus size={14} /> Nuevo registro
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d4ddd0] bg-[#f4f6f3]">
              {['ID','Vaca','Toro','Fecha','Tipo','Parto est.','Destete est.','Reinicio est.','Obs.',''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#6b7c5e] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reprod.map((r, i) => (
              <tr key={r.id} className={`border-b border-[#d4ddd0]/60 hover:bg-[#f4f6f3] transition-colors ${i % 2 !== 0 ? 'bg-[#f4f6f3]/30' : ''}`}>
                <td className="px-4 py-3 text-xs font-mono text-[#6b7c5e]">{r.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#1a2318]">{vacaName(r.vacaId)}</td>
                <td className="px-4 py-3 text-sm text-[#6b7c5e]">{toroName(r.toroId)}</td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(r.fecha)}</td>
                <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{r.tipo}</span></td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(r.fechaParto)}</td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(r.fechaDestete)}</td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(r.fechaReinicio)}</td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e] max-w-28 truncate">{r.observaciones || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setConfirm(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {reprod.length === 0 && <tr><td colSpan={10} className="text-center py-10 text-sm text-[#6b7c5e]">No hay registros de reproducción</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#d4ddd0]">
          <span className="text-xs text-[#6b7c5e]">{reprod.length} registros en total</span>
        </div>
      </div>
    </div>
  )
}

// ─── Partos Screen ────────────────────────────────────────────────────────────
function PartosScreen({ partos, vacas, crias, onAdd, onDelete }: {
  partos: Parto[]; vacas: Vaca[]; crias: Cria[]; onAdd: (p: Parto) => void; onDelete: (id: string) => void
}) {
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState<string | null>(null)
  const vacaName = (id: string) => { const v = vacas.find(x => x.id === id); return v ? `${v.nombre} (${v.id})` : id }
  const criaName = (id: string) => { const c = crias.find(x => x.id === id); return c ? `${c.nombre} (${c.id})` : id || '—' }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {modal && (
        <Modal title="Registrar parto" onClose={() => setModal(false)}>
          <PartoForm vacas={vacas} crias={crias} onSave={p => { onAdd(p); setModal(false) }} onClose={() => setModal(false)} />
        </Modal>
      )}
      {confirm && <ConfirmDialog msg="¿Eliminar este registro de parto?" onConfirm={() => { onDelete(confirm); setConfirm(null) }} onCancel={() => setConfirm(null)} />}

      <div className="flex justify-end mb-5">
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white rounded-xl text-sm font-medium hover:bg-[#3a7232] transition-colors">
          <Plus size={14} /> Registrar parto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d4ddd0] bg-[#f4f6f3]">
              {['ID','Vaca madre','Cría','Fecha','Tipo','Peso nac.','Observaciones',''].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#6b7c5e] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partos.map((p, i) => (
              <tr key={p.id} className={`border-b border-[#d4ddd0]/60 hover:bg-[#f4f6f3] transition-colors ${i % 2 !== 0 ? 'bg-[#f4f6f3]/30' : ''}`}>
                <td className="px-4 py-3 text-xs font-mono text-[#6b7c5e]">{p.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-[#1a2318]">{vacaName(p.vacaId)}</td>
                <td className="px-4 py-3 text-sm text-[#6b7c5e]">{criaName(p.criaId)}</td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(p.fecha)}</td>
                <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.tipo === 'Normal' ? 'bg-emerald-100 text-emerald-800' : p.tipo === 'Distócico' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{p.tipo}</span></td>
                <td className="px-4 py-3 text-sm text-[#6b7c5e]">{p.pesoNacimiento ? p.pesoNacimiento + ' kg' : '—'}</td>
                <td className="px-4 py-3 text-xs text-[#6b7c5e] max-w-40 truncate">{p.observaciones || '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setConfirm(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {partos.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-sm text-[#6b7c5e]">No hay partos registrados</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#d4ddd0]">
          <span className="text-xs text-[#6b7c5e]">{partos.length} partos registrados</span>
        </div>
      </div>
    </div>
  )
}

// ─── Destetes Screen ──────────────────────────────────────────────────────────
function DesteteScreen({ crias, vacas, toros, onEdit }: { crias: Cria[]; vacas: Vaca[]; toros: Toro[]; onEdit: (c: Cria) => void }) {
  const today = new Date()
  const sorted = [...crias].sort((a, b) => a.fechaDestete.localeCompare(b.fechaDestete))
  const vacaName = (id: string) => vacas.find(v => v.id === id)?.nombre ?? id
  const toroName = (id: string) => toros.find(t => t.id === id)?.nombre ?? id

  const daysUntil = (dateStr: string) => {
    if (!dateStr) return null
    const d = new Date(dateStr + 'T12:00:00')
    return Math.round((d.getTime() - today.getTime()) / 86400000)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d4ddd0] bg-[#f4f6f3]">
              {['Código','Nombre','Sexo','Madre','Padre','Nacimiento','Destete est.','Días restantes','Estado'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-[#6b7c5e] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => {
              const days = daysUntil(c.fechaDestete)
              return (
                <tr key={c.id} className={`border-b border-[#d4ddd0]/60 hover:bg-[#f4f6f3] transition-colors ${i % 2 !== 0 ? 'bg-[#f4f6f3]/30' : ''}`}>
                  <td className="px-4 py-3 text-xs font-mono text-[#6b7c5e]">{c.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#1a2318]">{c.nombre}</td>
                  <td className="px-4 py-3 text-sm text-[#6b7c5e]">{c.sexo}</td>
                  <td className="px-4 py-3 text-sm text-[#6b7c5e]">{vacaName(c.madre)}</td>
                  <td className="px-4 py-3 text-sm text-[#6b7c5e]">{toroName(c.padre)}</td>
                  <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(c.fechaNacimiento)}</td>
                  <td className="px-4 py-3 text-xs text-[#6b7c5e]">{fmtDate(c.fechaDestete)}</td>
                  <td className="px-4 py-3">
                    {days !== null && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${days < 0 ? 'bg-gray-100 text-gray-500' : days <= 7 ? 'bg-red-100 text-red-700' : days <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                        {days < 0 ? 'Destete pasado' : days === 0 ? 'Hoy' : `${days} días`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoBadge(c.estado)}`}>{c.estado}</span></td>
                </tr>
              )
            })}
            {sorted.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-sm text-[#6b7c5e]">No hay crías registradas</td></tr>}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-[#d4ddd0]">
          <span className="text-xs text-[#6b7c5e]">{crias.filter(c => { const d = daysUntil(c.fechaDestete); return d !== null && d >= 0 && d <= 30 }).length} destetes en los próximos 30 días</span>
        </div>
      </div>
    </div>
  )
}

// ─── Calendario Screen ────────────────────────────────────────────────────────
function CalendarioScreen({ vacas, reprod, crias }: { vacas: Vaca[]; reprod: Reproduccion[]; crias: Cria[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const today = new Date()
  const shown = new Date(today.getFullYear(), today.getMonth()+offset, 1)
  const year = shown.getFullYear(), month = shown.getMonth()
  const daysInMonth = new Date(year,month+1,0).getDate(); const firstDay = shown.getDay()

  const calEvents: Record<string, { tipo: string; texto: string }[]> = {}
  const addEvent = (date: string, tipo: string, texto: string) => {
    if (!date) return
    const k = date
    if (!calEvents[k]) calEvents[k] = []
    calEvents[k].push({ tipo, texto })
  }
  vacas.filter(v => v.proximoParto).forEach(v => addEvent(v.proximoParto, 'parto', `Parto: ${v.nombre}`))
  reprod.forEach(r => { addEvent(r.fecha, 'monta', `Monta: ${vacas.find(v => v.id === r.vacaId)?.nombre ?? r.vacaId}`) })
  crias.forEach(c => { if (c.fechaDestete) addEvent(c.fechaDestete, 'destete', `Destete: ${c.nombre}`) })

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#1a2318] capitalize">{shown.toLocaleDateString('es-CO',{month:'long',year:'numeric'})}</h2>
            <div className="flex gap-2">
              <button onClick={()=>setOffset(offset-1)} aria-label="Mes anterior" className="p-2 border border-[#d4ddd0] rounded-xl hover:bg-[#f4f6f3]"><ChevronLeft size={14} /></button>
              <button onClick={()=>setOffset(offset+1)} aria-label="Mes siguiente" className="p-2 border border-[#d4ddd0] rounded-xl hover:bg-[#f4f6f3]"><ChevronRight size={14} /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            {[['bg-blue-500','Montas'],['bg-emerald-600','Partos'],['bg-orange-500','Destetes'],['bg-red-500','Alertas']].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1.5 text-xs text-[#6b7c5e]"><span className={`w-2.5 h-2.5 rounded-full ${c}`} />{l}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-t border-[#d4ddd0]">
            {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
              <div key={d} className="border-r border-b border-[#d4ddd0] py-2 text-center text-xs font-semibold text-[#6b7c5e] bg-[#f4f6f3]">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="border-r border-b border-[#d4ddd0] h-20 bg-[#f4f6f3]/50" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2, '0')}`
              const events = calEvents[dateKey]
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear(); const isSel = selected === dateKey
              return (
                <div key={day} onClick={() => setSelected(isSel ? null : dateKey)}
                  className={`border-r border-b border-[#d4ddd0] h-20 p-1.5 cursor-pointer transition-colors ${isToday ? 'bg-[#2d5a27]/5' : 'hover:bg-[#f4f6f3]'} ${isSel ? 'bg-[#2d5a27]/10' : ''}`}>
                  <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#2d5a27] text-white' : 'text-[#1a2318]'}`}>{day}</div>
                  <div className="mt-1 space-y-0.5">
                    {events?.slice(0, 2).map((ev, ei) => (
                      <div key={ei} className={`text-[9px] px-1 py-0.5 rounded text-white truncate ${calEventColor(ev.tipo)}`}>{ev.texto}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="space-y-4">
          {selected && calEvents[selected] ? (
            <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1a2318] text-sm">{selected}</h3>
                <button onClick={() => setSelected(null)}><X size={14} className="text-[#6b7c5e]" /></button>
              </div>
              {calEvents[selected].map((ev, i) => (
                <div key={i} className={`p-3 rounded-xl mb-2 text-sm text-[#1a2318] border ${calEventColor(ev.tipo)} bg-opacity-10 border-opacity-20`}>{ev.texto}</div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5 text-sm text-[#6b7c5e] text-center">Selecciona una fecha</div>
          )}
          <div className="bg-white rounded-xl border border-[#d4ddd0] shadow-sm p-5">
            <h3 className="font-semibold text-[#1a2318] text-sm mb-4">Próximos eventos</h3>
            <div className="space-y-3">
              {[...vacas.filter(v => v.proximoParto).map(v => ({ fecha: v.proximoParto, desc: `Parto: ${v.nombre}`, tipo: 'parto' })),
                ...reprod.map(r => ({ fecha: r.fecha, desc: `Monta: ${vacas.find(v => v.id === r.vacaId)?.nombre ?? r.vacaId}`, tipo: 'monta' })),
                ...crias.filter(c => c.fechaDestete).map(c => ({ fecha: c.fechaDestete, desc: `Destete: ${c.nombre}`, tipo: 'destete' }))
              ].sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 7).map(({ fecha, desc, tipo }) => (
                <div key={fecha + desc} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${calEventColor(tipo)}`} />
                  <div className="flex-1 text-xs text-[#1a2318] font-medium truncate">{desc}</div>
                  <div className="text-xs font-mono text-[#6b7c5e]">{fmtDate(fecha)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Notificaciones Screen ────────────────────────────────────────────────────
function NotificacionesScreen({ vacas, crias }: { vacas: Vaca[]; crias: Cria[] }) {
  const today = new Date()
  const daysUntil = (d: string) => !d ? null : Math.round((new Date(d + 'T12:00:00').getTime() - today.getTime()) / 86400000)

  type Notif = { id: string; texto: string; urgencia: 'alta' | 'media' | 'baja'; realizada: boolean }
  const initial: Notif[] = [
    ...vacas.filter(v => v.proximoParto).map(v => {
      const d = daysUntil(v.proximoParto)!
      return { id: `parto-${v.id}`, texto: `La vaca ${v.id} ${v.nombre} ${d <= 0 ? 'debería haber parido' : `dará a luz en ${d} días`}`, urgencia: (d <= 7 ? 'alta' : d <= 15 ? 'media' : 'baja') as Notif['urgencia'], realizada: false }
    }),
    ...vacas.filter(v => v.estado === 'En celo').map(v => ({ id: `celo-${v.id}`, texto: `La vaca ${v.id} ${v.nombre} está en celo — apta para reproducción`, urgencia: 'media' as const, realizada: false })),
    ...crias.filter(c => { const d = daysUntil(c.fechaDestete); return d !== null && d >= 0 && d <= 14 }).map(c => ({ id: `destete-${c.id}`, texto: `La cría ${c.id} ${c.nombre} debe destetarse ${daysUntil(c.fechaDestete) === 0 ? 'hoy' : `en ${daysUntil(c.fechaDestete)} días`}`, urgencia: 'media' as const, realizada: false })),
  ]

  const [items, setItems] = useState<Notif[]>(initial)
  const toggle = (id: string) => setItems(p => p.map(n => n.id === id ? { ...n, realizada: !n.realizada } : n))

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-2xl space-y-3">
        <div className="flex gap-2 mb-5">
          <span className="px-3 py-1.5 text-xs bg-[#2d5a27] text-white rounded-xl">{items.filter(n => !n.realizada).length} pendientes</span>
          <span className="px-3 py-1.5 text-xs bg-[#f4f6f3] text-[#6b7c5e] rounded-xl border border-[#d4ddd0]">{items.filter(n => n.realizada).length} realizadas</span>
        </div>
        {items.length === 0 && <div className="text-center py-16 text-sm text-[#6b7c5e]">No hay notificaciones activas</div>}
        {items.map(n => (
          <div key={n.id} className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 transition-all ${n.realizada ? 'opacity-50 border-[#d4ddd0]' : n.urgencia === 'alta' ? 'border-red-200' : n.urgencia === 'media' ? 'border-amber-200' : 'border-[#d4ddd0]'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.realizada ? 'bg-[#f4f6f3]' : n.urgencia === 'alta' ? 'bg-red-50' : 'bg-amber-50'}`}>
              <Bell size={18} className={n.realizada ? 'text-[#6b7c5e]' : n.urgencia === 'alta' ? 'text-red-500' : 'text-amber-500'} />
            </div>
            <div className="flex-1">
              <p className={`text-sm leading-relaxed ${n.realizada ? 'line-through text-[#6b7c5e]' : 'text-[#1a2318]'}`}>{n.texto}</p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full mt-1.5 inline-block ${n.urgencia === 'alta' ? 'bg-red-100 text-red-700' : n.urgencia === 'media' ? 'bg-amber-100 text-amber-700' : 'bg-[#f4f6f3] text-[#6b7c5e]'}`}>
                {n.urgencia === 'alta' ? 'Urgente' : n.urgencia === 'media' ? 'Importante' : 'Normal'}
              </span>
            </div>
            <button onClick={() => toggle(n.id)} className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${n.realizada ? 'bg-[#2d5a27] border-[#2d5a27]' : 'border-[#d4ddd0] hover:border-[#2d5a27]'}`}>
              <Check size={14} className={n.realizada ? 'text-white' : 'text-[#d4ddd0]'} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsuariosScreen({ csrf, me }: { csrf: string; me: Account }) {
  const [users, setUsers] = useState<Account[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const refresh = async () => {
    const response = await fetch('/api/users')
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'No se pudieron cargar los usuarios.')
    setUsers(data.users)
  }
  useEffect(() => { refresh().catch(e => setMessage(e.message)) }, [])
  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({email,password})})
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo crear el usuario.')
      setEmail(''); setPassword(''); setMessage('Usuario creado. Comparte sus credenciales por un medio seguro.'); await refresh()
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Error al crear usuario.') }
    finally { setBusy(false) }
  }
  const change = async (user: Account, action: 'active' | 'password') => {
    const value = action === 'password' ? prompt(`Nueva contraseña para ${user.email} (mínimo 8 caracteres):`) : !user.active
    if (value === null) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`/api/users/${user.id}`,{method:'PATCH',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({[action]:value})})
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo actualizar el usuario.')
      setMessage('Usuario actualizado.'); await refresh()
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Error al actualizar usuario.') }
    finally { setBusy(false) }
  }
  return <div className="p-6 h-full overflow-y-auto space-y-6">
    <div><h2 className="text-xl font-semibold text-[#1a2318]">Administración de usuarios</h2><p className="text-sm text-[#6b7c5e] mt-1">Crea cuentas para las personas que usan la finca y administra su acceso.</p></div>
    <form onSubmit={create} className="bg-white rounded-xl border border-[#d4ddd0] p-5 max-w-2xl">
      <h3 className="font-semibold mb-4">Nuevo usuario</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Correo electrónico"><input className={inp} type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="off" /></Field>
        <Field label="Contraseña inicial"><input className={inp} type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" /></Field>
      </div>
      <button disabled={busy} className="mt-5 px-5 py-2.5 bg-[#2d5a27] text-white rounded-xl text-sm disabled:opacity-50">Crear usuario</button>
    </form>
    {message && <p role="status" className="text-sm text-[#2d5a27]">{message}</p>}
    <div className="bg-white rounded-xl border border-[#d4ddd0] overflow-x-auto">
      <table className="w-full text-sm text-left"><thead className="bg-[#f4f6f3] text-[#6b7c5e]"><tr><th className="p-4">Correo</th><th className="p-4">Perfil</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr></thead>
      <tbody>{users.map(u=><tr key={u.id} className="border-t border-[#d4ddd0]"><td className="p-4">{u.email}</td><td className="p-4">{u.is_admin ? 'Administrador' : 'Usuario'}</td><td className="p-4">{u.active ? 'Activo' : 'Inactivo'}</td><td className="p-4 flex gap-3"><button disabled={busy} onClick={()=>change(u,'password')} className="text-[#2d5a27]">Cambiar clave</button>{u.id !== me.id && <button disabled={busy} onClick={()=>change(u,'active')} className="text-[#2d5a27]">{u.active ? 'Desactivar' : 'Activar'}</button>}</td></tr>)}</tbody></table>
    </div>
  </div>
}

// ─── App ──────────────────────────────────────────────────────────────────────
const screenTitles: Record<Screen, string> = {
  login: '', dashboard: 'Dashboard', vacas: 'Gestión de Vacas', vacaProfile: 'Perfil de Vaca',
  toros: 'Gestión de Toros', crias: 'Gestión de Crías', reproduccion: 'Registro de Reproducción',
  partos: 'Registro de Partos', destetes: 'Control de Destetes',
  calendario: 'Calendario', notificaciones: 'Centro de Notificaciones', usuarios: 'Administración de Usuarios',
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [collapsed, setCollapsed] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online')
  const [selectedVaca, setSelectedVaca] = useState<Vaca | null>(null)

  // Global state
  const [vacas, setVacas] = useState<Vaca[]>([])
  const [toros, setToros] = useState<Toro[]>([])
  const [crias, setCrias] = useState<Cria[]>([])
  const [reprod, setReprod] = useState<Reproduccion[]>([])
  const [partos, setPartos] = useState<Parto[]>([])
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [booting, setBooting] = useState(true)
  const [cloudPending, setCloudPending] = useState(false)
  const [saveError, setSaveError] = useState('')
  const csrf = useRef('')
  const queue = useRef(Promise.resolve())

  const loadState = async () => {
    const response = await fetch('/api/state')
    if (!response.ok) throw new Error('No se pudo cargar la base de datos.')
    const {state,csrf:token} = await response.json()
    csrf.current = token
    setVacas(state.vacas); setToros(state.toros); setCrias(state.crias); setReprod(state.reprod); setPartos(state.partos)
    setReady(true); setAuthenticated(true); setScreen('dashboard')
  }
  useEffect(() => {
    fetch('/api/session').then(r => r.json()).then(async result => {
      csrf.current = result.csrf
      setNeedsSetup(result.setup)
      setCloudPending(result.initializing)
      setAccount(result.user)
      if (result.authenticated) await loadState()
    }).catch(e => setSaveError(e.message)).finally(() => setBooting(false))
  }, [])
  const handleLogin = async (email: string, password: string, remember: boolean) => {
    const response = await fetch(needsSetup ? '/api/setup' : '/api/login', {
      method:'POST', headers:{'Content-Type':'application/json','X-CSRF-Token':csrf.current},
      body:JSON.stringify({email,password,remember})
    })
    const result = response.headers.get('content-type')?.includes('application/json')
      ? await response.json() : {error:'El servidor no pudo procesar el registro. Reinícialo y vuelve a intentar.'}
    if (!response.ok) throw new Error(result.error || 'No se pudo iniciar sesión.')
    csrf.current = result.csrf
    setNeedsSetup(false)
    setAccount(result.user)
    await loadState()
  }
  useEffect(() => {
    if (!ready || !authenticated) return
    const payload = JSON.stringify({vacas,toros,crias,reprod,partos})
    queue.current = queue.current.catch(() => {}).then(async () => {
      const response = await fetch('/api/state', {method:'PUT',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf.current},body:payload})
      if (response.status === 401) { setAuthenticated(false); setScreen('login'); throw new Error('La sesión terminó') }
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'No se pudieron guardar los cambios')
      }
      setSaveError('')
    }).catch(e => setSaveError(e.message))
  }, [ready,authenticated,vacas,toros,crias,reprod,partos])

  // CRUD helpers
  const addVaca = (v: Vaca) => setVacas(p => [...p, { ...v, id: nextId(p, 'V') }])
  const editVaca = (v: Vaca) => setVacas(p => p.map(x => x.id === v.id ? v : x))
  const delVaca = (id: string) => setVacas(p => p.filter(x => x.id !== id))

  const addToro = (t: Toro) => setToros(p => [...p, { ...t, id: nextId(p, 'T') }])
  const editToro = (t: Toro) => setToros(p => p.map(x => x.id === t.id ? t : x))
  const delToro = (id: string) => setToros(p => p.filter(x => x.id !== id))

  const addCria = (c: Cria) => setCrias(p => [...p, { ...c, id: nextId(p, 'C') }])
  const editCria = (c: Cria) => setCrias(p => p.map(x => x.id === c.id ? c : x))
  const delCria = (id: string) => setCrias(p => p.filter(x => x.id !== id))

  const addReprod = (r: Reproduccion) => {
    setReprod(p => [...p, { ...r, id: nextId(p, 'R') }])
    setVacas(p => p.map(v => v.id === r.vacaId ? { ...v, estado: 'Preñada', proximoParto: r.fechaParto } : v))
  }
  const delReprod = (id: string) => {
    const removed = reprod.find(r => r.id === id)
    const remaining = reprod.filter(r => r.id !== id)
    setReprod(remaining)
    if (removed && !hasPendingReproduction(removed.vacaId, remaining, partos)) {
      setVacas(p => p.map(v => v.id === removed.vacaId && v.proximoParto === removed.fechaParto
        ? { ...v, estado: 'Vacía', proximoParto: '' } : v))
    }
  }

  const addParto = (p: Parto) => {
    setPartos(prev => [...prev, { ...p, id: nextId(prev, 'P') }])
    setVacas(prev => prev.map(v => v.id === p.vacaId ? {
      ...v, estado: 'Lactando', ultimoParto: p.fecha, proximoParto: '', partos: v.partos + 1,
    } : v))
  }
  const delParto = (id: string) => setPartos(p => p.filter(x => x.id !== id))

  const handleSync = () => {
    setSyncStatus('syncing')
    setTimeout(() => setSyncStatus('online'), 2500)
  }
  const handleLogout = async () => {
    await queue.current
    await fetch('/api/logout',{method:'POST',headers:{'X-CSRF-Token':csrf.current}})
    setAuthenticated(false); setReady(false); setAccount(null); setScreen('login')
    const result = await fetch('/api/session').then(r=>r.json())
    csrf.current = result.csrf
  }

  if (booting) return <div className="min-h-screen grid place-items-center text-[#2d5a27]">Cargando BoviControl…</div>
  if (cloudPending) return <div className="min-h-screen grid place-items-center bg-[#f4f6f3] p-6"><div className="bg-white border border-[#d4ddd0] rounded-2xl p-8 max-w-md text-center"><h1 className="text-xl font-bold text-[#2d5a27]">BoviControl se está preparando</h1><p className="text-sm text-[#6b7c5e] mt-3">Las cuentas y los registros aún se están migrando. Vuelve a cargar la página en unos minutos.</p></div></div>
  if (!authenticated) return <LoginScreen onLogin={handleLogin} setup={needsSetup} />
  if (!ready) return <div className="min-h-screen grid place-items-center text-[#2d5a27]">{saveError || 'Cargando datos…'}</div>

  const pendingNotifs = [
    ...vacas.filter(v => v.proximoParto && Math.round((new Date(v.proximoParto + 'T12:00:00').getTime() - new Date().getTime()) / 86400000) <= 15),
    ...vacas.filter(v => v.estado === 'En celo'),
    ...crias.filter(c => { const d = c.fechaDestete ? Math.round((new Date(c.fechaDestete + 'T12:00:00').getTime() - new Date().getTime()) / 86400000) : null; return d !== null && d >= 0 && d <= 14 }),
  ].length

  const renderContent = () => {
    switch (screen) {
      case 'dashboard': return <Dashboard vacas={vacas} toros={toros} crias={crias} reprod={reprod} partos={partos} onNav={setScreen} />
      case 'vacas': return <VacasScreen vacas={vacas} toros={toros} onAdd={addVaca} onEdit={editVaca} onDelete={delVaca} onProfile={v => { setSelectedVaca(v); setScreen('vacaProfile') }} />
      case 'vacaProfile': return selectedVaca ? <VacaProfile vaca={vacas.find(v => v.id === selectedVaca.id) ?? selectedVaca} reprod={reprod} partos={partos} crias={crias} toros={toros} onBack={() => setScreen('vacas')} onEdit={editVaca} /> : null
      case 'toros': return <TorosScreen toros={toros} crias={crias} onAdd={addToro} onEdit={editToro} onDelete={delToro} />
      case 'crias': return <CriasScreen crias={crias} vacas={vacas} toros={toros} onAdd={addCria} onEdit={editCria} onDelete={delCria} />
      case 'reproduccion': return <ReproduccionScreen reprod={reprod} partos={partos} vacas={vacas} toros={toros} onAdd={addReprod} onDelete={delReprod} />
      case 'partos': return <PartosScreen partos={partos} vacas={vacas} crias={crias} onAdd={addParto} onDelete={delParto} />
      case 'destetes': return <DesteteScreen crias={crias} vacas={vacas} toros={toros} onEdit={editCria} />
      case 'calendario': return <CalendarioScreen vacas={vacas} reprod={reprod} crias={crias} />
      case 'notificaciones': return <NotificacionesScreen vacas={vacas} crias={crias} />
      case 'usuarios': return account?.is_admin ? <UsuariosScreen csrf={csrf.current} me={account} /> : null
      default: return null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f3]">
      <Sidebar current={screen} onNav={setScreen} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onLogout={handleLogout} account={account!} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {saveError && <div role="alert" className="bg-red-100 text-red-800 px-4 py-2 text-sm">{saveError}. Revisa la conexión antes de continuar.</div>}
        <Topbar title={screenTitles[screen]} syncStatus={syncStatus} onSync={handleSync} pendingCount={pendingNotifs} onBell={() => setScreen('notificaciones')} />
        <main className="flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  )
}
