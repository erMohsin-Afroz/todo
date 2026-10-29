import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import './App.css'

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from './features/tasks/api/taskApi'

import type {
  TaskInput,
  TaskFilters,
} from './features/tasks/api/taskApi'

import { getStatuses } from './features/statuses/api/statusApi'
import { getCategories } from './features/categories/api/categoryApi'

import type {
  Task,
  TaskStatus,
  TaskCategory,
} from './features/tasks/types'

import StatusManagement from './features/statuses/components/StatusManagement'
import CategoryManagement from './features/categories/components/CategoryManagement'

type Page = 'dashboard' | 'statuses' | 'categories'

type AppNotification = {
  id: string
  taskId: number
  title: string
  message: string
  reminderAt: string
  createdAt: string
  read: boolean
}

const REMINDER_CHECK_INTERVAL = 10_000

const NOTIFICATIONS_STORAGE_KEY = 'taskflow-in-app-notifications'
const NOTIFIED_REMINDERS_KEY = 'taskflow-notified-reminders'
const NOTIFICATION_ENABLED_KEY = 'taskflow-notifications-enabled'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const [tasks, setTasks] = useState<Task[]>([])
  const [statuses, setStatuses] = useState<TaskStatus[]>([])
  const [categories, setCategories] = useState<TaskCategory[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | 'unsupported'>(
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'unsupported',
    )

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      return localStorage.getItem(NOTIFICATION_ENABLED_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [statusId, setStatusId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [reminderAt, setReminderAt] = useState('')

  const notifiedReminders = useRef<Set<string>>(new Set())

  // Load saved notifications and previously triggered reminders.
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(
        NOTIFICATIONS_STORAGE_KEY,
      )

      if (savedNotifications) {
        const parsed: unknown = JSON.parse(savedNotifications)

        if (Array.isArray(parsed)) {
          setNotifications(parsed as AppNotification[])
        }
      }

      const savedReminders = localStorage.getItem(
        NOTIFIED_REMINDERS_KEY,
      )

      if (savedReminders) {
        const parsedReminders: unknown = JSON.parse(savedReminders)

        if (Array.isArray(parsedReminders)) {
          notifiedReminders.current = new Set(
            parsedReminders.filter(
              (item): item is string => typeof item === 'string',
            ),
          )
        }
      }
    } catch {
      notifiedReminders.current = new Set()
      setNotifications([])
    }
  }, [])

  // Save in-app notifications in browser storage.
  useEffect(() => {
    try {
      localStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(notifications),
      )
    } catch {
      // The app can continue if browser storage is unavailable.
    }
  }, [notifications])

  function saveNotifiedReminders() {
    try {
      localStorage.setItem(
        NOTIFIED_REMINDERS_KEY,
        JSON.stringify([...notifiedReminders.current]),
      )
    } catch {
      // Reminder checking can continue without saved history.
    }
  }

  async function loadInitialData() {
    setLoading(true)
    setError('')

    try {
      const [tasksResponse, statusesResponse, categoriesResponse] =
        await Promise.all([
          getTasks({ limit: 100 }),
          getStatuses(),
          getCategories(),
        ])

      setTasks(tasksResponse.data)
      setStatuses(statusesResponse.data)
      setCategories(categoriesResponse.data)

      if (statusesResponse.data.length > 0) {
        setStatusId((currentStatusId) => {
          if (currentStatusId) {
            return currentStatusId
          }

          const defaultStatus =
            statusesResponse.data.find(
              (status) => status.name.toLowerCase() === 'to do',
            ) ?? statusesResponse.data[0]

          return String(defaultStatus.id)
        })
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Data could not be loaded.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInitialData()
  }, [])

  // Skip the first run because loadInitialData already fetches all tasks.
  const skipFirstFilterLoad = useRef(true)

  // Reload tasks only when search or filters change.
  useEffect(() => {
    if (skipFirstFilterLoad.current) {
      skipFirstFilterLoad.current = false
      return
    }

    const timer = window.setTimeout(() => {
      void loadFilteredTasks()
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search, selectedStatus, selectedCategory])

  async function loadFilteredTasks() {
    const filters: TaskFilters = {
      limit: 100,
    }

    if (search.trim()) {
      filters.q = search.trim()
    }

    if (selectedStatus) {
      filters.statusId = Number(selectedStatus)
    }

    if (selectedCategory) {
      filters.categoryId = Number(selectedCategory)
    }

    try {
      const response = await getTasks(filters)
      setTasks(response.data)
      setError('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Tasks could not be loaded.',
      )
    }
  }

  // Enable browser notifications from the bell panel.
  async function enableReminderNotifications() {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported')
      setError('This browser does not support notifications.')
      return
    }

    if (!window.isSecureContext) {
      setError(
        'Use localhost or an HTTPS website to enable notifications.',
      )
      return
    }

    try {
      let permission = Notification.permission

      if (permission !== 'granted') {
        permission = await Notification.requestPermission()
      }

      setNotificationPermission(permission)

      if (permission === 'granted') {
        setNotificationsEnabled(true)

        try {
          localStorage.setItem(NOTIFICATION_ENABLED_KEY, 'true')
        } catch {
          // The setting will remain active for this session.
        }

        setError('')
        setMessage(
          'Notifications enabled. Keep the app open to check reminders.',
        )
      } else if (permission === 'denied') {
        setNotificationsEnabled(false)

        try {
          localStorage.setItem(NOTIFICATION_ENABLED_KEY, 'false')
        } catch {
          // Ignore storage errors.
        }

        setError(
          'Browser notifications are blocked. Allow notifications in your browser site settings.',
        )
      } else {
        setMessage('Notification permission was not granted.')
      }
    } catch {
      setError('Could not request notification permission.')
    }
  }

  // Disable notifications from the bell panel.
  function disableReminderNotifications() {
    setNotificationsEnabled(false)

    try {
      localStorage.setItem(NOTIFICATION_ENABLED_KEY, 'false')
    } catch {
      // The setting remains disabled for this session.
    }

    setMessage('TaskFlow reminders have been disabled.')
    setError('')
  }

  // Check task reminders every ten seconds while the app is open.
  useEffect(() => {
    function checkReminders() {
      if (!notificationsEnabled) {
        return
      }

      const now = Date.now()

      tasks.forEach((task) => {
        if (!task.reminderAt) {
          return
        }

        const reminderTime = new Date(task.reminderAt).getTime()

        if (Number.isNaN(reminderTime) || reminderTime > now) {
          return
        }

        const reminderKey = `${task.id}:${task.reminderAt}`

        if (notifiedReminders.current.has(reminderKey)) {
          return
        }

        // Mark this reminder so it is not repeated.
        notifiedReminders.current.add(reminderKey)
        saveNotifiedReminders()

        const notification: AppNotification = {
          id: reminderKey,
          taskId: task.id,
          title: 'Task Reminder',
          message: `Reminder: ${task.title}`,
          reminderAt: task.reminderAt,
          createdAt: new Date().toISOString(),
          read: false,
        }

        setNotifications((previous) => {
          if (previous.some((item) => item.id === notification.id)) {
            return previous
          }

          return [notification, ...previous]
        })

        // Also show a system notification when permission is granted.
        if (
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          try {
            const browserNotification = new Notification(
              'TaskFlow Reminder',
              {
                body: `It's time for: ${task.title}`,
                tag: `taskflow-reminder-${task.id}`,
              },
            )

            browserNotification.onclick = () => {
              window.focus()
              setShowNotifications(true)
              browserNotification.close()
            }
          } catch {
            // The in-app notification is still saved.
          }
        }
      })
    }

    checkReminders()

    const timer = window.setInterval(
      checkReminders,
      REMINDER_CHECK_INTERVAL,
    )

    return () => window.clearInterval(timer)
  }, [tasks, notificationsEnabled])

  // Keep permission status updated if it changes in browser settings.
  useEffect(() => {
    function updatePermissionStatus() {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
      } else {
        setNotificationPermission('unsupported')
      }
    }

    window.addEventListener('focus', updatePermissionStatus)

    return () => {
      window.removeEventListener('focus', updatePermissionStatus)
    }
  }, [])

  function markNotificationAsRead(id: string) {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    )
  }

  function markAllNotificationsAsRead() {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  function clearNotifications() {
    setNotifications([])
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length

  function resetForm() {
    setTitle('')
    setDescription('')
    setCategoryId('')
    setDueAt('')
    setReminderAt('')
    setEditingTask(null)
    setShowTaskForm(false)

    if (statuses.length > 0) {
      const defaultStatus =
        statuses.find(
          (status) => status.name.toLowerCase() === 'to do',
        ) ?? statuses[0]

      setStatusId(String(defaultStatus.id))
    } else {
      setStatusId('')
    }
  }

  function dateTimeToISO(value: string): string | null {
    if (!value) {
      return null
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return null
    }

    return date.toISOString()
  }

  function dateTimeToInput(value: string | null): string {
    if (!value) {
      return ''
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    )

    return localDate.toISOString().slice(0, 16)
  }

  // Create a task or update an existing task.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!title.trim()) {
      setError('Task title is required.')
      return
    }

    if (!statusId) {
      setError('Please select a status first.')
      return
    }

    const taskData: TaskInput = {
      title: title.trim(),
      description: description.trim() || null,
      statusId: Number(statusId),
      categoryId: categoryId ? Number(categoryId) : null,
      dueAt: dateTimeToISO(dueAt),
      reminderAt: dateTimeToISO(reminderAt),
    }

    if (
      taskData.reminderAt &&
      new Date(taskData.reminderAt).getTime() <= Date.now()
    ) {
      setError('Please select a future time for the reminder.')
      return
    }

    setSaving(true)

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData)

        // A changed reminder should be allowed to trigger again.
        notifiedReminders.current.delete(
          `${editingTask.id}:${editingTask.reminderAt}`,
        )

        setMessage('Task updated successfully.')
      } else {
        await createTask(taskData)
        setMessage('Task created successfully.')
      }

      resetForm()
      await loadFilteredTasks()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Task could not be saved.',
      )
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(task: Task) {
    setEditingTask(task)
    setShowTaskForm(true)
    setTitle(task.title)
    setDescription(task.description ?? '')
    setStatusId(String(task.statusId))
    setCategoryId(
      task.categoryId !== null ? String(task.categoryId) : '',
    )
    setDueAt(dateTimeToInput(task.dueAt))
    setReminderAt(dateTimeToInput(task.reminderAt))

    setError('')
    setMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Delete a task after confirmation.
  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      'Kya tum sach mein ye task delete karna chahte ho?',
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    try {
      await deleteTask(id)

      setNotifications((previous) =>
        previous.filter((notification) => notification.taskId !== id),
      )

      for (const reminderKey of notifiedReminders.current) {
        if (reminderKey.startsWith(`${id}:`)) {
          notifiedReminders.current.delete(reminderKey)
        }
      }

      saveNotifiedReminders()

      setMessage('Task deleted successfully.')

      if (editingTask?.id === id) {
        resetForm()
      }

      await loadFilteredTasks()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Task could not be deleted.',
      )
    }
  }

  // Update a task's status from the task list.
  async function handleStatusChange(
    task: Task,
    newStatusId: number,
  ) {
    setError('')
    setMessage('')

    try {
      await updateTask(task.id, {
        statusId: newStatusId,
      })

      setMessage('Task status updated successfully.')
      await loadFilteredTasks()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Status could not be updated.',
      )
    }
  }

  function getStatusName(id: number): string {
    return statuses.find((status) => status.id === id)?.name ?? 'Unknown'
  }

  function getCategoryName(id: number | null): string {
    if (id === null) {
      return 'No category'
    }

    return (
      categories.find((category) => category.id === id)?.name ??
      'Unknown'
    )
  }

  function formatDate(value: string | null): string {
    if (!value) {
      return 'Not set'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return 'Invalid date'
    }

    return date.toLocaleString()
  }

  function handleNavigation(page: Page) {
    setCurrentPage(page)
    setError('')
    setMessage('')
    setShowNotifications(false)

    if (page !== 'dashboard') {
      setEditingTask(null)
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const completedCount = tasks.filter(
    (task) => getStatusName(task.statusId).toLowerCase() === 'done',
  ).length

  const pendingCount = tasks.length - completedCount

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>TaskFlow</h1>
          <span>Task Management</span>
        </div>

        {/* Notification bell and notification settings */}
        <div className="notification-wrapper">
          <button
            type="button"
            className="notification-bell"
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications((previous) => !previous)}
          >
            <span aria-hidden="true">🔔</span>

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <section
              className="notification-panel"
              aria-label="Task notifications"
            >
              <div className="notification-panel-header">
                <div>
                  <h2>Notifications</h2>
                  <p>
                    {unreadCount} unread notification
                    {unreadCount === 1 ? '' : 's'}
                  </p>
                </div>

                <button
                  type="button"
                  className="notification-close"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                >
                  ×
                </button>
              </div>

              <div className="notification-settings">
                <h3>Reminder Settings</h3>

                <p>
                  {notificationPermission === 'unsupported'
                    ? 'Is browser mein system notifications supported nahi hain.'
                    : notificationPermission === 'denied'
                      ? 'Browser permission blocked hai. Site settings mein notifications allow karo.'
                      : notificationsEnabled
                        ? 'Task reminders enabled hain.'
                        : 'Task reminders abhi disabled hain.'}
                </p>

                {notificationPermission !== 'unsupported' &&
                  (notificationsEnabled ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={disableReminderNotifications}
                    >
                      Disable Notifications
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => void enableReminderNotifications()}
                    >
                      Allow Notifications
                    </button>
                  ))}
              </div>

              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <span aria-hidden="true">🔔</span>
                  <h3>No notifications yet</h3>
                  <p>Task reminders yahan show honge.</p>
                </div>
              ) : (
                <>
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <article
                        key={notification.id}
                        className={`notification-item ${
                          notification.read ? 'is-read' : 'is-unread'
                        }`}
                      >
                        <div className="notification-item-icon">
                          🔔
                        </div>

                        <div className="notification-item-content">
                          <h3>{notification.title}</h3>

                          <p>{notification.message}</p>

                          <time dateTime={notification.createdAt}>
                            {formatDate(notification.createdAt)}
                          </time>

                          {!notification.read && (
                            <button
                              type="button"
                              className="notification-read-button"
                              onClick={() =>
                                markNotificationAsRead(notification.id)
                              }
                            >
                              Mark as read
                            </button>
                          )}
                        </div>

                        {!notification.read && (
                          <span
                            className="notification-unread-dot"
                            aria-label="Unread"
                          />
                        )}
                      </article>
                    ))}
                  </div>

                  <div className="notification-panel-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all read
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      onClick={clearNotifications}
                    >
                      Clear all
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </header>

      <nav aria-label="Main navigation" className="main-navigation">
        <button
          type="button"
          className={
            currentPage === 'dashboard'
              ? 'primary-button'
              : 'secondary-button'
          }
          aria-current={currentPage === 'dashboard' ? 'page' : undefined}
          onClick={() => handleNavigation('dashboard')}
        >
          Dashboard
        </button>

        <button
          type="button"
          className={
            currentPage === 'statuses'
              ? 'primary-button'
              : 'secondary-button'
          }
          aria-current={currentPage === 'statuses' ? 'page' : undefined}
          onClick={() => handleNavigation('statuses')}
        >
          Manage Statuses
        </button>

        <button
          type="button"
          className={
            currentPage === 'categories'
              ? 'primary-button'
              : 'secondary-button'
          }
          aria-current={currentPage === 'categories' ? 'page' : undefined}
          onClick={() => handleNavigation('categories')}
        >
          Manage Categories
        </button>
      </nav>

      {currentPage === 'statuses' && (
        <StatusManagement
          onBack={() => handleNavigation('dashboard')}
        />
      )}

      {currentPage === 'categories' && (
        <CategoryManagement
          onBack={() => handleNavigation('dashboard')}
        />
      )}

      {currentPage === 'dashboard' && (
        <main className="app-main">
          <section className="dashboard-heading">
            <div>
              <h2>My Tasks</h2>
              <p>Manage your tasks from one place.</p>
            </div>

            <button
              type="button"
              className="primary-button add-task-toggle"
              onClick={() => {
                if (showTaskForm) {
                  resetForm()
                } else {
                  setEditingTask(null)
                  setError('')
                  setMessage('')
                  setShowTaskForm(true)
                }
              }}
              aria-expanded={showTaskForm}
            >
              {showTaskForm ? 'Close Form' : '+ Add New Task'}
            </button>
          </section>

          {error && (
            <div className="error-state" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="success-message" role="status">
              {message}
            </div>
          )}

          {/* Dashboard summary */}
          <section className="stats-grid">
            <div className="stat-card">
              <p>Total Tasks</p>
              <h3>{tasks.length}</h3>
            </div>

            <div className="stat-card">
              <p>Completed</p>
              <h3>{completedCount}</h3>
            </div>

            <div className="stat-card">
              <p>Remaining</p>
              <h3>{pendingCount}</h3>
            </div>

            <div className="stat-card">
              <p>Categories</p>
              <h3>{categories.length}</h3>
            </div>
          </section>

          {/* Task list and filters */}
          <section className="content-panel">
            <h2>All Tasks</h2>

            <div className="filter-container">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
              />

              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>

                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                aria-label="Filter by category"
              >
                <option value="">All categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="loading-state">
                Loading data from backend...
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks found</h3>
                <p>
                  Abhi koi task nahi hai, ya selected filters se koi task
                  match nahi karta.
                </p>
              </div>
            ) : (
              <div className="task-list dashboard-task-list">
                {tasks.map((task) => (
                  <article className="task-card" key={task.id}>
                    <div className="task-card-content">
                      <h3>{task.title}</h3>

                      <p>
                        {task.description || 'No description provided.'}
                      </p>

                      <div className="task-actions task-badges">
                        <span
                          className="badge status-badge"
                          style={{
                            backgroundColor:
                              statuses.find((status) => status.id === task.statusId)?.colour ||
                              '#64748b',
                            color: '#ffffff',
                            border: 'none',
                          }}
                        >
                          {getStatusName(task.statusId)}
                        </span>

                        <span
                          className="badge category-badge"
                          style={{
                            backgroundColor:
                              categories.find((category) => category.id === task.categoryId)
                                ?.colour || '#64748b',
                            color: '#ffffff',
                            border: 'none',
                          }}
                        >
                          {getCategoryName(task.categoryId)}
                        </span>
                      </div>

                      <div className="task-card-dates">
                        <p><strong>Due:</strong> {formatDate(task.dueAt)}</p>
                        <p><strong>Reminder:</strong> {formatDate(task.reminderAt)}</p>
                      </div>
                    </div>

                    <div className="task-card-controls">
                      <label className="task-status-control">
                        <span className="sr-only">Change task status</span>
                        <select
                          value={task.statusId}
                          onChange={(event) =>
                            void handleStatusChange(task, Number(event.target.value))
                          }
                          aria-label={`Change status for ${task.title}`}
                        >
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="task-card-buttons">
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => handleEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => void handleDelete(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          {/* Add or edit task form - shown when the button is clicked */}
          {showTaskForm && createPortal(
          <div
            className="task-form-modal-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget && !saving) {
                resetForm()
              }
            }}
          >
          <section
            className="content-panel task-form-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="task-form-heading">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>

            <form className="task-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="task-title">Task Title *</label>

                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter task title"
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-description">Description</label>

                <textarea
                  id="task-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Enter task description"
                  maxLength={2000}
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-status">Status *</label>

                <select
                  id="task-status"
                  value={statusId}
                  onChange={(event) => setStatusId(event.target.value)}
                  required
                >
                  <option value="">Select status</option>

                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-category">Category</label>

                <select
                  id="task-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">No category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-due">Due Date and Time</label>

                <input
                  id="task-due"
                  type="datetime-local"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-reminder">
                  Reminder Date and Time
                </label>

                <input
                  id="task-reminder"
                  type="datetime-local"
                  value={reminderAt}
                  onChange={(event) => setReminderAt(event.target.value)}
                />
              </div>

              <div className="task-actions">
                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving || statuses.length === 0}
                >
                  {saving
                    ? 'Saving...'
                    : editingTask
                      ? 'Update Task'
                      : 'Add Task'}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>

              {statuses.length === 0 && !loading && (
                <p className="form-error">
                  Task create karne ke liye kam se kam ek status chahiye.
                  Manage Statuses section se status add karo.
                </p>
              )}
            </form>
          </section>
          </div>,
          document.body
          )}

        </main>
      )}
    </div>
  )
}

export default App