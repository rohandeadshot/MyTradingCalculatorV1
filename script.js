let initialAmount = 9500;

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.nav-tabs button').forEach(button => button.classList.remove('active'));
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

    if (amount) {
        document.getElementById('target-value').textContent = `₹${formatNumber(amount * targetPercent / 100)}`;
        document.getElementById('stop-loss-value').textContent = `₹${formatNumber(amount * stopLossPercent / 100)}`;
    } else {
        document.getElementById('target-value').textContent = '-';
        document.getElementById('stop-loss-value').textContent = '-';
    }
    simulateTrades();
}

function createEditableCell(amount) {
    const cell = document.createElement('td');
    const editableSpan = document.createElement('span');
    editableSpan.className = 'editable';
    editableSpan.textContent = formatNumber(amount);
    
    editableSpan.onclick = function() {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'editable-input';
        input.value = amount;
        
        input.onblur = function() {
            const newAmount = parseFloat(this.value);
            if (!isNaN(newAmount) && newAmount > 0) {
                initialAmount = newAmount;
                simulateTrades();
            } else {
                editableSpan.textContent = formatNumber(amount);
            }
        };

        input.onkeypress = function(e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        };

        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();
    };

    cell.appendChild(editableSpan);
    return cell;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function simulateTrades() {
    const targetPercent = parseFloat(document.getElementById('target-percent').value) / 100;
    const stopLossPercent = parseFloat(document.getElementById('stop-loss-percent').value) / 100;
    const tbody = document.querySelector('#trade-table tbody');
    tbody.innerHTML = '';
    
    const numTrades = 75;
    let currentAmount = initialAmount;
    const [winRatio, loseRatio] = document.querySelector('input[name="probability"]:checked').value.split(':').map(x => parseInt(x));
    const winCount = Math.round((numTrades * winRatio) / (winRatio + loseRatio));
    const results = shuffleArray([...Array(winCount).fill(true), ...Array(numTrades - winCount).fill(false)]);
    
    for (let i = 0; i < numTrades; i++) {
        const isWin = results[i];
        const profitLoss = isWin ? currentAmount * targetPercent : -(currentAmount * stopLossPercent);
        const endAmount = currentAmount + profitLoss;
        const changePercent = (profitLoss / currentAmount) * 100;
        
        const row = document.createElement('tr');
        
        // Add trade number
        const numberCell = document.createElement('td');
        numberCell.textContent = i + 1;
        row.appendChild(numberCell);
        
        // Add amount cell (editable for first row)
        if (i === 0) {
            row.appendChild(createEditableCell(currentAmount));
        } else {
            const amountCell = document.createElement('td');
            amountCell.textContent = formatNumber(currentAmount);
            row.appendChild(amountCell);
        }
        
        // Add result, P/L, change%, and end amount
        const resultHTML = `
            <td class="${isWin ? 'green' : 'red'}">${isWin ? 'WIN' : 'LOSS'}</td>
            <td class="${isWin ? 'green' : 'red'}">${isWin ? '' : '-'}${formatNumber(Math.abs(profitLoss))}</td>
            <td class="${isWin ? 'green' : 'red'}">${changePercent.toFixed(2)}%</td>
            <td>${formatNumber(endAmount)}</td>
        `;
        row.insertAdjacentHTML('beforeend', resultHTML);
        tbody.appendChild(row);
        
        currentAmount = endAmount;
    }
    
    const totalPL = currentAmount - initialAmount;
    const totalPercentage = (totalPL / initialAmount) * 100;
    
    document.getElementById('final-balance').textContent = formatNumber(currentAmount);
    document.getElementById('total-pl').textContent = `${totalPL >= 0 ? '+' : '-'}${formatNumber(Math.abs(totalPL))}`;
    document.getElementById('total-percentage').textContent = `${totalPercentage >= 0 ? '+' : ''}${totalPercentage.toFixed(2)}%`;
    document.getElementById('total-percentage').className = totalPercentage >= 0 ? 'green' : 'red';
}

// Event listeners
document.getElementById('trading-amount').addEventListener('input', updateCalculations);
document.getElementById('target-percent').addEventListener('change', updateCalculations);
document.getElementById('stop-loss-percent').addEventListener('change', updateCalculations);
document.querySelectorAll('input[name="probability"]').forEach(radio => radio.addEventListener('change', updateCalculations));

// Initialize calculations
updateCalculations();
