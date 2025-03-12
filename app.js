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
        right: -2px;
        bottom: -2px;
        width: 16px;
        height: 16px;
        cursor: se-resize;
        background: #374151;
        border: 2px solid #4B5563;
        border-radius: 0 0 8px 0;
        z-index: 9999;
    `;

    // Добавляем дополнительный элемент для визуального индикатора
    const resizeIcon = document.createElement('div');
    resizeIcon.style.cssText = `
        position: absolute;
        right: 3px;
        bottom: 3px;
        width: 6px;
        height: 6px;
        border-right: 2px solid #9CA3AF;
        border-bottom: 2px solid #9CA3AF;
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

    // После инициализации виджета
    widget.onChartReady(() => {
        // Подписываемся на события рисования
        widget.chart().subscribe('drawing', (params) => {
            if (params.drawing) {
                const drawingData = params.drawing;
                
                // Проверяем, что это позиция (long/short)
                if (drawingData.type === 'position') {
                    const entryPrice = drawingData.points[0].price;
                    const stopPrice = drawingData.points[1].price;
                    
                    // Находим элементы калькулятора
                    const entryInput = document.getElementById('entryPrice');
                    const stopInput = document.getElementById('stopLoss');
                    
                    // Устанавливаем значения
                    if (entryInput && stopInput) {
                        entryInput.value = entryPrice;
                        stopInput.value = stopPrice;
                        
                        // Вызываем пересчет калькулятора
                        calculatePosition();
                        calculateRiskReward();
                    }
                }
            }
        });
    });
}); 
