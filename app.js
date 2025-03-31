// Datos iniciales
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let events = JSON.parse(localStorage.getItem('events')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// DOM Elements
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const eventModal = document.getElementById('event-modal');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const createEventBtn = document.getElementById('create-event-btn');
const userAuthSection = document.getElementById('user-auth');
const userLoggedSection = document.getElementById('user-logged');
const usernameDisplay = document.getElementById('username-display');
const showLogin = document.getElementById('show-login');
const showSignup = document.getElementById('show-signup');
const closeModals = document.querySelectorAll('.close-modal');
const createEventForm = document.getElementById('create-event');
const postForm = document.querySelector('.post-form form');
const postTextarea = document.querySelector('.post-form textarea');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbot = document.getElementById('chatbot');
const closeChatbot = document.getElementById('close-chatbot');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-user-input');
const sendMessageBtn = document.getElementById('send-message');

// Inicializar la app
function initApp() {
    updateAuthUI();
    renderEvents();
    renderPosts();
}

// Actualizar UI según autenticación
function updateAuthUI() {
    if (currentUser) {
        userAuthSection.style.display = 'none';
        userLoggedSection.style.display = 'flex';
        usernameDisplay.textContent = currentUser.name;
    } else {
        userAuthSection.style.display = 'flex';
        userLoggedSection.style.display = 'none';
    }
}

// Event Listeners
loginBtn.addEventListener('click', () => {
    authModal.style.display = 'block';
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
});

signupBtn.addEventListener('click', () => {
    authModal.style.display = 'block';
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
});

showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateAuthUI();
});

createEventBtn.addEventListener('click', () => {
    if (!currentUser) {
        authModal.style.display = 'block';
        return;
    }
    eventModal.style.display = 'block';
});

closeModals.forEach(btn => {
    btn.addEventListener('click', () => {
        authModal.style.display = 'none';
        eventModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.style.display = 'none';
    }
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
    }
});

// Login/Signup
document.getElementById('login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    
    // Simulación de login (en realidad debería verificar contra base de datos)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        authModal.style.display = 'none';
        e.target.reset();
    } else {
        alert('Credenciales incorrectas');
    }
});

document.getElementById('signup').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.some(u => u.email === email)) {
        alert('Este email ya está registrado');
        return;
    }
    
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    authModal.style.display = 'none';
    e.target.reset();
    
    // Cambiar al formulario de login
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
});

// Crear Evento
createEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const newEvent = {
        id: Date.now(),
        title: e.target[0].value,
        sport: e.target[1].value,
        description: e.target[2].value,
        date: e.target[3].value,
        location: e.target[4].value,
        creator: currentUser.email,
        participants: []
    };
    
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    renderEvents();
    eventModal.style.display = 'none';
    e.target.reset();
});

// Renderizar Eventos
function renderEvents() {
    const container = document.querySelector('.eventos-container');
    container.innerHTML = '';
    
    events.forEach(event => {
        const eventCard = document.createElement('article');
        eventCard.className = 'evento-card';
        eventCard.innerHTML = `
            <div class="evento-badge">Nuevo</div>
            <img src="https://source.unsplash.com/random/600x400/?${event.sport}" 
                 alt="${event.sport}" class="evento-img">
            <div class="evento-info">
                <h3>${event.title}</h3>
                <div class="evento-detalles">
                    <div class="evento-detalle">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </div>
                    <div class="evento-detalle">
                        <i class="fas fa-calendar-alt"></i>
                        ${new Date(event.date).toLocaleString()}
                    </div>
                    <div class="evento-detalle">
                        <i class="fas fa-users"></i>
                        ${event.participants.length} Participantes
                    </div>
                </div>
                <button class="btn btn-primary" data-event-id="${event.id}">
                    ${event.participants.includes(currentUser?.email) ? 'Cancelar' : 'Reservar Ahora'}
                </button>
            </div>
        `;
        container.appendChild(eventCard);
    });
}

// Publicar en el foro
postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) {
        authModal.style.display = 'block';
        return;
    }
    
    const content = postTextarea.value.trim();
    if (!content) return;
    
    const newPost = {
        id: Date.now(),
        author: currentUser.name,
        authorInitials: currentUser.name.split(' ').map(n => n[0]).join(''),
        content,
        date: new Date().toISOString(),
        likes: 0,
        comments: []
    };
    
    posts.unshift(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    renderPosts();
    postTextarea.value = '';
});

// Renderizar Posts
function renderPosts() {
    const container = document.querySelector('.post-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.innerHTML = `
            <div class="post-header">
                <div class="post-avatar">${post.authorInitials}</div>
                <div>
                    <h4>${post.author}</h4>
                    <small>${new Date(post.date).toLocaleString()}</small>
                </div>
            </div>
            <p>${post.content}</p>
            <div class="post-actions">
                <span class="post-action"><i class="fas fa-thumbs-up"></i> ${post.likes}</span>
                <span class="post-action"><i class="fas fa-comment"></i> ${post.comments.length}</span>
            </div>
        `;
        container.appendChild(postEl);
    });
}

// Chatbot
chatbotToggle.addEventListener('click', () => {
    chatbot.classList.toggle('active');
});

closeChatbot.addEventListener('click', () => {
    chatbot.classList.remove('active');
});

sendMessageBtn.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;
    
    // Mensaje del usuario
    addMessage(message, 'user');
    chatbotInput.value = '';
    
    // Respuesta del bot (simulada)
    setTimeout(() => {
        const botResponse = getBotResponse(message);
        addMessage(botResponse, 'bot');
    }, 500);
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('hola') || lowerMsg.includes('buenos días')) {
        return '¡Hola! ¿En qué puedo ayudarte hoy?';
    } else if (lowerMsg.includes('evento') || lowerMsg.includes('crear')) {
        return 'Para crear un evento, haz clic en el botón "Crear Evento" en la parte superior.';
    } else if (lowerMsg.includes('reservar') || lowerMsg.includes('participar')) {
        return 'Puedes reservar tu plaza en cualquier evento haciendo clic en el botón "Reservar Ahora".';
    } else if (lowerMsg.includes('deporte') || lowerMsg.includes('deportes')) {
        return 'Ofrecemos eventos de fútbol, baloncesto, tenis, running y natación. Pronto añadiremos más.';
    } else if (lowerMsg.includes('mapa') || lowerMsg.includes('ubicación')) {
        return 'Actualmente estamos trabajando en la integración del mapa. Pronto podrás ver todos los eventos cerca de ti.';
    } else {
        return 'Lo siento, no entiendo tu pregunta. ¿Podrías reformularla?';
    }
}

// Mapa no funcional
document.getElementById('mapa').innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
        <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h3>Mapa no disponible temporalmente</h3>
        <p>Estamos trabajando para integrar el mapa de eventos</p>
    </div>
`;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', initApp);