// Catalog functionality for ground vehicles page - UPDATED

// escapeHtml: moved to `src/js/utils.js` and exposed as global `escapeHtml`

class VehicleCatalog {
    constructor() {
        this.vehicles = [];
        this.filteredVehicles = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            search: '',
            type: 'all',
            country: 'all',
            era: 'all',
            yearFrom: '',
            yearTo: '',
            caliber: 'all',
            crew: 'all',
            weight: 'all'
        };
        this.sortBy = 'name';
        this.viewMode = 'grid';
        this.filtersVisible = false;
        
        this.init();
    }

    async init() {
        await this.loadVehicles(); // Делаем асинхронным
        this.bindEvents();
        this.applyFilters();
        this.toggleFilters(false); // Start with filters collapsed
    }

    // ЗАМЕНЯЕМ старый метод загрузки на новый
    async loadVehicles() {
        try {
            const loader = window.dataLoader;
            this.vehicles = await loader.loadVehicles('ground');
            
            // Логируем для проверки
            console.log('📦 Загружено из JSON:', this.vehicles.length, 'единиц');
            
            this.displayVehicles();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Fallback - можно оставить старые данные на случай ошибки
            this.loadVehiclesFallback();
        }
    }

    // Fallback метод на случай проблем
    loadVehiclesFallback() {
        console.log('Используем fallback данные...');
        // Твои старые данные из catalog.js
        this.vehicles = [
            {
                id: "t-72b3",
                name: "Т-72Б3",
                country: "russia",
                category: "mbt",
                era: "modern",
                year: 2016,
                specs: {
                    weight: 46,
                    crew: 3,
                    caliber: 125,
                    speed: 60,
                    engine: "В-84-1, 840 л.с.",
                    armor: "Комбинированная",
                    mainGun: "125mm 2A46M"
                },
                description: "Современная модернизация основного боевого танка Т-72 с улучшенной защитой и системами управления огнём."
            },
            {
                id: "m1a2-abrams",
                name: "M1A2 Abrams",
                country: "usa",
                category: "mbt",
                era: "modern",
                year: 1992,
                specs: {
                    weight: 63,
                    crew: 4,
                    caliber: 120,
                    speed: 67,
                    engine: "AGT-1500, 1500 л.с.",
                    armor: "Композитная",
                    mainGun: "120mm M256"
                },
                description: "Американский основной боевой танк третьего поколения с цифровой системой управления."
            },
            {
                id: "leopard-2a7",
                name: "Leopard 2A7",
                country: "germany",
                category: "mbt",
                era: "modern",
                year: 2014,
                specs: {
                    weight: 67,
                    crew: 4,
                    caliber: 120,
                    speed: 72,
                    engine: "MTU MB 873, 1500 л.с.",
                    armor: "Композитная",
                    mainGun: "120mm Rh-120"
                },
                description: "Немецкий основной боевой танк, считающийся одним из лучших в мире."
            },
            {
                id: "amx-13",
                name: "AMX-13",
                country: "france",
                category: "light-tank",
                era: "cold-war",
                year: 1953,
                specs: {
                    weight: 15,
                    crew: 3,
                    caliber: 75,
                    speed: 60,
                    engine: "SOFAM 8Gxb, 250 л.с.",
                    armor: "Противоосколочная",
                    mainGun: "75mm CN-75-50"
                },
                description: "Французский лёгкий танк с качающейся башней и автоматом заряжания."
            },
            {
                id: "t-34-85",
                name: "Т-34-85",
                country: "russia",
                category: "medium-tank",
                era: "ww2",
                year: 1944,
                specs: {
                    weight: 32,
                    crew: 5,
                    caliber: 85,
                    speed: 55,
                    engine: "В-2-34, 500 л.с.",
                    armor: "Катаная сталь",
                    mainGun: "85mm ЗИС-С-53"
                },
                description: "Легендарный советский средний танк времён Второй мировой войны."
            },
            {
                id: "tiger-i",
                name: "Tiger I",
                country: "germany",
                category: "heavy-tank",
                era: "ww2",
                year: 1942,
                specs: {
                    weight: 57,
                    crew: 5,
                    caliber: 88,
                    speed: 45,
                    engine: "Maybach HL230, 700 л.с.",
                    armor: "Катаная сталь",
                    mainGun: "88mm KwK 36"
                },
                description: "Немецкий тяжёлый танк, один из самых известных танков Второй мировой."
            },
            {
                id: "bmp-3",
                name: "БМП-3",
                country: "russia",
                category: "ifv",
                era: "cold-war",
                year: 1987,
                specs: {
                    weight: 18,
                    crew: 3,
                    caliber: 100,
                    speed: 70,
                    engine: "УТД-29, 500 л.с.",
                    armor: "Алюминиевая",
                    mainGun: "100mm 2A70"
                },
                description: "Боевая машина пехоты с уникальным комплексом вооружения."
            }
        ];
        this.displayVehicles();
    }

    bindEvents() {
        // Toggle filters visibility
        document.getElementById('filtersToggle').addEventListener('click', () => {
            this.toggleFilters();
        });

        // Search filter
        document.getElementById('searchFilter').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        });

        // Type filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.filters.type = e.target.dataset.type;
                this.applyFilters();
            });
        });

        // Select filters
        ['country', 'era', 'caliber', 'crew', 'weight'].forEach(filter => {
            const element = document.getElementById(filter + 'Filter');
            if (element) {
                element.addEventListener('change', (e) => {
                    this.filters[filter] = e.target.value;
                    this.applyFilters();
                });
            }
        });

        // Year range filters
        ['yearFrom', 'yearTo'].forEach(filter => {
            const element = document.getElementById(filter);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.filters[filter] = e.target.value;
                    this.applyFilters();
                });
            }
        });

        // Sort control
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.viewMode = e.target.dataset.view;
                this.updateViewMode();
            });
        });

        // Advanced filters toggle
        const advancedToggle = document.getElementById('advancedToggle');
        if (advancedToggle) {
            advancedToggle.addEventListener('click', (e) => {
                e.target.classList.toggle('active');
                document.getElementById('advancedFilters').classList.toggle('active');
            });
        }

        // Clear filters
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Reset search
        const resetSearch = document.getElementById('resetSearch');
        if (resetSearch) {
            resetSearch.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Load more
        const loadMore = document.getElementById('loadMore');
        if (loadMore) {
            loadMore.addEventListener('click', () => {
                this.loadMore();
            });
        }

        // Quick view modal
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal on backdrop click
        const modal = document.getElementById('quickViewModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'quickViewModal') {
                    this.closeModal();
                }
            });
        }
    }

    toggleFilters(show) {
        this.filtersVisible = show !== undefined ? show : !this.filtersVisible;
        const container = document.querySelector('.filters-container');
        const toggle = document.getElementById('filtersToggle');
        
        if (this.filtersVisible) {
            container.classList.add('active');
            toggle.classList.add('active');
            toggle.innerHTML = '<span>Скрыть фильтры</span><span class="toggle-icon">▼</span>';
        } else {
            container.classList.remove('active');
            toggle.classList.remove('active');
            toggle.innerHTML = '<span>Показать фильтры</span><span class="toggle-icon">▼</span>';
        }
    }

    applyFilters() {
        this.currentPage = 1;
        this.filteredVehicles = this.vehicles.filter(vehicle => {
            return this.matchesFilters(vehicle);
        });

        this.sortVehicles();
        this.updateActiveFilters();
        this.displayVehicles();
    }

    matchesFilters(vehicle) {
        // Search filter
        if (this.filters.search && !vehicle.name.toLowerCase().includes(this.filters.search.toLowerCase())) {
            return false;
        }

        // Type filter (используем category вместо type)
        if (this.filters.type !== 'all' && vehicle.category !== this.filters.type) {
            return false;
        }

        // Country filter
        if (this.filters.country !== 'all' && vehicle.country !== this.filters.country) {
            return false;
        }

        // Era filter
        if (this.filters.era !== 'all' && vehicle.era !== this.filters.era) {
            return false;
        }

        // Year range filter
        if (this.filters.yearFrom && vehicle.year < parseInt(this.filters.yearFrom)) {
            return false;
        }
        if (this.filters.yearTo && vehicle.year > parseInt(this.filters.yearTo)) {
            return false;
        }

        // Caliber filter (используем vehicle.specs.caliber)
        if (this.filters.caliber !== 'all') {
            const caliber = vehicle.specs.caliber;
            switch (this.filters.caliber) {
                case 'small': if (caliber > 75) {return false;} break;
                case 'medium': if (caliber <= 75 || caliber > 105) {return false;} break;
                case 'large': if (caliber <= 105 || caliber > 125) {return false;} break;
                case 'very-large': if (caliber <= 125) {return false;} break;
            }
        }

        // Crew filter (используем vehicle.specs.crew)
        if (this.filters.crew !== 'all') {
            const crew = vehicle.specs.crew;
            switch (this.filters.crew) {
                case '1-2': if (crew > 2) {return false;} break;
                case '3-4': if (crew < 3 || crew > 4) {return false;} break;
                case '5+': if (crew < 5) {return false;} break;
            }
        }

        // Weight filter (используем vehicle.specs.weight)
        if (this.filters.weight !== 'all') {
            const weight = vehicle.specs.weight;
            switch (this.filters.weight) {
                case 'light': if (weight > 20) {return false;} break;
                case 'medium': if (weight <= 20 || weight > 40) {return false;} break;
                case 'heavy': if (weight <= 40 || weight > 60) {return false;} break;
                case 'super-heavy': if (weight <= 60) {return false;} break;
            }
        }

        return true;
    }

    sortVehicles() {
        this.filteredVehicles.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'year':
                    return a.year - b.year;
                case 'year-desc':
                    return b.year - a.year;
                case 'weight':
                    return a.specs.weight - b.specs.weight;
                case 'weight-desc':
                    return b.specs.weight - a.specs.weight;
                default:
                    return 0;
            }
        });
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        if (!activeFiltersContainer) {return;}

        activeFiltersContainer.innerHTML = '';

        Object.entries(this.filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                const filterElement = document.createElement('div');
                filterElement.className = 'active-filter';
                
                let label = '';
                switch (key) {
                    case 'search':
                        if (!value) {return;}
                        label = `Поиск: "${value}"`;
                        break;
                    case 'type':
                        label = `Тип: ${this.getTypeLabel(value)}`;
                        break;
                    case 'country':
                        label = `Страна: ${this.getCountryLabel(value)}`;
                        break;
                    case 'era':
                        label = `Период: ${this.getEraLabel(value)}`;
                        break;
                    case 'yearFrom':
                        label = `Год от: ${value}`;
                        break;
                    case 'yearTo':
                        label = `Год до: ${value}`;
                        break;
                    case 'caliber':
                        label = `Калибр: ${this.getCaliberLabel(value)}`;
                        break;
                    case 'crew':
                        label = `Экипаж: ${this.getCrewLabel(value)}`;
                        break;
                    case 'weight':
                        label = `Масса: ${this.getWeightLabel(value)}`;
                        break;
                }

                if (label) {
                    filterElement.innerHTML = `
                        ${label}
                        <button type="button" class="active-filter-remove" data-filter="${key}">×</button>
                    `;
                    activeFiltersContainer.appendChild(filterElement);
                }
            }
        });

        // Add remove event listeners
        document.querySelectorAll('.active-filter-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.removeFilter(filter);
            });
        });
    }

    removeFilter(filter) {
        switch (filter) {
            case 'search':
                this.filters.search = '';
                document.getElementById('searchFilter').value = '';
                break;
            case 'type':
                this.filters.type = 'all';
                document.querySelectorAll('.filter-chip').forEach(chip => {
                    chip.classList.remove('active');
                    if (chip.dataset.type === 'all') {chip.classList.add('active');}
                });
                break;
            case 'country':
            case 'era':
            case 'caliber':
            case 'crew':
            case 'weight':
                {
                    this.filters[filter] = 'all';
                    const filterElement = document.getElementById(filter + 'Filter');
                    if (filterElement) { filterElement.value = 'all'; }
                }
                break;
            case 'yearFrom':
                this.filters.yearFrom = '';
                document.getElementById('yearFrom').value = '';
                break;
            case 'yearTo':
                this.filters.yearTo = '';
                document.getElementById('yearTo').value = '';
                break;
        }
        this.applyFilters();
    }

    clearFilters() {
        this.filters = {
            search: '',
            type: 'all',
            country: 'all',
            era: 'all',
            yearFrom: '',
            yearTo: '',
            caliber: 'all',
            crew: 'all',
            weight: 'all'
        };

        // Reset UI
        document.getElementById('searchFilter').value = '';
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
            if (chip.dataset.type === 'all') {chip.classList.add('active');}
        });
        
        const filtersToReset = ['country', 'era', 'caliber', 'crew', 'weight'];
        filtersToReset.forEach(filter => {
            const element = document.getElementById(filter + 'Filter');
            if (element) {element.value = 'all';}
        });
        
        document.getElementById('yearFrom').value = '';
        document.getElementById('yearTo').value = '';

        this.applyFilters();
    }

    displayVehicles() {
        const grid = document.getElementById('vehiclesGrid');
        const resultsCount = document.getElementById('resultsCount');
        const noResults = document.getElementById('noResults');
        const loadingState = document.getElementById('loadingState');

        if (!grid) {return;}

        // Hide loading, show appropriate state
        if (loadingState) {loadingState.style.display = 'none';}

        if (this.filteredVehicles.length === 0) {
            grid.style.display = 'none';
            if (noResults) {noResults.style.display = 'block';}
            if (resultsCount) {resultsCount.textContent = '0';}
            return;
        }

        if (noResults) {noResults.style.display = 'none';}
        grid.style.display = 'grid';
        if (resultsCount) {resultsCount.textContent = this.filteredVehicles.length;}

        // Get current page items
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentVehicles = this.filteredVehicles.slice(0, endIndex);

        grid.innerHTML = currentVehicles.map(vehicle => this.createVehicleCard(vehicle)).join('');

        // Update load more button
        const loadMoreBtn = document.getElementById('loadMore');
        if (loadMoreBtn) {
            if (endIndex >= this.filteredVehicles.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'block';
            }
        }

        // Add click events to new cards
        this.bindVehicleCardEvents();
    }

    createVehicleCard(vehicle) {
        const typeLabel = this.getTypeLabel(vehicle.category); // меняем vehicle.type на vehicle.category
        const countryLabel = this.getCountryLabel(vehicle.country);
        // Экранируем все текстовые поля, чтобы предотвратить XSS при вставке данных из внешних источников
        const vId = encodeURIComponent(vehicle.id);
        const name = escapeHtml(vehicle.name);
        const desc = escapeHtml(vehicle.description);
        const weight = escapeHtml(vehicle.specs.weight);
        const crew = escapeHtml(vehicle.specs.crew);
        const caliber = escapeHtml(vehicle.specs.caliber);
        const speed = escapeHtml(vehicle.specs.speed);

        return `
            <div class="vehicle-card" data-vehicle-id="${vId}">
                <div class="vehicle-badge">${escapeHtml(countryLabel)}</div>
                <div class="vehicle-image">
                    <div class="vehicle-image-placeholder">
                        ${name}
                    </div>
                </div>
                <div class="vehicle-content">
                    <div class="vehicle-header">
                        <h3 class="vehicle-title">${name}</h3>
                    </div>
                    <div class="vehicle-country">${escapeHtml(countryLabel)} • ${escapeHtml(vehicle.year)}</div>
                    <div class="vehicle-type">${escapeHtml(typeLabel)}</div>
                    
                    <div class="vehicle-specs">
                        <div class="vehicle-spec">
                            <span class="spec-label">Масса</span>
                            <span class="spec-value">${weight}т</span>
                        </div>
                        <div class="vehicle-spec">
                            <span class="spec-label">Экипаж</span>
                            <span class="spec-value">${crew}</span>
                        </div>
                        <div class="vehicle-spec">
                            <span class="spec-label">Калибр</span>
                            <span class="spec-value">${caliber}мм</span>
                        </div>
                        <div class="vehicle-spec">
                            <span class="spec-label">Скорость</span>
                            <span class="spec-value">${speed}км/ч</span>
                        </div>
                    </div>
                    
                    <p class="vehicle-description">${desc}</p>
                    
                    <div class="vehicle-actions">
                        <button type="button" class="vehicle-btn quick-view-btn" data-vehicle-id="${vId}">
                            Быстрый просмотр
                        </button>
                        <a href="vehicle-details.html?id=${vId}" class="vehicle-btn secondary">
                            Подробнее
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    bindVehicleCardEvents() {
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const vehicleId = e.target.dataset.vehicleId;
                this.showQuickView(vehicleId);
            });
        });

        document.querySelectorAll('.vehicle-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('vehicle-btn')) {
                    const vehicleId = card.dataset.vehicleId;
                    // Navigate to detail page
                    window.location.href = `../vehicle-details.html?id=${vehicleId}`;
                }
            });
        });
    }

    showQuickView(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) {return;}

        const modalBody = document.getElementById('modalBody');
        if (!modalBody) {return;}

        modalBody.innerHTML = this.createQuickViewContent(vehicle);

        // Навешиваем безопасный обработчик для кнопки закрытия (замена inline onclick)
        const closeBtn = modalBody.querySelector('.close-modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        document.getElementById('quickViewModal').classList.add('active');
    }

    createQuickViewContent(vehicle) {
        const typeLabel = this.getTypeLabel(vehicle.category); // меняем vehicle.type на vehicle.category
        const countryLabel = this.getCountryLabel(vehicle.country);

        return `
            <div class="quick-view">
                <div class="quick-view-image">
                    <div class="vehicle-image-placeholder large">
                        ${vehicle.name}
                    </div>
                </div>
                <div class="quick-view-content">
                    <h2>${vehicle.name}</h2>
                    <div class="quick-view-meta">
                        <span class="meta-item">${countryLabel}</span>
                        <span class="meta-item">${vehicle.year} год</span>
                        <span class="meta-item">${typeLabel}</span>
                    </div>
                    
                    <div class="quick-view-specs">
                        <div class="spec-row">
                            <span class="spec-name">Экипаж:</span>
                            <span class="spec-value">${vehicle.specs.crew} человека</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-name">Боевая масса:</span>
                            <span class="spec-value">${vehicle.specs.weight} тонн</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-name">Основное вооружение:</span>
                            <span class="spec-value">${vehicle.specs.mainGun}</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-name">Двигатель:</span>
                            <span class="spec-value">${vehicle.specs.engine}</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-name">Макс. скорость:</span>
                            <span class="spec-value">${vehicle.specs.speed} км/ч</span>
                        </div>
                        <div class="spec-row">
                            <span class="spec-name">Бронирование:</span>
                            <span class="spec-value">${vehicle.specs.armor}</span>
                        </div>
                    </div>
                    
                    <p class="quick-view-description">${escapeHtml(vehicle.description)}</p>
                    
                    <div class="quick-view-actions">
                        <a href="../vehicle-details.html?id=${encodeURIComponent(vehicle.id)}" class="vehicle-btn">
                            Полное описание
                        </a>
                        <button type="button" class="vehicle-btn secondary close-modal-btn">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    closeModal() {
        document.getElementById('quickViewModal').classList.remove('active');
    }

    updateViewMode() {
        const grid = document.getElementById('vehiclesGrid');
        if (grid) {
            grid.className = `vehicles-grid ${this.viewMode}-view`;
        }
    }

    loadMore() {
        this.currentPage++;
        this.displayVehicles();
    }

    // Helper methods for labels
    getTypeLabel(type) {
        const types = {
            'mbt': 'ОБТ',
            'light-tank': 'Лёгкий танк',
            'medium-tank': 'Средний танк',
            'heavy-tank': 'Тяжёлый танк',
            'ifv': 'БМП',
            'apc': 'БТР',
            'spg': 'САУ',
            'brdm': 'БРДМ',
            'bmd': 'БМД',
            'cbrn': 'РХБЗ',
            'engineer': 'ИРМ',
            'spaag': 'ЗСУ',
            'recovery': 'МТО'
        };
        return types[type] || type;
    }

    getCountryLabel(country) {
        const countries = {
            'ussr': 'СССР/Россия',
            'russia': 'Россия',
            'usa': 'США',
            'germany': 'Германия',
            'uk': 'Великобритания',
            'france': 'Франция',
            'china': 'Китай',
            'japan': 'Япония',
            'israel': 'Израиль',
            'sweden': 'Швеция'
        };
        return countries[country] || country;
    }

    getEraLabel(era) {
        const eras = {
            'ww2': 'Вторая мировая',
            'cold-war': 'Холодная война',
            'modern': 'Современность'
        };
        return eras[era] || era;
    }

    getCaliberLabel(caliber) {
        const calibers = {
            'small': 'до 75мм',
            'medium': '76-105мм',
            'large': '106-125мм',
            'very-large': '126мм+'
        };
        return calibers[caliber] || caliber;
    }

    getCrewLabel(crew) {
        const crews = {
            '1-2': '1-2 человека',
            '3-4': '3-4 человека',
            '5+': '5+ человек'
        };
        return crews[crew] || crew;
    }

    getWeightLabel(weight) {
        const weights = {
            'light': 'до 20т',
            'medium': '20-40т',
            'heavy': '40-60т',
            'super-heavy': '60т+'
        };
        return weights[weight] || weight;
    }
}

// Initialize catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catalog = new VehicleCatalog();
});
