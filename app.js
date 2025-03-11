// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Элементы форм и настроек
    const settingsForm = document.getElementById('settingsForm');
    const defaultBalanceInput = document.getElementById('defaultBalance');
    const defaultRiskInput = document.getElementById('defaultRisk');
    const balanceInput = document.getElementById('balance');
    const riskLevelInput = document.getElementById('riskLevel');
    const resetAllButton = document.getElementById('resetAll');
    const wrapper = document.getElementById('tradingview_6f5db-wrapper');
    const resizeHandle = document.createElement('div');

    // Инициализация TradingView
    const widget = new TradingView.widget({
        container_id: "tradingview_6f5db",
        autosize: true,
        symbol: "BINANCE:BTCUSDT",
        interval: "60",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "ru",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        hideideas: true,
        width: "100%",
        height: "100%",
        defaultExchange: "BINANCE",
        studies: []
    });

    // Стили для маркера изменения размера
    resizeHandle.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 20px;
        height: 20px;
        cursor: se-resize;
        background: #374151;
        border-radius: 0 0 8px 0;
        z-index: 9999;
    `;

    wrapper.style.position = 'relative';
    wrapper.appendChild(resizeHandle);

    let isResizing = false;
    let originalWidth;
    let originalHeight;
    let originalX;
    let originalY;

    // Функции для работы с размерами
    function saveChartSize(width, height) {
        localStorage.setItem('chartSize', JSON.stringify({ width, height }));
    }

    function loadChartSize() {
        const size = JSON.parse(localStorage.getItem('chartSize'));
        if (size) {
            wrapper.style.width = size.width + 'px';
            wrapper.style.height = size.height + 'px';
        }
    }

    function updateChartSize() {
        const width = wrapper.offsetWidth;
        const height = wrapper.offsetHeight;
        console.log('Updating chart size:', width, height);
        widget.applyOptions({
            width: width,
            height: height
        });
        widget.timeScale().fitContent();
    }

    // Функция для загрузки и сохранения настроек
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('tradeSettings') || '{}');
        if (settings.balance) {
            defaultBalanceInput.value = settings.balance;
            balanceInput.value = settings.balance;
        }
        if (settings.risk) {
            defaultRiskInput.value = settings.risk;
            riskLevelInput.value = settings.risk;
        }
    }

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = {
            balance: parseFloat(defaultBalanceInput.value),
            risk: parseFloat(defaultRiskInput.value)
        };
        localStorage.setItem('tradeSettings', JSON.stringify(settings));
        balanceInput.value = settings.balance;
        riskLevelInput.value = settings.risk;
        alert('Настройки сохранены');
    });

    // Загружаем настройки при старте
    loadSettings();
    loadChartSize();

    // Обработчики событий для изменения размера
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        originalWidth = wrapper.offsetWidth;
        originalHeight = wrapper.offsetHeight;
        originalX = e.pageX;
        originalY = e.pageY;
        wrapper.style.pointerEvents = 'none';
        resizeHandle.style.background = '#059669';
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const width = originalWidth + (e.pageX - originalX);
        const height = originalHeight + (e.pageY - originalY);
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (width > 400 && width < windowWidth - 40) {
            wrapper.style.width = width + 'px';
        }
        if (height > 400 && height < windowHeight - 40) {
            wrapper.style.height = height + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            wrapper.style.pointerEvents = 'auto';
            resizeHandle.style.background = '#374151';
            // Сохраняем размеры
            saveChartSize(wrapper.offsetWidth, wrapper.offsetHeight);
        }
    });

    // Добавим обработчик изменения размера окна
    window.addEventListener('resize', () => {
        if (widget) {
            updateChartSize();
        }
    });
}); 
