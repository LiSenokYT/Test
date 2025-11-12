class DataLoader {
  constructor() {
    // Используем относительный путь без ведущего слеша — работает при запуске из любой папки
    this.basePath = 'src/data';
    this.initSupabase();
  }

  initSupabase() {
    // Конфигурация Supabase
    // Пытаемся получить конфиг из глобальных переменных или meta-тегов, чтобы не хранить ключи в коде
    const SUPABASE_URL = window.SUPABASE_URL || (document.querySelector('meta[name="supabase-url"]') && document.querySelector('meta[name="supabase-url"]').content) || "https://tluqrkebiubwzweeytfl.supabase.co";
    const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || (document.querySelector('meta[name="supabase-key"]') && document.querySelector('meta[name="supabase-key"]').content) || "REPLACE_WITH_ANON_KEY"; // <- лучше задать через meta или window

    this.useSupabase = !!(SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== "REPLACE_WITH_ANON_KEY");
    this.supabaseClient = null;

    if (this.useSupabase) {
      try { 
        this.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch(e) { 
        console.warn('Supabase init failed', e); 
        this.useSupabase = false;
      }
    }
  }

  async loadVehiclesFromSupabase(category) {
    if (!this.useSupabase || !this.supabaseClient) {return null;}
    try {
      let q = this.supabaseClient.from('vehicles').select('*').order('created_at', { ascending: false });
      if (category) {q = q.eq('category', category);}
      const { data, error } = await q;
      if (error) { 
        console.error('Supabase error', error); 
        return null; 
      }
      return data || [];
    } catch(e) { 
      console.error(e); 
      return null; 
    }
  }

  async loadLocalJson(path) {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
      }
      return await res.json();
    } catch (e) {
      console.error('local load failed', path, e);
      return [];
    }
  }

  async loadVehicles(type) {
    // Сначала пытаемся загрузить из Supabase
    const supaData = await this.loadVehiclesFromSupabase(type);
    if (supaData && supaData.length) {return supaData;}

    // Фоллбек — локальный JSON
    try {
      const response = await fetch(`${this.basePath}/vehicles/${type}.json`);
      if (!response.ok) {throw new Error(`Failed to load ${type} vehicles`);}
      const data = await response.json();
      return data.vehicles || [];
    } catch (error) {
      console.error('Error loading vehicles:', error);
      return [];
    }
  }

  async loadCategories(type) {
    try {
      const response = await fetch(`${this.basePath}/categories/${type}-types.json`);
      if (!response.ok) {throw new Error(`Failed to load ${type} categories`);}
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  }

  async loadVehicleById(id) {
    // Сначала ищем в Supabase
    if (this.useSupabase && this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient
          .from('vehicles')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase search failed, falling back to local', e);
      }
    }

    // Фоллбек — поиск по локальным файлам
    const types = ['ground', 'air', 'naval'];
    
    for (let type of types) {
      const vehicles = await this.loadVehicles(type);
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        vehicle.type = type; // Добавляем тип для детальной страницы
        return vehicle;
      }
    }
    
    return null;
  }
}

// Создаём глобальный экземпляр
window.dataLoader = new DataLoader();
