import { useEffect, useMemo, useState } from 'react'
import './App.css'
import focusPath from './assets/generated/focus-path.png'
import timeGarden from './assets/generated/time-garden.png'
import restingFox from './assets/generated/resting-fox.png'

const STORAGE_KEY = 'focusday-tasks'
const pad = (n) => String(n).padStart(2, '0')
const localDate = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const localTime = (date = new Date()) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

const seedTasks = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  return [
    { id: crypto.randomUUID(), title: '整理本周工作计划', note: '明确三个最重要的目标', date: localDate(today), time: '10:30', priority: 'high', done: false },
    { id: crypto.randomUUID(), title: '给妈妈打电话', note: '', date: localDate(today), time: '19:00', priority: 'medium', done: false },
    { id: crypto.randomUUID(), title: '阅读 30 分钟', note: '《思考，快与慢》', date: localDate(tomorrow), time: '21:00', priority: 'low', done: false },
  ]
}

const Icon = ({ name, size = 20 }) => {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    calendar: <><path d="M6 2v4M18 2v4M3 9h18"/><rect x="3" y="4" width="18" height="18" rx="3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6"/><path d="M10 11v5M14 11v5"/></>,
    x: <path d="m6 6 12 12M18 6 6 18" />,
    spark: <path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedTasks() } catch { return seedTasks() }
  })
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
  const [form, setForm] = useState({ title: '', note: '', date: localDate(), time: localTime(), priority: 'medium' })

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) }, [tasks])

  useEffect(() => {
    const timer = setInterval(() => {
      if (Notification.permission !== 'granted') return
      const now = new Date()
      setTasks(current => current.map(task => {
        const due = new Date(`${task.date}T${task.time || '23:59'}`)
        if (!task.done && !task.notified && due <= now && now - due < 60000) {
          new Notification('FocusDay 待办提醒', { body: task.title })
          return { ...task, notified: true }
        }
        return task
      }))
    }, 15000)
    return () => clearInterval(timer)
  }, [])

  const today = localDate()
  const visibleTasks = useMemo(() => tasks
    .filter(task => filter === 'all' || (filter === 'today' ? task.date === today : filter === 'done' ? task.done : !task.done))
    .sort((a, b) => Number(a.done) - Number(b.done) || `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [tasks, filter, today])
  const completed = tasks.filter(task => task.done).length
  const todayTasks = tasks.filter(task => task.date === today && !task.done).length
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0

  const addTask = (event) => {
    event.preventDefault()
    if (!form.title.trim()) return
    setTasks(prev => [...prev, { ...form, title: form.title.trim(), id: crypto.randomUUID(), done: false }])
    setForm({ title: '', note: '', date: localDate(), time: localTime(), priority: 'medium' })
    setShowForm(false)
  }

  const askNotification = async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setNotification(result)
    if (result === 'granted') new Notification('提醒已开启', { body: 'FocusDay 会在任务到期时提醒你。' })
  }

  const dateLabel = (date) => {
    if (date === today) return '今天'
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
    if (date === localDate(tomorrow)) return '明天'
    return `${Number(date.slice(5, 7))}月${Number(date.slice(8))}日`
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Icon name="check" size={18}/></span><span>FocusDay</span></div>
        <button className={`notify-button ${notification === 'granted' ? 'active' : ''}`} onClick={askNotification}>
          <Icon name="bell" size={18}/><span>{notification === 'granted' ? '提醒已开启' : '开启提醒'}</span>
        </button>
      </header>

      <main>
        <section className="hero-section">
          <img className="hero-art" src={focusPath} alt="纸艺森林中通往晨光的专注之路" />
          <div className="hero-copy">
            <p className="eyebrow"><Icon name="spark" size={15}/> 专注当下，逐一完成</p>
            <h1>今天想完成什么？</h1>
            <p className="subtitle">把重要的事记下来，留出空间给真正重要的生活。</p>
            <button className="primary-button hero-action" onClick={() => setShowForm(true)}><Icon name="plus" size={19}/> 新建待办</button>
          </div>
          <div className="hero-caption"><span>今日灵感</span><p>完成不是终点，而是让轻盈重新发生。</p></div>
        </section>

        <section className="stats-grid">
          <div className="stat-card accent-card"><span className="stat-icon"><Icon name="calendar"/></span><div><span>今日待办</span><strong>{todayTasks}</strong></div></div>
          <div className="stat-card"><span className="stat-icon green"><Icon name="check"/></span><div><span>已完成</span><strong>{completed}</strong></div></div>
          <div className="progress-card">
            <img className="garden-art" src={timeGarden} alt="象征成长与时间流动的微缩花园" />
            <div className="progress-copy"><div><span>整体进度</span><strong>{progress}%</strong></div><p>{progress === 100 ? '漂亮，全部完成！' : '每完成一件，离目标更近一点'}</p></div>
            <div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` }}><span>{progress}%</span></div>
          </div>
        </section>

        <section className="task-panel">
          <div className="panel-head">
            <div><h2>我的待办</h2><p>{tasks.filter(t => !t.done).length} 件事情等待完成</p></div>
            <div className="filters">
              {[['all','全部'],['today','今天'],['active','进行中'],['done','已完成']].map(([key,label]) => <button key={key} className={filter === key ? 'selected' : ''} onClick={() => setFilter(key)}>{label}</button>)}
            </div>
          </div>

          <div className="task-list">
            {visibleTasks.length === 0 ? <div className="empty"><img src={restingFox} alt="在完成标记旁安心休息的纸艺小狐狸"/><h3>这里暂时空空的</h3><p>留白也是一天的一部分，或者新建一项待办。</p><button onClick={() => setShowForm(true)}><Icon name="plus" size={16}/> 写下下一件事</button></div> : visibleTasks.map(task => {
              const overdue = !task.done && new Date(`${task.date}T${task.time || '23:59'}`) < new Date()
              return <article className={`task-item ${task.done ? 'is-done' : ''}`} key={task.id}>
                <button className="check-button" aria-label={task.done ? '标记未完成' : '标记完成'} onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? {...t, done: !t.done} : t))}>{task.done && <Icon name="check" size={15}/>}</button>
                <div className="task-content"><div className="task-title-row"><h3>{task.title}</h3><span className={`priority ${task.priority}`}>{task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}</span></div>{task.note && <p>{task.note}</p>}<div className="task-meta"><span className={overdue ? 'overdue' : ''}><Icon name="calendar" size={15}/>{dateLabel(task.date)}</span><span><Icon name="clock" size={15}/>{task.time || '全天'}</span></div></div>
                <button className="delete-button" aria-label="删除任务" onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}><Icon name="trash" size={17}/></button>
              </article>
            })}
          </div>
        </section>
      </main>

      <footer>让每一天，都有清晰的方向。</footer>

      {showForm && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
        <form className="task-form" onSubmit={addTask}>
          <div className="form-head"><div><h2>新建待办</h2><p>写下目标，给它一个准确的时间。</p></div><button type="button" onClick={() => setShowForm(false)}><Icon name="x"/></button></div>
          <label>待办事项<input autoFocus placeholder="例如：完成项目周报" value={form.title} onChange={e => setForm({...form, title:e.target.value})}/></label>
          <label>备注（选填）<textarea placeholder="补充一些细节..." value={form.note} onChange={e => setForm({...form, note:e.target.value})}/></label>
          <div className="form-row"><label>日期<input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})}/></label><label>时间<input type="time" value={form.time} onChange={e => setForm({...form,time:e.target.value})}/></label></div>
          <label>优先级<div className="priority-picker">{[['low','低'],['medium','中'],['high','高']].map(([key,label]) => <button type="button" key={key} className={form.priority === key ? `picked ${key}` : ''} onClick={() => setForm({...form,priority:key})}>{label}</button>)}</div></label>
          <div className="form-actions"><button type="button" className="cancel" onClick={() => setShowForm(false)}>取消</button><button className="submit" type="submit"><Icon name="plus" size={18}/> 添加待办</button></div>
        </form>
      </div>}
    </div>
  )
}

export default App
