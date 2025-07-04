// CIAQ Prototype Interactive Functionality

// DOM Elements Cache
const dom = {
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('main-content'),
    contentContainer: document.getElementById('content-container'),
    projectsGrid: document.querySelector('.projects-grid'),
    categoryFilter: document.querySelector('select[data-filter="category"]'),
    statusFilter: document.querySelector('select[data-filter="status"]'),
    sortFilter: document.querySelector('select[data-filter="sort"]'),
    viewButtons: document.querySelectorAll('.view-btn'),
    aiChatBtn: document.querySelector('.ai-chat-btn'),
    aiChatContainer: document.getElementById('ai-chat-container'),
    aiChatMessages: document.getElementById('ai-chat-messages'),
    aiChatInput: document.getElementById('ai-chat-input'),
    aiChatClose: document.querySelector('.ai-chat-close'),
    searchInput: document.querySelector('.search-bar input'),
    mainContainer: document.getElementById('main-container'),
    profileBtn: document.querySelector('.user-btn')
};

// Current application state
const appState = {
    view: 'grid',
    currentPage: 'home',
    currentProjectId: null,
    currentEventId: null,
    filters: {
        category: '',
        status: '',
        sort: ''
    },
    aiChatOpen: false,
    user: null
};

// Initialize application
function initApp() {
    // Load user data from localStorage if exists
    const savedUser = localStorage.getItem('ciaqUser');
    if (savedUser) {
        appState.user = JSON.parse(savedUser);
        updateUserInterface();
    }

    // Set up event listeners
    setupEventListeners();
    
    // Initial page rendering
    renderHomePage();
}

// Set up event listeners
function setupEventListeners() {
    // View switching (grid/list)
    dom.viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dom.viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.view = btn.dataset.view;
            if (appState.currentPage === 'projects') {
                renderProjects();
            }
        });
    });

    // Filters
    if (dom.categoryFilter) {
        dom.categoryFilter.addEventListener('change', (e) => {
            appState.filters.category = e.target.value;
            renderProjects();
        });
    }
    
    if (dom.statusFilter) {
        dom.statusFilter.addEventListener('change', (e) => {
            appState.filters.status = e.target.value;
            renderProjects();
        });
    }
    
    if (dom.sortFilter) {
        dom.sortFilter.addEventListener('change', (e) => {
            appState.filters.sort = e.target.value;
            renderProjects();
        });
    }

    // AI Chat toggle
    if (dom.aiChatBtn) {
        dom.aiChatBtn.addEventListener('click', toggleAiChat);
    }
    
    if (dom.aiChatClose) {
        dom.aiChatClose.addEventListener('click', toggleAiChat);
    }
    
    if (dom.aiChatInput) {
        dom.aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAiChatMessage();
            }
        });
    }

    // Search
    if (dom.searchInput) {
        dom.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = dom.searchInput.value.toLowerCase();
                if (searchTerm.trim() !== '') {
                    searchProjects(searchTerm);
                }
            }
        });
    }

    // Profile button
    if (dom.profileBtn) {
        dom.profileBtn.addEventListener('click', () => {
            if (appState.user) {
                renderProfilePage();
            } else {
                renderLoginPage();
            }
        });
    }

    // Navigation menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = item.getAttribute('href');
            if (target === '#home') {
                window.location.href = 'index.html';
                return;
            }
            e.preventDefault();
            // Set active menu item
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            // Navigate to the target page
            navigateTo(target);
        });
    });
}

// Page navigation
function navigateTo(target) {
    switch(target) {
        case '#home':
        case 'index.html':
            renderHomePage();
            break;
        case '#projects':
            renderProjectsPage();
            break;
        case '#events':
            renderEventsPage();
            break;
        case '#education':
            renderEducationPage();
            break;
        case '#investments':
            renderInvestmentsPage();
            break;
        case '#ai-chat':
            toggleAiChat();
            break;
        case '#profile':
            if (appState.user) {
                renderProfilePage();
            } else {
                renderLoginPage();
            }
            break;
        default:
            renderHomePage();
    }
}

// Render home page
function renderHomePage() {
    appState.currentPage = 'home';
    // Home page is already in the HTML, no need to change
}

// Render projects page
function renderProjectsPage() {
    appState.currentPage = 'projects';
    appState.currentProjectId = null;
    
    // Reset filters
    appState.filters = {
        category: '',
        status: '',
        sort: ''
    };
    
    // Update content container
    dom.mainContainer.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Каталог проектов</h2>
                <div class="view-options">
                    <button class="view-btn active" data-view="grid">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </button>
                    <button class="view-btn" data-view="list">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="filters">
                <select class="filter-select" data-filter="category">
                    <option value="">Категория: Все</option>
                    <option value="Дизайн">Дизайн</option>
                    <option value="Кино">Кино</option>
                    <option value="Музыка">Музыка</option>
                    <option value="IT">IT</option>
                    <option value="GameDev">GameDev</option>
                    <option value="Анимация">Анимация</option>
                </select>
                <select class="filter-select" data-filter="status">
                    <option value="">Статус: Все</option>
                    <option value="active">Активный</option>
                    <option value="development">В разработке</option>
                </select>
                <select class="filter-select" data-filter="sort">
                    <option value="">Сортировка</option>
                    <option value="newest">Новые</option>
                    <option value="popular">Популярные</option>
                </select>
            </div>

            <div class="projects-grid" id="projects-container"></div>
        </div>
    `;
    
    // Re-cache DOM elements after updating content
    dom.projectsGrid = document.getElementById('projects-container');
    dom.categoryFilter = document.querySelector('select[data-filter="category"]');
    dom.statusFilter = document.querySelector('select[data-filter="status"]');
    dom.sortFilter = document.querySelector('select[data-filter="sort"]');
    dom.viewButtons = document.querySelectorAll('.view-btn');
    
    // Set up event listeners for the new elements
    setupEventListeners();
    
    // Render projects
    renderProjects();
}

// Render projects based on current filters and view
function renderProjects() {
    if (!dom.projectsGrid) return;
    
    // Filter projects
    let filteredProjects = ciaqData.projects;
    
    if (appState.filters.category) {
        filteredProjects = filteredProjects.filter(p => p.category === appState.filters.category);
    }
    
    if (appState.filters.status) {
        filteredProjects = filteredProjects.filter(p => p.status === appState.filters.status);
    }
    
    // Sort projects
    if (appState.filters.sort === 'newest') {
        filteredProjects = [...filteredProjects].reverse();
    }
    
    // Clear projects container
    dom.projectsGrid.innerHTML = '';
    
    // Set view class
    dom.projectsGrid.className = appState.view === 'grid' ? 'projects-grid' : 'projects-list';
    
    // Render projects
    if (filteredProjects.length === 0) {
        dom.projectsGrid.innerHTML = '<div class="no-results">Нет проектов, соответствующих выбранным фильтрам</div>';
        return;
    }
    
    filteredProjects.forEach(project => {
        dom.projectsGrid.appendChild(createProjectCard(project));
    });
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    if (appState.view === 'grid') {
        card.innerHTML = `
            <div class="project-img">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
            </div>
            <div class="project-content">
                <span class="project-category">${project.category}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.description}</p>
                <div class="project-footer">
                    <div class="project-status">
                        <div class="status-dot status-${project.status}"></div>
                        ${project.statusText}
                    </div>
                    <a href="#project/${project.id}" class="project-more">Подробнее</a>
                </div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="project-content list-view">
                <div class="project-header">
                    <span class="project-category">${project.category}</span>
                    <div class="project-status">
                        <div class="status-dot status-${project.status}"></div>
                        ${project.statusText}
                    </div>
                </div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.description}</p>
                <a href="#project/${project.id}" class="project-more">Подробнее</a>
            </div>
        `;
    }
    
    // Add click event for the "More details" link
    const detailsLink = card.querySelector('.project-more');
    detailsLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderProjectDetailPage(project.id);
    });
    
    return card;
}

// Render project detail page
function renderProjectDetailPage(projectId) {
    appState.currentProjectId = projectId;
    appState.currentPage = 'project-detail';
    
    const project = ciaqData.projects.find(p => p.id === parseInt(projectId));
    if (!project) {
        return;
    }
    
    dom.mainContainer.innerHTML = `
        <div class="section project-detail">
            <div class="back-link">
                <a href="#projects" id="back-to-projects">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                    Назад к проектам
                </a>
            </div>
            
            <div class="project-header">
                <div class="project-header-content">
                    <span class="project-category large">${project.category}</span>
                    <h1 class="project-title large">${project.title}</h1>
                    <div class="project-status">
                        <div class="status-dot status-${project.status}"></div>
                        ${project.statusText}
                    </div>
                </div>
            </div>
            
            <div class="project-tabs">
                <button class="tab-btn active" data-tab="info">Информация</button>
                <button class="tab-btn" data-tab="team">Команда</button>
                <button class="tab-btn" data-tab="needs">Потребности</button>
            </div>
            
            <div class="tab-content" id="tab-info">
                <h3>О проекте</h3>
                <p>${project.fullDescription}</p>
                
                <h3>Целевая аудитория</h3>
                <p>${project.targetAudience}</p>
            </div>
            
            <div class="tab-content hidden" id="tab-team">
                <h3>Команда проекта</h3>
                <div class="team-members">
                    ${project.team.map(member => `
                        <div class="team-member">
                            <div class="member-avatar">${member.name.charAt(0)}</div>
                            <div class="member-info">
                                <div class="member-name">${member.name}</div>
                                <div class="member-role">${member.role}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="tab-content hidden" id="tab-needs">
                <h3>Потребности проекта</h3>
                <p>${project.needs}</p>
                
                <div class="project-actions">
                    <button class="action-btn secondary">Скачать PDF</button>
                    <button class="action-btn">Связаться с командой</button>
                </div>
            </div>
        </div>
    `;
    
    // Set up event listeners for tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
        });
    });
    
    // Set up back button
    document.getElementById('back-to-projects').addEventListener('click', (e) => {
        e.preventDefault();
        renderProjectsPage();
    });
}

// AI Chat functionality
function toggleAiChat() {
    if (!dom.aiChatContainer) {
        // Create chat container if it doesn't exist
        const chatContainer = document.createElement('div');
        chatContainer.id = 'ai-chat-container';
        chatContainer.className = 'ai-chat-container';
        chatContainer.innerHTML = `
            <div class="ai-chat-header">
                <h3>ИИ-ассистент CIAQ</h3>
                <button class="ai-chat-close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="ai-chat-messages" id="ai-chat-messages">
                <div class="ai-message">
                    <div class="ai-avatar">AI</div>
                    <div class="message-content">Здравствуйте! Я ИИ-ассистент CIAQ. Чем могу помочь вам сегодня?</div>
                </div>
                <div class="ai-message">
                    <div class="ai-avatar">AI</div>
                    <div class="message-content">Вы можете спросить меня о платформе, проектах или мероприятиях.</div>
                </div>
            </div>
            <div class="ai-chat-input-container">
                <input type="text" id="ai-chat-input" placeholder="Введите сообщение...">
                <button class="ai-chat-send" id="ai-chat-send">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(chatContainer);
        
        // Cache the new elements
        dom.aiChatContainer = document.getElementById('ai-chat-container');
        dom.aiChatMessages = document.getElementById('ai-chat-messages');
        dom.aiChatInput = document.getElementById('ai-chat-input');
        dom.aiChatClose = document.querySelector('.ai-chat-close');
        
        // Set up event listeners
        dom.aiChatClose.addEventListener('click', toggleAiChat);
        dom.aiChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAiChatMessage();
            }
        });
        
        document.getElementById('ai-chat-send').addEventListener('click', handleAiChatMessage);
    }
    
    // Toggle chat visibility
    appState.aiChatOpen = !appState.aiChatOpen;
    dom.aiChatContainer.classList.toggle('open', appState.aiChatOpen);
    
    // Focus input if opened
    if (appState.aiChatOpen) {
        dom.aiChatInput.focus();
    }
}

// Handle AI chat message
function handleAiChatMessage() {
    const input = dom.aiChatInput;
    const message = input.value.trim();
    
    if (message === '') return;
    
    // Add user message
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'user-message';
    userMessageElement.innerHTML = `
        <div class="message-content">${message}</div>
    `;
    dom.aiChatMessages.appendChild(userMessageElement);
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    dom.aiChatMessages.scrollTop = dom.aiChatMessages.scrollHeight;
    
    // Process user message and add AI response
    setTimeout(() => {
        const aiResponse = getAiResponse(message.toLowerCase());
        
        const aiMessageElement = document.createElement('div');
        aiMessageElement.className = 'ai-message';
        aiMessageElement.innerHTML = `
            <div class="ai-avatar">AI</div>
            <div class="message-content">${aiResponse}</div>
        `;
        dom.aiChatMessages.appendChild(aiMessageElement);
        
        // Scroll to bottom
        dom.aiChatMessages.scrollTop = dom.aiChatMessages.scrollHeight;
    }, 500);
}

// Get AI response based on user message
function getAiResponse(message) {
    // Look for matches in predefined responses
    for (const [key, response] of Object.entries(ciaqData.aiResponses)) {
        if (message.includes(key)) {
            return response;
        }
    }
    
    // Default response if no match found
    return "Извините, я не смог найти ответ на ваш вопрос. Могу помочь вам с информацией о платформе, проектах, мероприятиях или как подать свой проект.";
}

// Render events page
function renderEventsPage() {
    appState.currentPage = 'events';
    appState.currentEventId = null;
    
    // Update content container
    dom.mainContainer.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Мероприятия</h2>
            </div>

            <div class="filters">
                <select class="filter-select" id="event-type-filter">
                    <option value="">Тип: Все</option>
                    <option value="Конференция">Конференция</option>
                    <option value="Хакатон">Хакатон</option>
                    <option value="Мастер-класс">Мастер-класс</option>
                </select>
                <select class="filter-select" id="event-location-filter">
                    <option value="">Место: Все</option>
                    <option value="Алматы">Алматы</option>
                    <option value="Астана">Астана</option>
                    <option value="Онлайн">Онлайн</option>
                </select>
            </div>

            <div class="projects-grid" id="events-container"></div>
        </div>
    `;
    
    // Cache new elements
    const eventTypeFilter = document.getElementById('event-type-filter');
    const eventLocationFilter = document.getElementById('event-location-filter');
    const eventsContainer = document.getElementById('events-container');
    
    // Event listeners for filters
    eventTypeFilter.addEventListener('change', () => {
        renderEvents(eventTypeFilter.value, eventLocationFilter.value);
    });
    
    eventLocationFilter.addEventListener('change', () => {
        renderEvents(eventTypeFilter.value, eventLocationFilter.value);
    });
    
    // Initial render
    renderEvents();
}

// Render events based on filters
function renderEvents(typeFilter = '', locationFilter = '') {
    const eventsContainer = document.getElementById('events-container');
    if (!eventsContainer) return;
    
    // Filter events
    let filteredEvents = ciaqData.events;
    
    if (typeFilter) {
        filteredEvents = filteredEvents.filter(e => e.type === typeFilter);
    }
    
    if (locationFilter) {
        filteredEvents = filteredEvents.filter(e => e.location === locationFilter);
    }
    
    // Clear container
    eventsContainer.innerHTML = '';
    
    // Render events
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = '<div class="no-results">Нет мероприятий, соответствующих выбранным фильтрам</div>';
        return;
    }
    
    filteredEvents.forEach(event => {
        // Format date
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const eventCard = document.createElement('div');
        eventCard.className = 'project-card event-card';
        eventCard.innerHTML = `
            <div class="project-content">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <span class="project-category">${event.type}</span>
                    <span class="event-date">${formattedDate}</span>
                </div>
                <h3 class="project-title">${event.title}</h3>
                <p class="project-desc">${event.description}</p>
                <div class="project-footer">
                    <div class="event-location">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>${event.location}</span>
                    </div>
                    <a href="#event/${event.id}" class="project-more">Подробнее</a>
                </div>
            </div>
        `;
        
        // Add click event for the "More details" link
        const detailsLink = eventCard.querySelector('.project-more');
        detailsLink.addEventListener('click', (e) => {
            e.preventDefault();
            renderEventDetailPage(event.id);
        });
        
        eventsContainer.appendChild(eventCard);
    });
}

// Render event detail page
function renderEventDetailPage(eventId) {
    appState.currentEventId = eventId;
    appState.currentPage = 'event-detail';
    
    const event = ciaqData.events.find(e => e.id === parseInt(eventId));
    if (!event) {
        return;
    }
    
    // Format date
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    
    dom.mainContainer.innerHTML = `
        <div class="section project-detail">
            <div class="back-link">
                <a href="#events" id="back-to-events">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                    Назад к мероприятиям
                </a>
            </div>
            
            <div class="project-header">
                <div class="project-header-content">
                    <span class="project-category large">${event.type}</span>
                    <h1 class="project-title large">${event.title}</h1>
                    <div style="display: flex; align-items: center; gap: 1.5rem; margin-top: 1rem;">
                        <div style="display: flex; align-items: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${formattedDate}
                        </div>
                        <div style="display: flex; align-items: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem;">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${event.location}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content">
                <h3>О мероприятии</h3>
                <p>${event.fullDescription}</p>
                
                <h3>Спикеры</h3>
                <ul style="list-style-type: none; padding: 0;">
                    ${event.speakers.map(speaker => `<li style="padding: 0.8rem; margin-bottom: 0.5rem; background-color: var(--gray); border-radius: var(--border-radius);">${speaker}</li>`).join('')}
                </ul>
                
                <div class="project-actions">
                    <button class="action-btn">Зарегистрироваться</button>
                </div>
            </div>
        </div>
    `;
    
    // Set up back button
    document.getElementById('back-to-events').addEventListener('click', (e) => {
        e.preventDefault();
        renderEventsPage();
    });
}

// Render education page
function renderEducationPage() {
    appState.currentPage = 'education';
    
    // Update content container
    dom.mainContainer.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Образовательные ресурсы</h2>
            </div>

            <div class="projects-grid">
                ${ciaqData.education.map(item => `
                    <div class="education-card">
                        <span class="education-type">${item.type}</span>
                        <h3 class="project-title">${item.title}</h3>
                        <div class="education-duration">${item.duration}</div>
                        <p class="project-desc">${item.description}</p>
                        <button class="action-btn secondary">Скачать материалы</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Render investments page
function renderInvestmentsPage() {
    appState.currentPage = 'investments';
    
    // Update content container
    dom.mainContainer.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title" style="text-align: left;">Инвестиционный портал</h2>
            </div>
            
            <div style="max-width: 800px; margin: 0 0 3rem 0;">
                <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; text-align: left; margin-left: 0; margin-right: 0;">
                    Инвестиционный портал CIAQ предоставляет возможность инвесторам найти перспективные проекты 
                    в креативных индустриях Казахстана, а предпринимателям — привлечь необходимое финансирование 
                    и экспертную поддержку для развития своих идей.
                </p>
                <div style="display: flex; gap: 2rem; margin-bottom: 3rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px; text-align: left; padding: 2rem; background-color: var(--gray); border-radius: var(--border-radius); display: flex; flex-direction: column;">
                        <h3 style="margin-bottom: 1rem;">Для инвесторов</h3>
                        <p style="margin-bottom: 1.5rem;">Инвестируйте в будущее креативной экономики Казахстана</p>
                        <button class="action-btn" style="margin-top:2rem; text-align:left;">Стать инвестором</button>
                    </div>
                    <div style="flex: 1; min-width: 250px; text-align: left; padding: 2rem; background-color: var(--gray); border-radius: var(--border-radius); display: flex; flex-direction: column;">
                        <h3 style="margin-bottom: 1rem;">Для проектов</h3>
                        <p style="margin-bottom: 1.5rem;">Привлеките инвестиции для реализации вашего проекта</p>
                        <button class="action-btn secondary" style="margin-top:2rem; text-align:left;">Подать проект</button>
                    </div>
                </div>
            </div>
            
            <h3 style="margin-bottom: 1.5rem;">Инвестиционные возможности</h3>
            <div class="projects-grid">
                ${ciaqData.investments.map(item => `
                    <div class="investment-card">
                        <span class="investment-type">${item.type}</span>
                        <h3 class="project-title">${item.title}</h3>
                        <div class="investment-budget">${item.budget}</div>
                        <p class="project-desc">${item.description}</p>
                        <a href="#" class="project-more">Подробнее</a>
                    </div>
                `).join('')}
            </div>
            
            <h3 style="margin: 3rem 0 1.5rem;">Проекты, ищущие инвестиции</h3>
            <div class="projects-grid">
                ${ciaqData.projects.filter(p => p.status === 'development').map(project => `
                    <div class="project-card">
                        <div class="project-img">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                        </div>
                        <div class="project-content">
                            <span class="project-category">${project.category}</span>
                            <h3 class="project-title">${project.title}</h3>
                            <p class="project-desc">${project.description}</p>
                            <div class="project-footer">
                                <div class="project-status">
                                    <div class="status-dot status-${project.status}"></div>
                                    ${project.statusText}
                                </div>
                                <a href="#project/${project.id}" class="project-more">Подробнее</a>
                            </div>
                        </div>
                    </div>
                `).slice(0, 3).join('')}
            </div>
        </div>
    `;
    
    // Add event listeners for project links
    document.querySelectorAll('.project-more').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#project/')) {
                e.preventDefault();
                const projectId = link.getAttribute('href').split('/')[1];
                renderProjectDetailPage(parseInt(projectId));
            }
        });
    });
    
    window.scrollTo(0, 0);
}

// Render login page
function renderLoginPage() {
    appState.currentPage = 'login';
    
    dom.mainContainer.innerHTML = `
        <div class="section">
            <h2 class="section-title" style="text-align: center; margin-bottom: 2rem;">Вход в аккаунт</h2>
            
            <div class="form-container">
                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label" for="login-email">Email</label>
                        <input type="email" id="login-email" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="login-password">Пароль</label>
                        <input type="password" id="login-password" class="form-input" required>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <label style="display: flex; align-items: center;">
                            <input type="checkbox" style="margin-right: 0.5rem;">
                            Запомнить меня
                        </label>
                        <a href="#" style="color: var(--primary); text-decoration: none; font-size: 0.9rem;">Забыли пароль?</a>
                    </div>
                    <button type="submit" class="action-btn" style="width: 100%;">Войти</button>
                </form>
                
                <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--gray);">
                    <p style="margin-bottom: 1rem;">Еще нет аккаунта?</p>
                    <button id="go-to-register" class="action-btn secondary" style="width: 100%;">Зарегистрироваться</button>
                </div>
            </div>
        </div>
    `;
    
    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // For demo, just create a mock user
        const user = {
            name: 'Тестовый Пользователь',
            email: document.getElementById('login-email').value,
            role: 'Участник креативной индустрии',
            projects: []
        };
        
        // Save user to localStorage
        localStorage.setItem('ciaqUser', JSON.stringify(user));
        appState.user = user;
        
        // Update user interface
        updateUserInterface();
        
        // Redirect to profile
        renderProfilePage();
    });
    
    // Handle register button
    document.getElementById('go-to-register').addEventListener('click', () => {
        renderRegisterPage();
    });
}

// Update user interface based on login status
function updateUserInterface() {
    const userBtn = document.querySelector('.user-btn');
    
    if (appState.user) {
        // Update login button to show user info
        userBtn.innerHTML = `
            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: white; color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 0.5rem;">
                ${appState.user.name.charAt(0)}
            </div>
            <span>Профиль</span>
        `;
    } else {
        // Reset to login button
        userBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Войти</span>
        `;
    }
}

// Render profile page
function renderProfilePage() {
    if (!appState.user) {
        renderLoginPage();
        return;
    }
    
    appState.currentPage = 'profile';
    
    dom.mainContainer.innerHTML = `
        <div class="section">
            <div class="profile-header">
                <div class="profile-avatar">${appState.user.name.charAt(0)}</div>
                <div class="profile-info">
                    <h2>${appState.user.name}</h2>
                    <p>${appState.user.role}</p>
                    <p>${appState.user.email}</p>
                </div>
            </div>
            
            <div class="project-tabs profile-tabs">
                <button class="tab-btn active" data-tab="projects">Мои проекты</button>
                <button class="tab-btn" data-tab="saved">Сохраненное</button>
                <button class="tab-btn" data-tab="settings">Настройки</button>
            </div>
            
            <div class="tab-content" id="tab-projects">
                <div class="profile-section">
                    <h3>Мои проекты</h3>
                    ${appState.user.projects && appState.user.projects.length > 0 ? 
                        `<div class="projects-grid">
                            ${appState.user.projects.map(project => `
                                <div class="project-card">
                                    <div class="project-content">
                                        <span class="project-category">${project.category}</span>
                                        <h3 class="project-title">${project.title}</h3>
                                        <p class="project-desc">${project.description}</p>
                                        <div class="project-footer">
                                            <div class="project-status">
                                                <div class="status-dot status-${project.status}"></div>
                                                ${project.statusText}
                                            </div>
                                            <a href="#project/${project.id}" class="project-more">Подробнее</a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>` : 
                        `<div style="text-align: center; padding: 2rem;">
                            <p style="margin-bottom: 1.5rem;">У вас пока нет проектов</p>
                            <button class="action-btn">Подать проект</button>
                        </div>`
                    }
                </div>
            </div>
            
            <div class="tab-content hidden" id="tab-saved">
                <div class="profile-section">
                    <h3>Сохраненные проекты</h3>
                    <div style="text-align: center; padding: 2rem;">
                        <p>У вас нет сохраненных проектов</p>
                    </div>
                </div>
            </div>
            
            <div class="tab-content hidden" id="tab-settings">
                <div class="profile-section">
                    <h3>Настройки профиля</h3>
                    <div class="form-container" style="box-shadow: none; padding: 0;">
                        <form id="profile-form">
                            <div class="form-group">
                                <label class="form-label" for="profile-name">Имя</label>
                                <input type="text" id="profile-name" class="form-input" value="${appState.user.name}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="profile-email">Email</label>
                                <input type="email" id="profile-email" class="form-input" value="${appState.user.email}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="profile-role">Роль</label>
                                <input type="text" id="profile-role" class="form-input" value="${appState.user.role}">
                            </div>
                            <div class="project-actions">
                                <button type="button" class="action-btn secondary" id="logout-btn">Выйти</button>
                                <button type="submit" class="action-btn">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set up event listeners for tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
        });
    });
    
    // Handle profile form submission
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Update user
        appState.user.name = document.getElementById('profile-name').value;
        appState.user.email = document.getElementById('profile-email').value;
        appState.user.role = document.getElementById('profile-role').value;
        
        // Save to localStorage
        localStorage.setItem('ciaqUser', JSON.stringify(appState.user));
        
        // Update interface
        updateUserInterface();
        
        // Show success message
        alert('Профиль успешно обновлен');
    });
    
    // Handle logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Clear user data
        localStorage.removeItem('ciaqUser');
        appState.user = null;
        
        // Update interface
        updateUserInterface();
        
        // Go to home page
        renderHomePage();
    });
}

// Search projects
function searchProjects(term) {
    appState.currentPage = 'search';
    
    // Update content container
    dom.mainContainer.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Результаты поиска: "${term}"</h2>
            </div>
            
            <div class="projects-grid" id="search-results"></div>
        </div>
    `;
    
    // Filter projects by search term
    const results = ciaqData.projects.filter(project => {
        return project.title.toLowerCase().includes(term) || 
               project.description.toLowerCase().includes(term) ||
               project.category.toLowerCase().includes(term);
    });
    
    const searchResults = document.getElementById('search-results');
    
    // Display results
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">Нет проектов, соответствующих поисковому запросу</div>';
    } else {
        results.forEach(project => {
            searchResults.appendChild(createProjectCard(project));
        });
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp); 