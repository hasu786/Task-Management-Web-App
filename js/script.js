// Task Management Application
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskList = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');
    const taskModal = document.getElementById('task-modal');
    const projectModal = document.getElementById('project-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const addFirstTaskBtn = document.getElementById('add-first-task');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelTaskBtn = document.getElementById('cancel-task');
    const closeProjectModalBtn = document.getElementById('close-project-modal');
    const cancelProjectBtn = document.getElementById('cancel-project');
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectForm = document.getElementById('project-form');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const taskSearch = document.getElementById('task-search');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const projectList = document.getElementById('project-list');
    const filterOptions = document.querySelectorAll('input[name="filter"]');
    
    // Stats elements
    const totalTasksEl = document.getElementById('total-tasks');
    const pendingTasksEl = document.getElementById('pending-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const taskCount = document.getElementById('task-count');
    const currentProject = document.getElementById('current-project');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let projects = JSON.parse(localStorage.getItem('projects')) || [
        { id: 'all', name: 'All Tasks', color: '#1976d2', icon: 'fa-list' },
        { id: 'personal', name: 'Personal', color: '#4CAF50', icon: 'fa-user' },
        { id: 'work', name: 'Work', color: '#2196F3', icon: 'fa-briefcase' },
        { id: 'shopping', name: 'Shopping', color: '#9C27B0', icon: 'fa-shopping-cart' }
    ];
    let currentProjectFilter = 'all';
    let currentStatusFilter = 'all';
    let currentEditTaskId = null;
    
    // Initialize the app
    initApp();
    
    function initApp() {
        // Load tasks and projects from localStorage
        loadTasks();
        loadProjects();
        updateStats();
        renderTasks();
        renderProjects();
        
        // Event Listeners
        addTaskBtn.addEventListener('click', () => openTaskModal());
        addFirstTaskBtn.addEventListener('click', () => openTaskModal());
        closeModalBtn.addEventListener('click', () => closeTaskModal());
        cancelTaskBtn.addEventListener('click', () => closeTaskModal());
        closeProjectModalBtn.addEventListener('click', () => closeProjectModal());
        cancelProjectBtn.addEventListener('click', () => closeProjectModal());
        
        taskForm.addEventListener('submit', handleTaskSubmit);
        addProjectBtn.addEventListener('click', () => openProjectModal());
        projectForm.addEventListener('submit', handleProjectSubmit);
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
        taskSearch.addEventListener('input', filterTasksBySearch);
        exportBtn.addEventListener('click', exportTasks);
        importBtn.addEventListener('click', importTasks);
        
        // Filter event listeners
        filterOptions.forEach(option => {
            option.addEventListener('change', function() {
                currentStatusFilter = this.value;
                renderTasks();
            });
        });
        
        // Project list event delegation
        projectList.addEventListener('click', function(e) {
            const projectItem = e.target.closest('.project-item');
            if (projectItem) {
                // Update active project
                document.querySelectorAll('.project-item').forEach(item => {
                    item.classList.remove('active');
                });
                projectItem.classList.add('active');
                
                // Update current project filter
                currentProjectFilter = projectItem.dataset.project;
                currentProject.textContent = projectItem.textContent.trim();
                renderTasks();
            }
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === taskModal) {
                closeTaskModal();
            }
            if (e.target === projectModal) {
                closeProjectModal();
            }
        });
    }
    
    // Task Functions
    function loadTasks() {
        // If no tasks in localStorage, create some sample tasks
        if (tasks.length === 0) {
            tasks = [
                {
                    id: generateId(),
                    title: 'Welcome to TaskFlow!',
                    description: 'This is a sample task. You can edit, complete, or delete it.',
                    dueDate: getFormattedDate(new Date()),
                    priority: 'medium',
                    project: 'personal',
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(),
                    title: 'Complete portfolio website',
                    description: 'Add the task management app to my portfolio',
                    dueDate: getFormattedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                    priority: 'high',
                    project: 'work',
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(),
                    title: 'Buy groceries',
                    description: 'Milk, eggs, bread, fruits',
                    dueDate: getFormattedDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
                    priority: 'medium',
                    project: 'shopping',
                    completed: true,
                    createdAt: new Date().toISOString()
                }
            ];
            saveTasks();
        }
    }
    
    function loadProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateStats();
    }
    
    function renderTasks() {
        // Filter tasks based on current filters
        let filteredTasks = tasks.filter(task => {
            // Filter by project
            if (currentProjectFilter !== 'all' && task.project !== currentProjectFilter) {
                return false;
            }
            
            // Filter by status
            if (currentStatusFilter === 'pending' && task.completed) {
                return false;
            }
            if (currentStatusFilter === 'completed' && !task.completed) {
                return false;
            }
            
            // Filter by due today
            if (currentStatusFilter === 'today') {
                const today = getFormattedDate(new Date());
                if (task.dueDate !== today) {
                    return false;
                }
            }
            
            // Filter by search
            if (taskSearch.value.trim() !== '') {
                const searchTerm = taskSearch.value.toLowerCase();
                return task.title.toLowerCase().includes(searchTerm) || 
                       task.description.toLowerCase().includes(searchTerm);
            }
            
            return true;
        });
        
        // Clear task list
        taskList.innerHTML = '';
        
        // Show empty state if no tasks
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks found</h3>
                <p>${tasks.length === 0 ? 'Add your first task to get started!' : 'Try changing your filters or search term'}</p>
                ${tasks.length === 0 ? '<button class="btn btn-primary" id="add-first-task">Add Task</button>' : ''}
            `;
            taskList.appendChild(emptyState);
            
            // Re-add event listener if button was recreated
            if (tasks.length === 0) {
                document.getElementById('add-first-task').addEventListener('click', () => openTaskModal());
            }
            
            return;
        }
        
        // Sort tasks: incomplete first, then by due date, then by priority
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            if (a.dueDate && b.dueDate) {
                const dateA = new Date(a.dueDate);
                const dateB = new Date(b.dueDate);
                if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                }
            }
            
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        // Render each task
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority`;
        taskElement.dataset.id = task.id;
        
        // Format due date for display
        let dueDateDisplay = 'No due date';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            if (dueDate.toDateString() === today.toDateString()) {
                dueDateDisplay = '<span style="color: #f44336;">Today</span>';
            } else if (dueDate.toDateString() === tomorrow.toDateString()) {
                dueDateDisplay = '<span style="color: #ff9800;">Tomorrow</span>';
            } else {
                dueDateDisplay = dueDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                // Highlight overdue tasks
                if (dueDate < today && !task.completed) {
                    dueDateDisplay = `<span style="color: #f44336; font-weight: 600;">${dueDateDisplay} (Overdue)</span>`;
                }
            }
        }
        
        // Get project info
        const project = projects.find(p => p.id === task.project) || { name: task.project, color: '#777' };
        
        taskElement.innerHTML = `
            <div class="task-header-row">
                <div class="task-title">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span>${escapeHtml(task.title)}</span>
                </div>
                <div class="task-actions-row">
                    <button class="task-action-btn edit-task" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-description">${escapeHtml(task.description) || '<span style="color: #999; font-style: italic;">No description</span>'}</div>
            <div class="task-meta">
                <div class="task-priority">
                    <span class="priority-dot priority-${task.priority}"></span>
                    <span>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
                </div>
                <div class="task-project">
                    <span class="project-tag" style="background-color: ${project.color}20; color: ${project.color};">${project.name}</span>
                </div>
                <div class="task-due">
                    <i class="far fa-calendar-alt"></i>
                    <span>${dueDateDisplay}</span>
                </div>
            </div>
        `;
        
        // Add event listeners to task buttons
        const checkbox = taskElement.querySelector('.task-checkbox');
        const editBtn = taskElement.querySelector('.edit-task');
        const deleteBtn = taskElement.querySelector('.delete-task');
        
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        editBtn.addEventListener('click', () => editTask(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        return taskElement;
    }
    
    function openTaskModal(taskId = null) {
        const modalTitle = document.getElementById('modal-title');
        const taskIdInput = document.getElementById('task-id');
        
        if (taskId) {
            // Edit existing task
            modalTitle.textContent = 'Edit Task';
            currentEditTaskId = taskId;
            const task = tasks.find(t => t.id === taskId);
            
            if (task) {
                document.getElementById('task-title').value = task.title;
                document.getElementById('task-description').value = task.description;
                document.getElementById('task-due-date').value = task.dueDate || '';
                document.getElementById('task-priority').value = task.priority;
                document.getElementById('task-project').value = task.project;
                document.getElementById('task-completed').checked = task.completed;
                taskIdInput.value = task.id;
            }
        } else {
            // Add new task
            modalTitle.textContent = 'Add New Task';
            currentEditTaskId = null;
            taskForm.reset();
            document.getElementById('task-due-date').value = getFormattedDate(new Date());
            taskIdInput.value = '';
        }
        
        taskModal.style.display = 'flex';
    }
    
    function closeTaskModal() {
        taskModal.style.display = 'none';
        taskForm.reset();
        currentEditTaskId = null;
    }
    
    function handleTaskSubmit(e) {
        e.preventDefault();
        
        const taskId = document.getElementById('task-id').value;
        const taskData = {
            id: taskId || generateId(),
            title: document.getElementById('task-title').value.trim(),
            description: document.getElementById('task-description').value.trim(),
            dueDate: document.getElementById('task-due-date').value,
            priority: document.getElementById('task-priority').value,
            project: document.getElementById('task-project').value,
            completed: document.getElementById('task-completed').checked,
            createdAt: taskId ? tasks.find(t => t.id === taskId)?.createdAt || new Date().toISOString() : new Date().toISOString()
        };
        
        if (!taskData.title) {
            alert('Task title is required!');
            return;
        }
        
        if (taskId) {
            // Update existing task
            const index = tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                tasks[index] = taskData;
            }
        } else {
            // Add new task
            tasks.push(taskData);
        }
        
        saveTasks();
        renderTasks();
        closeTaskModal();
    }
    
    function toggleTaskCompletion(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }
    
    function editTask(taskId) {
        openTaskModal(taskId);
    }
    
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }
    }
    
    function clearCompletedTasks() {
        if (confirm('Are you sure you want to delete all completed tasks?')) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
        }
    }
    
    function filterTasksBySearch() {
        renderTasks();
    }
    
    // Project Functions
    function renderProjects() {
        projectList.innerHTML = '';
        
        projects.forEach(project => {
            const projectElement = document.createElement('li');
            projectElement.className = `project-item ${project.id === 'all' ? 'active' : ''}`;
            projectElement.dataset.project = project.id;
            projectElement.innerHTML = `
                <i class="fas ${project.icon}"></i> ${project.name}
            `;
            projectList.appendChild(projectElement);
        });
    }
    
    function openProjectModal() {
        projectModal.style.display = 'flex';
    }
    
    function closeProjectModal() {
        projectModal.style.display = 'none';
        projectForm.reset();
    }
    
    function handleProjectSubmit(e) {
        e.preventDefault();
        
        const projectName = document.getElementById('project-name').value.trim();
        const projectColor = document.querySelector('input[name="project-color"]:checked').value;
        
        if (!projectName) {
            alert('Project name is required!');
            return;
        }
        
        // Create a project ID from the name
        const projectId = projectName.toLowerCase().replace(/\s+/g, '-');
        
        // Check if project already exists
        if (projects.some(p => p.id === projectId)) {
            alert('A project with this name already exists!');
            return;
        }
        
        // Add new project
        const newProject = {
            id: projectId,
            name: projectName,
            color: projectColor,
            icon: 'fa-folder'
        };
        
        projects.push(newProject);
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjects();
        
        // Add project option to task form
        const projectSelect = document.getElementById('task-project');
        const option = document.createElement('option');
        option.value = projectId;
        option.textContent = projectName;
        projectSelect.appendChild(option);
        
        closeProjectModal();
    }
    
    // Stats and Progress Functions
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = pending;
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}% Complete`;
        taskCount.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
    }
    
    // Import/Export Functions
    function exportTasks() {
        const dataStr = JSON.stringify(tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `taskflow-tasks-${getFormattedDate(new Date())}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    function importTasks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const importedTasks = JSON.parse(event.target.result);
                    
                    if (Array.isArray(importedTasks)) {
                        // Validate imported tasks
                        const validTasks = importedTasks.filter(task => 
                            task.id && task.title && typeof task.completed === 'boolean'
                        );
                        
                        if (validTasks.length > 0) {
                            if (confirm(`Import ${validTasks.length} tasks? This will replace your current tasks.`)) {
                                tasks = validTasks;
                                saveTasks();
                                renderTasks();
                                alert('Tasks imported successfully!');
                            }
                        } else {
                            alert('No valid tasks found in the file.');
                        }
                    } else {
                        alert('Invalid file format.');
                    }
                } catch (error) {
                    alert('Error reading file: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Utility Functions
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function getFormattedDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});