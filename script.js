function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.nav-tabs button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(`${tab}-tab`).classList.add('active');
    document.querySelector(`.nav-tabs button:nth-child(${tab === 'calculator' ? '1' : '2'})`).classList.add('active');
}

function formatNumber(value) {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(value);
}

function updateCalculations() {
    const amount = parseFloat(document.getElementById('trading-amount').value) || 0;
    const targetPercent = parseFloat(document.getElementById('target-percent').value);
    const stopLossPercent = parseFloat(document.getElementById('stop-loss-percent').value);

    const targetValue = document.getElementById('target-value');
    const stopLossValue = document.getElementById('stop-loss-value');

    if (amount) {
        const targetAmount = (amount * targetPercent / 100);
        const stopLossAmount = (amount * stopLossPercent / 100);
        targetValue.textContent = `₹${formatNumber(targetAmount)}`;
        stopLossValue.textContent = `₹${formatNumber(stopLossAmount)}`;
    } else {
        targetValue.textContent = '-';
        stopLossValue.textContent = '-';
    }

    simulateTrades();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function simulateTrades() {
    const FIXED_AMOUNT = 9500;
    const targetPercent = parseFloat(document.getElementById('target-percent').value) / 100;
    const stopLossPercent = parseFloat(document.getElementById('stop-loss-percent').value) / 100;
    
    const tbody = document.querySelector('#trade-table tbody');
    tbody.innerHTML = '';
    
    const numTrades = 75;
    let currentAmount = FIXED_AMOUNT;
    const probRatio = document.querySelector('input[name="probability"]:checked').value;
    const [winRatio, loseRatio] = probRatio.split(':').map(x => parseInt(x));
    
    // Create array of results based on ratio
    const totalTrades = winRatio + loseRatio;
    const winCount = Math.round((numTrades * winRatio) / totalTrades);
    const loseCount = numTrades - winCount;
    
    let results = [
        ...Array(winCount).fill(true),
        ...Array(loseCount).fill(false)
    ];
    results = shuffleArray(results);

    for (let i = 0; i < numTrades; i++) {
        const isWin = results[i];
        const profitLoss = isWin ? 
            currentAmount * targetPercent : 
            -(currentAmount * stopLossPercent);
        
        const endAmount = currentAmount + profitLoss;
        const changePercent = isWin ? targetPercent * 100 : -stopLossPercent * 100;

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${formatNumber(currentAmount)}</td>
            <td class="${isWin ? 'green' : 'red'}">${isWin ? 'WIN' : 'LOSS'}</td>
            <td class="${isWin ? 'green' : 'red'}">${isWin ? '' : '-'}${formatNumber(Math.abs(profitLoss))}</td>
            <td class="${isWin ? 'green' : 'red'}">${changePercent.toFixed(2)}%</td>
            <td>${formatNumber(endAmount)}</td>
        `;

        currentAmount = endAmount;
    }

    const totalPL = currentAmount - FIXED_AMOUNT;
    const totalPercentage = (totalPL / FIXED_AMOUNT) * 100;
    
    document.getElementById('final-balance').textContent = formatNumber(currentAmount);
    document.getElementById('total-pl').textContent = `${totalPL >= 0 ? '+' : '-'}${formatNumber(Math.abs(totalPL))}`;
    document.getElementById('total-percentage').textContent = `${totalPercentage >= 0 ? '+' : ''}${totalPercentage.toFixed(2)}%`;
    document.getElementById('total-percentage').className = totalPercentage >= 0 ? 'green' : 'red';
}

// Event listeners
document.getElementById('trading-amount').addEventListener('input', updateCalculations);
document.getElementById('target-percent').addEventListener('change', updateCalculations);
document.getElementById('stop-loss-percent').addEventListener('change', updateCalculations);
document.querySelectorAll('input[name="probability"]').forEach(radio => {
    radio.addEventListener('change', updateCalculations);
});

// Initialize with default values
updateCalculations();