import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categoryApi'
import type { CategoryInput } from '../api/categoryApi'
import type { TaskCategory } from '../../tasks/types'

type CategoryManagementProps = {
  onBack?: () => void
}

function CategoryManagement({ onBack }: CategoryManagementProps) {
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [colour, setColour] = useState('#3b82f6')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadCategories() {
    setLoading(true)
    setError('')

    try {
      const response = await getCategories()
      setCategories(response.data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Categories could not load.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  function resetForm() {
    setName('')
    setColour('#3b82f6')
    setEditingId(null)
    setShowForm(false)
    setError('')
    setMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!name.trim()) {
      setError('Category name is required.')
      return
    }

    const categoryData: CategoryInput = {
      name: name.trim(),
      colour,
    }

    setSaving(true)

    try {
      if (editingId !== null) {
        await updateCategory(editingId, categoryData)
        setMessage('Category updated successfully.')
      } else {
        await createCategory(categoryData)
        setMessage('New category added successfully.')
      }

      resetForm()
      setMessage(
        editingId !== null
          ? 'Category updated successfully.'
          : 'New category added successfully.',
      )

      await loadCategories()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Category could not save.',
      )
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(category: TaskCategory) {
    setEditingId(category.id)
    setShowForm(true)
    setName(category.name)
    setColour(category.colour || '#3b82f6')
    setError('')
    setMessage('')
  }

  async function handleDelete(category: TaskCategory) {
    const confirmed = window.confirm(
      `Do you want to delete the category "${category.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setError('')
    setMessage('')

    try {
      await deleteCategory(category.id)

      if (editingId === category.id) {
        resetForm()
      }

      setMessage('Category deleted successfully.')
      await loadCategories()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Category could not delete.',
      )
    }
  }

  return (
    <main className="app-main">
      <section className="dashboard-heading">
        <div>
          <h2>Category Management</h2>
          <p>Edit Manage or Add category.</p>
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
            + Add New Category
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
          <section className="task-form-panel content-panel" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
            <div className="dashboard-heading"><h2 id="category-form-title">{editingId !== null ? 'Edit Category' : 'Add New Category'}</h2><button className="secondary-button" type="button" onClick={resetForm}>Close</button></div>
            {error && <div className="error-state" role="alert">{error}</div>}
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category-name">Category Name *</label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Example: Work, Personal, Learning"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category-colour">Category Colour</label>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <input
                id="category-colour"
                type="color"
                value={colour}
                onChange={(event) => setColour(event.target.value)}
                aria-label="Choose category colour"
                style={{
                  width: '64px',
                  height: '42px',
                  padding: '4px',
                  cursor: 'pointer',
                }}
              />

              <span>{colour.toUpperCase()}</span>
            </div>
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
                  ? 'Update Category'
                  : 'Add Category'}
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
        <h2>Categories</h2>

        {loading ? (
          <div className="loading-state">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <h3>No categories found</h3>
            <p>No Category available. Add category first.</p>
          </div>
        ) : (
          <div className="task-list category-management-list">
            {categories.map((category) => (
              <article
                className="task-card management-colour-card"
                key={category.id}
                style={{
                  borderLeft: `6px solid ${category.colour || '#3b82f6'}`,
                  backgroundColor: `color-mix(in srgb, ${category.colour || '#3b82f6'} 12%, white)`,
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
                    }}
                  >
                    <span
                      aria-label={`Colour ${category.colour}`}
                      title={category.colour}
                      style={{
                        display: 'inline-block',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: category.colour || '#64748b',
                        border: '1px solid #d1d5db',
                        flexShrink: 0,
                      }}
                    />

                    <div>
                      <h3>{category.name}</h3>
                      <p>
                        Colour: {category.colour || 'Default'}
                      </p>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => void handleDelete(category)}
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

export default CategoryManagement