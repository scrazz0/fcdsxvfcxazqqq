const tg = window.Telegram.WebApp;
tg.expand();

let user = tg.initDataUnsafe.user;
let seller_id = user ? user.id : 0; // Для теста
let lang = 'ru'; // По умолчанию русский
const translations = {
  ru: { search: 'Поиск...', minPrice: 'Мин цена', maxPrice: 'Макс цена', allCities: 'Все города' /* и т.д. */ },
  uk: { search: 'Пошук...', minPrice: 'Мін ціна', maxPrice: 'Макс ціна', allCities: 'Всі міста' /* и т.д. */ }
};

function updateLang() {
  document.querySelector('#search').placeholder = translations[lang].search;
  // Обновите другие тексты аналогично
}

document.querySelector('#lang-toggle').addEventListener('click', () => {
  lang = lang === 'ru' ? 'uk' : 'ru';
  document.querySelector('#lang-toggle').textContent = lang === 'ru' ? 'UKR' : 'RUS';
  updateLang();
});

document.querySelector('#theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  document.body.classList.toggle('light-theme');
  const icon = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
  document.querySelector('#theme-toggle').textContent = icon;
});

function loadItems(filters = {}) {
  let url = '/api/items?';
  Object.keys(filters).forEach(key => url += `${key}=${filters[key]}&`);
  fetch(url).then(res => res.json()).then(items => {
    const list = document.querySelector('#items-list');
    list.innerHTML = '';
    items.forEach(item => {
      const photos = JSON.parse(item.photos);
      const card = document.createElement('div');
      card.classList.add('item-card');
      card.innerHTML = `
        <img src="${photos[0]}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p class="price">${item.price} грн</p>
        <p class="city">${item.city}</p>
      `;
      card.addEventListener('click', () => showModal(item));
      list.appendChild(card);
    });
  });
}

function showModal(item) {
  const modal = document.querySelector('#modal');
  modal.classList.remove('hidden');
  document.querySelector('#modal-title').textContent = item.title;
  document.querySelector('#modal-description').textContent = item.description;
  document.querySelector('#modal-price').textContent = `${item.price} грн`;
  document.querySelector('#modal-city').textContent = item.city;
  const photosDiv = document.querySelector('#modal-photos');
  photosDiv.innerHTML = '';
  JSON.parse(item.photos).forEach(photo => {
    const img = document.createElement('img');
    img.src = photo;
    photosDiv.appendChild(img);
  });

  const form = document.querySelector('#message-form');
  form.onsubmit = e => {
    e.preventDefault();
    const message = form.querySelector('textarea').value;
    fetch('/api/send-message', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        seller_id: item.seller_id,
        buyer_id: user.id,
        buyer_username: user.username,
        item_title: item.title,
        message
      })
    }).then(res => res.json()).then(data => {
      if (data.success) alert('Сообщение отправлено!');
      modal.classList.add('hidden');
    });
  };
}

document.querySelectorAll('.close').forEach(close => close.addEventListener('click', () => {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}));

document.querySelector('#apply-filters').addEventListener('click', () => {
  const filters = {
    search: document.querySelector('#search').value,
    minPrice: document.querySelector('#min-price').value,
    maxPrice: document.querySelector('#max-price').value,
    city: document.querySelector('#city-filter').value
  };
  loadItems(filters);
});

document.querySelectorAll('.sidebar li').forEach(li => li.addEventListener('click', () => {
  const category = li.dataset.category === 'all' ? '' : li.dataset.category;
  loadItems({category});
}));

document.querySelector('#create-btn').addEventListener('click', () => {
  document.querySelector('#create-modal').classList.remove('hidden');
});

document.querySelector('#create-form').addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  formData.append('seller_id', seller_id);
  fetch('/api/items', {
    method: 'POST',
    body: formData
  }).then(res => res.json()).then(data => {
    if (data.success) {
      alert('Объявление отправлено на модерацию!');
      document.querySelector('#create-modal').classList.add('hidden');
    }
  });
});

loadItems(); // Начальная загрузка