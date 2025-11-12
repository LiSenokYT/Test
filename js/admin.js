// js/admin.js
// Read Supabase config from meta tags when available, fallback to embedded constants.
const SUPABASE_URL = (typeof document !== 'undefined' && document.querySelector('meta[name="supabase-url"]'))
  ? document.querySelector('meta[name="supabase-url"]').content
  : "https://tluqrkebiubwzweeytfl.supabase.co";

const SUPABASE_ANON_KEY = (typeof document !== 'undefined' && document.querySelector('meta[name="supabase-anon-key"]'))
  ? document.querySelector('meta[name="supabase-anon-key"]').content
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsdXFya2ViaXVid3p3ZWV5dGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODEzNDgsImV4cCI6MjA3ODQ1NzM0OH0.U27ToqoSig7dwubANsXJVvyHQwtStjb1s88EnEuzyXs";

// Create supabase client safely: support both `supabase` (standard CDN) and `supabaseJs` globals.
const _supabaseClient = (typeof supabase !== 'undefined' && supabase && supabase.createClient)
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : (typeof supabaseJs !== 'undefined' && supabaseJs && supabaseJs.createClient)
    ? supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const supabaseClient = _supabaseClient; // avoid redeclaring global `supabase`

const el = id => document.getElementById(id);
const message = el('message');

async function uploadImage(file) {
  if (!file) {return null;}
  if (!supabaseClient) { throw new Error('Supabase client not initialized'); }
  const fileName = Date.now().toString() + "-" + file.name.replace(/\s+/g, "_");
  const bucket = 'vehicle-images'; // имя bucket'а в Supabase Storage
  // Загружаем
  const { error } = await supabaseClient.storage.from(bucket).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) {throw error;}
  // Получаем публичный URL (предполагается, что bucket публичный)
  const { publicURL, error: urlErr } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
  if (urlErr) {throw urlErr;}
  return publicURL;
}

async function saveVehicle() {
  message.textContent = '';
  if (!supabaseClient) {
    message.className = 'error';
    message.textContent = 'Supabase не инициализирован. Проверьте настройки.';
    return;
  }
  const category = el('category').value;
  const title = el('title').value.trim();
  const subtitle = el('subtitle').value.trim();
  const description = el('description').value.trim();
  const specsText = el('specs').value.trim();
  const fileInput = el('image-file');
  const file = fileInput.files && fileInput.files[0];

  if (!title) {
    message.className = 'error';
    message.textContent = 'Введите название.';
    return;
  }

  message.className = '';
  message.textContent = 'Загрузка...';

  try {
    let imageUrl = null;
    if (file) {
      imageUrl = await uploadImage(file);
    }

    let specs = null;
    try {
      specs = specsText ? JSON.parse(specsText) : null;
    } catch (e) {
      message.className = 'error';
      message.textContent = 'Неправильный JSON в характеристиках.';
      return;
    }

    const payload = {
      category, title, subtitle, description,
      image_url: imageUrl,
      specs
    };

    const { data, error } = await supabaseClient
      .from('vehicles')
      .insert([payload])
      .select();

    if (error) {
      throw error;
    }

    message.className = 'notice';
    message.textContent = 'Успешно сохранено: ' + (data && data[0] ? data[0].id : '');

    // Очистим форму
    el('title').value = '';
    el('subtitle').value = '';
    el('description').value = '';
    el('specs').value = '';
    fileInput.value = '';

  } catch (err) {
    console.error(err);
    message.className = 'error';
    message.textContent = 'Ошибка: ' + (err.message || JSON.stringify(err));
  }
}

const btnSave = document.getElementById('btn-save');
if (btnSave) {
  btnSave.addEventListener('click', saveVehicle);
}
