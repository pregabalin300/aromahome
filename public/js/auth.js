async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;

    if (password !== password2) {
        alert('Пароли не совпадают');
        return;
    }

    if (password.length < 6) {
        alert('Пароль должен быть не меньше 6 символов');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Ошибка регистрации');
            return;
        }

        // Сохраняем пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'account.html';
    } catch (error) {
        console.error(error);
        alert('Ошибка регистрации');
    }
}

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Ошибка входа');
            return;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'account.html';
    } catch (error) {
        console.error(error);
        alert('Ошибка входа');
    }
}

// Обновить шапку: если пользователь вошёл — показать имя вместо "Войти"
function updateHeader() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loginBtn = document.querySelector('.login-btn');
    if (user && loginBtn) {
        loginBtn.textContent = user.user_name;
        loginBtn.href = 'account.html';
    }
}

document.addEventListener('DOMContentLoaded', updateHeader);