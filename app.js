// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Элементы форм и настроек
    const settingsForm = document.getElementById('settingsForm');
    const defaultBalanceInput = document.getElementById('defaultBalance');
    const defaultRiskInput = document.getElementById('defaultRisk');
    const balanceInput = document.getElementById('balance');
    const riskLevelInput = document.getElementById('riskLevel');
    const resetAllButton = document.getElementById('resetAll');

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

    // Калькулятор размера позиции
    const positionForm = document.getElementById('positionSizeForm');
    const positionResult = document.getElementById('positionResult');
    const lossAmountSpan = document.getElementById('lossAmount');
    const positionSizeSpan = document.getElementById('positionSize');
    const stopLossInput = document.getElementById('stopLoss');

    // Функция для расчета процента стоп-лосса
    function calculateStopLoss(entry, stop, isLong) {
        if (isLong) {
            return ((entry - stop) / entry) * 100;
        } else {
            return ((stop - entry) / entry) * 100;
        }
    }

    // Функция для обновления индикатора типа позиции
    function updatePositionType(entryPrice, targetPrice) {
        const positionType = document.getElementById('positionType');
        const longIndicator = document.getElementById('longIndicator');
        const shortIndicator = document.getElementById('shortIndicator');

        if (!entryPrice || !targetPrice) {
            positionType.classList.add('hidden');
            return;
        }

        positionType.classList.remove('hidden');
        const isLong = targetPrice > entryPrice;

        if (isLong) {
            longIndicator.classList.remove('hidden');
            shortIndicator.classList.add('hidden');
        } else {
            longIndicator.classList.add('hidden');
            shortIndicator.classList.remove('hidden');
        }
    }

    // Обновить обработчики ввода для цен
    ['entryPrice', 'targetPrice', 'stopPrice'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const entryPrice = parseFloat(document.getElementById('entryPrice').value);
            const targetPrice = parseFloat(document.getElementById('targetPrice').value);
            const stopPrice = parseFloat(document.getElementById('stopPrice').value);

            updatePositionType(entryPrice, targetPrice);

            if (entryPrice && stopPrice) {
                const isLong = targetPrice ? targetPrice > entryPrice : entryPrice > stopPrice;
                const stopLossPercent = calculateStopLoss(entryPrice, stopPrice, isLong);
                stopLossInput.value = stopLossPercent.toFixed(2);
                // Добавляем вызов расчета позиции при обновлении стоп-лосса
                calculatePosition();
            }
            
            // Вызываем расчет риск/прибыль
            calculateRiskReward();
        });
    });

    // Добавим функции для расчетов
    function calculatePosition() {
        const balance = parseFloat(balanceInput.value);
        const stopLoss = parseFloat(stopLossInput.value);
        const riskLevel = parseFloat(riskLevelInput.value);

        if (!balance || !stopLoss || !riskLevel) {
            positionResult.classList.add('hidden');
            return;
        }

        const lossAmount = (balance * riskLevel) / 100;
        const positionSize = (lossAmount / stopLoss) * 100;

        lossAmountSpan.textContent = `${lossAmount.toFixed(2)} USDT`;
        positionSizeSpan.textContent = `${positionSize.toFixed(2)} USDT`;
        positionResult.classList.remove('hidden');
    }

    function calculateRiskReward() {
        const entryPrice = parseFloat(document.getElementById('entryPrice').value);
        const targetPrice = parseFloat(document.getElementById('targetPrice').value);
        const stopPrice = parseFloat(document.getElementById('stopPrice').value);

        if (!entryPrice || !targetPrice || !stopPrice) {
            document.getElementById('riskRewardResult').classList.add('hidden');
            return;
        }

        const isLong = targetPrice > entryPrice;
        updatePositionType(entryPrice, targetPrice);

        const targetPercent = isLong 
            ? ((targetPrice - entryPrice) / entryPrice) * 100
            : ((entryPrice - targetPrice) / entryPrice) * 100;

        const stopPercent = calculateStopLoss(entryPrice, stopPrice, isLong);
        const riskReward = targetPercent / stopPercent;

        stopLossInput.value = stopPercent.toFixed(2);

        document.getElementById('targetPercent').textContent = `${targetPercent.toFixed(2)}%`;
        document.getElementById('stopPercent').textContent = `${stopPercent.toFixed(2)}%`;
        document.getElementById('riskReward').textContent = `${riskReward.toFixed(2)} (1:${Math.round(riskReward)})`;
        document.getElementById('targetPrice').textContent = `(${targetPrice.toFixed(4)} USDT)`;
        document.getElementById('stopPriceDisplay').textContent = `(${stopPrice.toFixed(4)} USDT)`;

        document.getElementById('riskRewardResult').classList.remove('hidden');
    }

    // Обновить обработчики для полей калькулятора позиции
    ['balance', 'stopLoss', 'riskLevel'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            calculatePosition();
            // Если стоп-лосс изменился, пересчитываем риск/прибыль
            if (id === 'stopLoss') {
                calculateRiskReward();
            }
        });
    });

    // Сброс всех полей
    resetAllButton.addEventListener('click', () => {
        if (confirm('Сбросить все поля?')) {
            positionForm.reset();
            positionResult.classList.add('hidden');
            document.getElementById('riskRewardResult').classList.add('hidden');
            document.getElementById('positionType').classList.add('hidden');
        }
    });

    // Загружаем настройки при старте
    loadSettings();
}); 
