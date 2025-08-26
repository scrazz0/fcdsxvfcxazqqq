const loginForm = document.querySelector('#admin-login');
const pendingList = document.querySelector('#pending-list');

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const password = loginForm.querySelector('input').value;
  fetch('/api/admin/pending', {
    headers: { authorization: password }
  }).then(res => {
    if (res.status === 401) return alert('Неверный пароль');
    return res.json();
  }).then(items => {
    loginForm.classList.add('hidden');
    pendingList.classList.remove('hidden');
    pendingList.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('item-card');
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <button onclick="approve(${item.id})">Одобрить</button>
        <button onclick="reject(${item.id})">Отклонить</button>
      `;
      pendingList.appendChild(card);
    });
  });
});

function approve(id) {
  fetch(`/api/admin/approve/${id}`, {
    method: 'POST',
    headers: { authorization: document.querySelector('#admin-login input').value }
  }).then(() => location.reload());
}

function reject(id) {
  fetch(`/api/admin/reject/${id}`, {
    method: 'POST',
    headers: { authorization: document.querySelector('#admin-login input').value }
  }).then(() => location.reload());
}