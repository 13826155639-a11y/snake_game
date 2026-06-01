// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    // Initialize the app
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Add todo
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');

        addBtn.addEventListener('click', () => this.addTodo());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear buttons
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
    }

    // Add a new todo
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (text === '') {
            alert('请输入待办事项');
            return;
        }

        if (text.length > 100) {
            alert('待办事项不能超过100个字符');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.unshift(todo);
        input.value = '';
        input.focus();
        this.saveToStorage();
        this.render();
    }

    // Delete a todo
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    // Get filtered todos
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    // Clear completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            alert('没有已完成的待办事项');
            return;
        }

        if (confirm(`确认要删除 ${completedCount} 个已完成的待办事项吗？`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToStorage();
            this.render();
        }
    }

    // Clear all todos
    clearAll() {
        if (this.todos.length === 0) {
            alert('没有待办事项可清除');
            return;
        }

        if (confirm('⚠️ 确认要删除所有待办事项吗？此操作无法撤销。')) {
            if (confirm('最后确认：真的要删除吗？')) {
                this.todos = [];
                this.saveToStorage();
                this.currentFilter = 'all';
                document.querySelector('[data-filter="all"]').classList.add('active');
                document.querySelectorAll('[data-filter]:not([data-filter="all"])').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.render();
            }
        }
    }

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (e) {
            console.error('保存到本地存储失败:', e);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('todos');
            this.todos = saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('从本地存储加载失败:', e);
            this.todos = [];
        }
    }

    // Update statistics
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('activeCount').textContent = active;
    }

    // Render the todo list
    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        // Clear the list
        todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
                
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        data-id="${todo.id}"
                    >
                    <span class="todo-text" title="${todo.text}">${this.escapeHtml(todo.text)}</span>
                    <button class="delete-btn" data-id="${todo.id}" title="删除">🗑️</button>
                `;

                // Add event listeners
                li.querySelector('.checkbox').addEventListener('change', () => {
                    this.toggleTodo(todo.id);
                });

                li.querySelector('.delete-btn').addEventListener('click', () => {
                    this.deleteTodo(todo.id);
                });

                todoList.appendChild(li);
            });
        }

        this.updateStats();
    }

    // Escape HTML special characters
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});