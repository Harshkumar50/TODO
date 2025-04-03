document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const newTaskInput = document.getElementById("new-task")
    const addTaskBtn = document.getElementById("add-task-btn")
    const taskList = document.getElementById("task-list")
    const emptyState = document.getElementById("empty-state")
    const editForm = document.getElementById("edit-form")
    const editTaskInput = document.getElementById("edit-task-input")
    const saveEditBtn = document.getElementById("save-edit-btn")
    const cancelEditBtn = document.getElementById("cancel-edit-btn")
    const tabs = document.querySelectorAll(".tab")
    const allCountEl = document.getElementById("all-count")
    const pendingCountEl = document.getElementById("pending-count")
    const completedCountEl = document.getElementById("completed-count")
    const taskSummary = document.getElementById("task-summary")
    const themeToggle = document.getElementById("theme-toggle")
    const themeIcon = themeToggle.querySelector("i")
  
    // State
    let tasks = []
    let currentFilter = "all"
    let editingTaskId = null
  
    // Initialize
    loadTasks()
    loadTheme()
    renderTasks()
    updateCounts()
  
    // Event Listeners
    addTaskBtn.addEventListener("click", addTask)
    newTaskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addTask()
      }
    })
  
    saveEditBtn.addEventListener("click", saveEdit)
    cancelEditBtn.addEventListener("click", cancelEdit)
  
    tabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        currentFilter = this.dataset.filter
        tabs.forEach((t) => t.classList.remove("active"))
        this.classList.add("active")
        renderTasks()
      })
    })
  
    themeToggle.addEventListener("click", toggleTheme)
  
    // Functions
    function loadTasks() {
      const savedTasks = localStorage.getItem("tasks")
      if (savedTasks) {
        tasks = JSON.parse(savedTasks)
      }
    }
  
    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks))
      updateCounts()
    }
  
    function loadTheme() {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme === "dark") {
        document.body.classList.add("dark-theme")
        themeIcon.classList.remove("fa-moon")
        themeIcon.classList.add("fa-sun")
      }
    }
  
    function toggleTheme() {
      const isDark = document.body.classList.toggle("dark-theme")
  
      if (isDark) {
        themeIcon.classList.remove("fa-moon")
        themeIcon.classList.add("fa-sun")
        localStorage.setItem("theme", "dark")
      } else {
        themeIcon.classList.remove("fa-sun")
        themeIcon.classList.add("fa-moon")
        localStorage.setItem("theme", "light")
      }
    }
  
    function addTask() {
      const text = newTaskInput.value.trim()
      if (text === "") return
  
      const task = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
      }
  
      tasks.push(task)
      saveTasks()
      newTaskInput.value = ""
      renderTasks()
    }
  
    function deleteTask(id) {
      tasks = tasks.filter((task) => task.id !== id)
      saveTasks()
      renderTasks()
    }
  
    function toggleTaskCompletion(id) {
      tasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
      saveTasks()
      renderTasks()
    }
  
    function startEdit(id) {
      const task = tasks.find((task) => task.id === id)
      if (!task) return
  
      editingTaskId = id
      editTaskInput.value = task.text
      editForm.classList.remove("hidden")
  
      // Scroll to edit form
      editForm.scrollIntoView({ behavior: "smooth" })
    }
  
    function saveEdit() {
      if (!editingTaskId) return
  
      const newText = editTaskInput.value.trim()
      if (newText === "") return
  
      tasks = tasks.map((task) => (task.id === editingTaskId ? { ...task, text: newText } : task))
  
      saveTasks()
      cancelEdit()
      renderTasks()
    }
  
    function cancelEdit() {
      editingTaskId = null
      editTaskInput.value = ""
      editForm.classList.add("hidden")
    }
  
    function formatDate(dateString) {
      const date = new Date(dateString)
  
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }
  
      return date.toLocaleDateString("en-US", options)
    }
  
    function renderTasks() {
      // Clear the task list except for the empty state
      while (taskList.firstChild) {
        taskList.removeChild(taskList.firstChild)
      }
  
      // Filter tasks based on current filter
      let filteredTasks = []
  
      if (currentFilter === "all") {
        filteredTasks = [...tasks]
      } else if (currentFilter === "pending") {
        filteredTasks = tasks.filter((task) => !task.completed)
      } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter((task) => task.completed)
      }
  
      // Show empty state if no tasks
      if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement("p")
        emptyMessage.className = "empty-state"
  
        if (currentFilter === "all") {
          emptyMessage.textContent = "No tasks yet. Add one above!"
        } else if (currentFilter === "pending") {
          emptyMessage.textContent = "No pending tasks!"
        } else {
          emptyMessage.textContent = "No completed tasks yet!"
        }
  
        taskList.appendChild(emptyMessage)
        return
      }
  
      // Render each task
      filteredTasks.forEach((task) => {
        const taskItem = document.createElement("div")
        taskItem.className = `task-item ${task.completed ? "completed" : ""}`
        taskItem.dataset.id = task.id
  
        // Checkbox
        const checkbox = document.createElement("div")
        checkbox.className = `checkbox ${task.completed ? "checked" : ""}`
        checkbox.innerHTML = task.completed ? '<i class="fas fa-check"></i>' : ""
        checkbox.addEventListener("click", () => toggleTaskCompletion(task.id))
  
        // Task content
        const taskContent = document.createElement("div")
        taskContent.className = "task-content"
  
        const taskText = document.createElement("div")
        taskText.className = "task-text"
        taskText.textContent = task.text
  
        const taskDate = document.createElement("div")
        taskDate.className = "task-date"
        taskDate.textContent = formatDate(task.createdAt)
  
        taskContent.appendChild(taskText)
        taskContent.appendChild(taskDate)
  
        // Task actions
        const taskActions = document.createElement("div")
        taskActions.className = "task-actions"
  
        const editBtn = document.createElement("button")
        editBtn.className = "edit-btn"
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>'
        editBtn.addEventListener("click", () => startEdit(task.id))
  
        const deleteBtn = document.createElement("button")
        deleteBtn.className = "delete-btn"
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'
        deleteBtn.addEventListener("click", () => deleteTask(task.id))
  
        taskActions.appendChild(editBtn)
        taskActions.appendChild(deleteBtn)

        taskItem.appendChild(checkbox)
        taskItem.appendChild(taskContent)
        taskItem.appendChild(taskActions)
  
        taskList.appendChild(taskItem)
      })
    }
  
    function updateCounts() {
      const pendingCount = tasks.filter((task) => !task.completed).length
      const completedCount = tasks.filter((task) => task.completed).length
      const totalCount = tasks.length
  
      allCountEl.textContent = totalCount
      pendingCountEl.textContent = pendingCount
      completedCountEl.textContent = completedCount
  
      taskSummary.textContent = `${pendingCount} pending, ${completedCount} completed`
    }
  })
  
  