
import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'

import {
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} from '../api/statusApi'

import type { TaskStatus } from '../../tasks/types'

type StatusManagementProps = {
  onBack?: () => void
}

function StatusManagement({ onBack }: StatusManagementProps) {
  const [statuses, setStatuses] = useState<TaskStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [colour, setColour] = useState('#64748b')
  const [sortOrder, setSortOrder] = useState('0')


  useEffect(() => {
    void loadStatuses()
  }, [])

  async function loadStatuses() {
    setLoading(true)
    setError('')

    try {
      const response = await getStatuses()
      setStatuses(response.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Statuses could not be loaded.',
      )
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setEditingId(null)
    setName('')
    setColour('#64748b')
    setSortOrder('0')
    setShowForm(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!name.trim()) {
      setError('Status name is required.')
      return
    }

    const order = Number(sortOrder)

    if (!Number.isInteger(order) || order < 0) {
      setError('Sort order must be zero or greater.')
      return
    }

    setSaving(true)

    try {
      const statusData = {
        name: name.trim(),
        colour,
        sortOrder: order,
      }

      if (editingId !== null) {
        await updateStatus(editingId, statusData)
        setMessage('Status updated successfully.')
      } else {
        await createStatus(statusData)
        setMessage('Status created successfully.')
      }

      resetForm()
      await loadStatuses()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Status could not be saved.',
      )
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(status: TaskStatus) {
    setEditingId(status.id)
    setShowForm(true)
    setName(status.name)
    setColour(status.colour || '#64748b')
    setSortOrder(String(status.sortOrder))

    setError('')
    setMessage('')

  }

  async function handleDelete(status: TaskStatus) {
    const confirmed = window.confirm(
      `"${status.name}" Do you want to delete?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    try {
      await deleteStatus(status.id)

      setMessage('Status deleted successfully.')

      if (editingId === status.id) {
        resetForm()
      }

      await loadStatuses()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Status could not be deleted.',
      )
    }
  }

  return (
    <main className="app-main">
      <section className="dashboard-heading">
        <div>
          <h2>Status Management</h2>
          <p>Edit Manage or Create your status.</p>
        </div>

        <div className="status-heading-actions">
          {onBack && (
            <button
              className="secondary-button"
              type="button"
              onClick={onBack}
            >
              Back to Dashboard
            </button>
          )}
          <button
            className="add-task-toggle"
            type="button"
            onClick={() => {
              resetForm()
              setError('')
              setMessage('')
              setShowForm(true)
            }}
          >
            + Add New Status
          </button>
        </div>
      </section>

      {error && (
        <div className="error-state" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div
          className="loading-state"
          role="status"
          style={{
            marginBottom: '16px',
            background: '#dcfce7',
            color: '#166534',
          }}
        >
          {message}
        </div>
      )}

      {showForm && createPortal(
        <div className="task-form-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) resetForm() }}>
          <section className="task-form-panel content-panel" role="dialog" aria-modal="true" aria-labelledby="status-form-title">
            <div className="dashboard-heading"><h2 id="status-form-title">{editingId !== null ? 'Edit Status' : 'Add New Status'}</h2><button className="secondary-button" type="button" onClick={resetForm}>Close</button></div>
            {error && <div className="error-state" role="alert">{error}</div>}
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="status-name">Status Name *</label>

            <input
              id="status-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={50}
              placeholder="For example, In Progress"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status-colour">Status Colour</label>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <input
                id="status-colour"
                type="color"
                value={colour || '#64748b'}
                onChange={(event) => setColour(event.target.value)}
                aria-label="Choose status colour"
                style={{
                  width: '64px',
                  height: '42px',
                  padding: '4px',
                  cursor: 'pointer',
                }}
              />

              <span>{(colour || '#64748b').toUpperCase()}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status-order">Sort Order</label>

            <input
              id="status-order"
              type="number"
              min="0"
              step="1"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              required
            />
          </div>

          <div className="task-actions">
            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Status'
                  : 'Add Status'}
            </button>

            {editingId !== null && (
              <button
                className="secondary-button"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
          </section>
        </div>, document.body
      )}

      <section className="content-panel">
        <h2>Statuses</h2>

        {loading ? (
          <div className="loading-state">Loading statuses...</div>
        ) : statuses.length === 0 ? (
          <div className="empty-state">
            <h3>No statuses found</h3>
            <p>
              No status available. Add status first.
            </p>
          </div>
        ) : (
          <div className="task-list status-management-list">
            {statuses.map((status) => (
              <article
                className="task-card management-colour-card"
                key={status.id}
                style={{
                  borderLeft: `6px solid ${status.colour || '#64748b'}`,
                  backgroundColor: `color-mix(in srgb, ${status.colour || '#64748b'} 12%, white)`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: '1',
                      minWidth: '180px',
                    }}
                  >
                    <span
                      aria-label={`Colour ${status.colour || '#64748b'}`}
                      title={status.colour || '#64748b'}
                      style={{
                        display: 'inline-block',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: status.colour || '#64748b',
                        border: '1px solid #d1d5db',
                        flexShrink: 0,
                      }}
                    />

                    <div>
                      <h3>{status.name}</h3>

                      <p>
                        Colour: {(status.colour || '#64748b').toUpperCase()}
                      </p>

                      <p>Sort Order: {status.sortOrder}</p>
                    </div>
                  </div>
                  
                  <div
                    className="task-actions"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      marginLeft: 'auto',
                    }}
                  >
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleEdit(status)}
                    >
                      Edit
                    </button>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => void handleDelete(status)}
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
    </main>
  )
}

export default StatusManagement
