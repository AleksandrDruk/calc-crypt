// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем сохраненный символ или используем BTCUSDT по умолчанию
    const savedSymbol = localStorage.getItem('selectedSymbol') || 'BINANCE:BTCUSDT';

    const widget = new TradingView.widget({
        container_id: "chart",
        autosize: true,
        symbol: savedSymbol,
        interval: "60",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "ru",
        toolbar_bg: "#131722",
        enable_publishing: false,
        allow_symbol_change: true,
        hide_side_toolbar: false,
        hide_legend: true,
        hide_top_toolbar: false,
        width: "100%",
        height: "100%",
        enabled_features: [
            "header_widget",
            "header_symbol_search",
            "header_chart_type",
            "volume_force_overlay"
        ],
        disabled_features: [
            "header_saveload",
            "header_screenshot",
            "widget_logo"
        ],
        overrides: {
            "mainSeriesProperties.style": 1,
            "mainSeriesProperties.candleStyle.upColor": "#26a69a",
            "mainSeriesProperties.candleStyle.downColor": "#ef5350",
            "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
            "paneProperties.background": "#131722",
            "paneProperties.vertGridProperties.color": "#363c4e",
            "paneProperties.horzGridProperties.color": "#363c4e",
            "volumePaneSize": "medium"
        },
        saved_data: {
            content: savedSymbol,
            onChange: function(content) {
                localStorage.setItem('selectedSymbol', content);
            }
        }
    });

    // Добавляем функционал изменения размера
    const wrapper = document.getElementById('chart-wrapper');
    const resizeHandle = document.createElement('div');

    // Стили для маркера изменения размера
    resizeHandle.style.cssText = `
        position: absolute;
        left: 0;
        bottom: 0;
        width: 20px;
        height: 20px;
        cursor: sw-resize;
        background: #374151;
        border: 2px solid #4B5563;
        border-radius: 0 0 0 8px;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // Добавляем дополнительный элемент для визуального индикатора
    const resizeIcon = document.createElement('div');
    resizeIcon.style.cssText = `
        width: 8px;
        height: 8px;
        border-left: 2px solid #9CA3AF;
        border-bottom: 2px solid #9CA3AF;
        margin-top: -4px;
        margin-right: -4px;
    `;

    resizeHandle.appendChild(resizeIcon);

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
            saveChartSize(wrapper.offsetWidth, wrapper.offsetHeight);
        }
    });

    // Загружаем сохраненные размеры при старте
    loadChartSize();

    // Элементы форм и настроек
    const settingsForm = document.getElementById('settingsForm');
    const defaultBalanceInput = document.getElementById('defaultBalance');
    const defaultRiskInput = document.getElementById('defaultRisk');
    const balanceInput = document.getElementById('balance');
    const riskLevelInput = document.getElementById('riskLevel');
    const resetAllButton = document.getElementById('resetAll');

    // Элементы калькулятора позиции
    const positionForm = document.getElementById('positionSizeForm');
    const positionResult = document.getElementById('positionResult');
    const lossAmountSpan = document.getElementById('lossAmount');
    const positionSizeSpan = document.getElementById('positionSize');
    const stopLossInput = document.getElementById('stopLoss');

    // Функция для загрузки настроек
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

    // Сохранение настроек
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = {
            balance: parseFloat(defaultBalanceInput.value.replace(',', '.')) || 0,
            risk: parseFloat(defaultRiskInput.value.replace(',', '.')) || 0
        };
        localStorage.setItem('tradeSettings', JSON.stringify(settings));
        balanceInput.value = settings.balance;
        riskLevelInput.value = settings.risk;
        alert('Настройки сохранены');
    });

    // Функция расчета позиции
    function calculatePosition() {
        const balance = parseFloat(balanceInput.value.replace(',', '.')) || 0;
        const stopLoss = parseFloat(stopLossInput.value.replace(',', '.')) || 0;
        const riskPercent = parseFloat(riskLevelInput.value.replace(',', '.')) || 0;

        if (balance > 0 && stopLoss > 0 && riskPercent > 0) {
            const riskAmount = (balance * riskPercent) / 100;
            const positionSize = (riskAmount / stopLoss) * 100;

            lossAmountSpan.textContent = riskAmount.toFixed(2) + ' USDT';
            positionSizeSpan.textContent = positionSize.toFixed(2) + ' USDT';
            positionResult.classList.remove('hidden');
        }
    }

    // Обработчики событий для калькулятора
    [balanceInput, stopLossInput, riskLevelInput].forEach(input => {
        input.addEventListener('input', (e) => {
            if (e.target.value.includes(',')) {
                e.target.value = e.target.value.replace(',', '.');
            }
            calculatePosition();
        });
    });

    // Сброс всех полей
    resetAllButton.addEventListener('click', () => {
        if (confirm('Сбросить все поля?')) {
            positionForm.reset();
            positionResult.classList.add('hidden');
        }
    });

    // Загружаем настройки при старте
    loadSettings();

    // После инициализации виджета
    widget.onChartReady(() => {
        const chart = widget.chart();
        
        // Подписываемся на события рисования
        chart.onDrawingComplete((drawing) => {
            if (drawing && drawing.points && drawing.points.length >= 2) {
                const entryPrice = drawing.points[0].price;
                const stopPrice = drawing.points[1].price;
                
                // Заполняем поля калькулятора
                if (entryPriceInput && stopLossInput) {
                    entryPriceInput.value = entryPrice.toFixed(2);
                    stopLossInput.value = stopPrice.toFixed(2);
                    
                    // Вызываем пересчет
                    calculatePosition();
                }
            }
        });
    });
}); 
