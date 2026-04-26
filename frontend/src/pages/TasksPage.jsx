import { useEffect, useMemo, useState } from "react";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "../services/taskApi";

const initialFormData = {
  title: "",
  description: "",
  priority: "3",
  estimated_hours: "",
  deadline: "",
  category: "",
  energy_required: "3",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  async function loadTasks() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingTaskId(null);
    setFormMessage("");
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setFormMessage("");
    setErrorMessage("");

    const localDeadline = new Date(task.deadline);
    const timezoneOffsetMs = localDeadline.getTimezoneOffset() * 60 * 1000;
    const localInputValue = new Date(
      localDeadline.getTime() - timezoneOffsetMs
    )
      .toISOString()
      .slice(0, 16);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: String(task.priority),
      estimated_hours: String(task.estimated_hours),
      deadline: localInputValue,
      category: task.category || "",
      energy_required: String(task.energy_required),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage("");
    setErrorMessage("");

    try {
      const taskPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: Number(formData.priority),
        estimated_hours: Number(formData.estimated_hours),
        deadline: new Date(formData.deadline).toISOString(),
        category: formData.category.trim() || null,
        energy_required: Number(formData.energy_required),
      };

      if (editingTaskId) {
        await updateTask(editingTaskId, taskPayload);
        setFormMessage("Task updated successfully.");
      } else {
        await createTask(taskPayload);
        setFormMessage("Task created successfully.");
      }

      resetForm();
      await loadTasks();
    } catch (error) {
      setErrorMessage(
        error.message ||
          (editingTaskId ? "Unable to update task." : "Unable to create task.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(taskId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setFormMessage("");

    try {
      await deleteTask(taskId);

      if (editingTaskId === taskId) {
        resetForm();
      }

      setFormMessage("Task deleted successfully.");
      await loadTasks();
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete task.");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const availableCategories = useMemo(() => {
    const categories = tasks
      .map((task) => task.category?.trim())
      .filter(Boolean);

    return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((task) => {
        const titleText = task.title?.toLowerCase() || "";
        const descriptionText = task.description?.toLowerCase() || "";
        const categoryText = task.category?.toLowerCase() || "";

        return (
          titleText.includes(normalizedSearch) ||
          descriptionText.includes(normalizedSearch) ||
          categoryText.includes(normalizedSearch)
        );
      });
    }

    if (categoryFilter !== "all") {
      result = result.filter((task) => (task.category || "") === categoryFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter(
        (task) => String(task.priority) === priorityFilter
      );
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "deadlineAsc":
          return new Date(a.deadline) - new Date(b.deadline);

        case "deadlineDesc":
          return new Date(b.deadline) - new Date(a.deadline);

        case "priorityDesc":
          return b.priority - a.priority;

        case "priorityAsc":
          return a.priority - b.priority;

        case "hoursDesc":
          return b.estimated_hours - a.estimated_hours;

        case "hoursAsc":
          return a.estimated_hours - b.estimated_hours;

        case "oldest":
          return a.id - b.id;

        case "newest":
        default:
          return b.id - a.id;
      }
    });

    return result;
  }, [tasks, searchTerm, categoryFilter, priorityFilter, sortOption]);

  return (
    <div className="page-grid">
      <div className="content-card">
        <p className="eyebrow">Tasks Module</p>
        <h3 className="section-title">
          {editingTaskId ? "Edit Task" : "Create a Task"}
        </h3>
        <p className="section-text">
          {editingTaskId
            ? "You are currently editing an existing task. Save your changes or cancel to return to create mode."
            : "This form sends task data directly to the FastAPI backend, which then validates and saves it into PostgreSQL."}
        </p>

        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>Title</span>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                required
              />
            </label>

            <label className="form-field">
              <span>Category</span>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Backend, Study, Frontend..."
              />
            </label>

            <label className="form-field form-field-full">
              <span>Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add a short description"
                rows="4"
              />
            </label>

            <label className="form-field">
              <span>Priority</span>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="1">1 - Lowest</option>
                <option value="2">2</option>
                <option value="3">3 - Medium</option>
                <option value="4">4</option>
                <option value="5">5 - Highest</option>
              </select>
            </label>

            <label className="form-field">
              <span>Estimated Hours</span>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                placeholder="2.5"
                min="0.25"
                max="24"
                step="0.25"
                required
              />
            </label>

            <label className="form-field">
              <span>Deadline</span>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Energy Required</span>
              <select
                name="energy_required"
                value={formData.energy_required}
                onChange={handleChange}
              >
                <option value="1">1 - Very Low</option>
                <option value="2">2</option>
                <option value="3">3 - Medium</option>
                <option value="4">4</option>
                <option value="5">5 - Very High</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button className="action-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? editingTaskId
                  ? "Saving Changes..."
                  : "Creating Task..."
                : editingTaskId
                ? "Save Changes"
                : "Create Task"}
            </button>

            {editingTaskId ? (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            ) : null}

            {formMessage ? <p className="success-text">{formMessage}</p> : null}
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="section-header-row">
          <div>
            <p className="eyebrow">Saved Tasks</p>
            <h3 className="section-title">Live Task Data</h3>
          </div>

          <button className="action-button" onClick={loadTasks}>
            Refresh Tasks
          </button>
        </div>

        <p className="section-text">
          Filter, search, and sort the current task list without needing to
          reload the backend.
        </p>

        <div className="task-toolbar">
          <label className="form-field toolbar-field toolbar-search">
            <span>Search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title, description, or category"
            />
          </label>

          <label className="form-field toolbar-field">
            <span>Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field toolbar-field">
            <span>Priority</span>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>

          <label className="form-field toolbar-field">
            <span>Sort By</span>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="deadlineAsc">Deadline: Soonest First</option>
              <option value="deadlineDesc">Deadline: Latest First</option>
              <option value="priorityDesc">Priority: Highest First</option>
              <option value="priorityAsc">Priority: Lowest First</option>
              <option value="hoursDesc">Hours: Largest First</option>
              <option value="hoursAsc">Hours: Smallest First</option>
            </select>
          </label>
        </div>

        <div className="task-toolbar-summary">
          Showing <strong>{filteredAndSortedTasks.length}</strong> of{" "}
          <strong>{tasks.length}</strong> tasks
        </div>
      </div>

      {isLoading ? (
        <div className="content-card">
          <p className="section-text">Loading tasks from the backend...</p>
        </div>
      ) : errorMessage ? (
        <div className="content-card">
          <p className="error-text">{errorMessage}</p>
        </div>
      ) : filteredAndSortedTasks.length === 0 ? (
        <div className="content-card">
          <p className="section-text">
            No tasks match the current filter settings. Try changing your
            search, filters, or sort options.
          </p>
        </div>
      ) : (
        <div className="task-list">
          {filteredAndSortedTasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-card-header">
                <h4 className="task-title">{task.title}</h4>
                <span className="task-priority">Priority {task.priority}</span>
              </div>

              <p className="task-description">
                {task.description || "No description provided."}
              </p>

              <div className="task-meta-grid">
                <p>
                  <strong>Estimated Hours:</strong> {task.estimated_hours}
                </p>
                <p>
                  <strong>Deadline:</strong>{" "}
                  {new Date(task.deadline).toLocaleString()}
                </p>
                <p>
                  <strong>Category:</strong> {task.category || "Uncategorized"}
                </p>
                <p>
                  <strong>Energy Required:</strong> {task.energy_required}/5
                </p>
              </div>

              <div className="task-card-actions">
                <button
                  className="secondary-button"
                  onClick={() => startEditing(task)}
                >
                  Edit
                </button>

                <button
                  className="danger-button"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}