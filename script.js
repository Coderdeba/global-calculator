const display = document.getElementById('display');
const expression = document.getElementById('expression');
const keys = document.getElementById('keys');

let current = '0';
let previous = null;
let operator = null;
let shouldReset = false;

function updateDisplay() {
  display.textContent = current;
  expression.textContent = previous !== null && operator ? `${previous} ${operator}` : '';
}
function formatNumber(value) {
  if (!Number.isFinite(value)) return 'Error';
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}
function inputDigit(digit) {
  if (current === 'Error' || shouldReset) {
    current = digit;
    shouldReset = false;
  } else {
    current = current === '0' ? digit : current + digit;
  }
  updateDisplay();
}
function chooseOperator(nextOperator) {
  if (current === 'Error') return;
  if (operator && !shouldReset) calculate();
  previous = current;
  operator = nextOperator;
  shouldReset = true;
  updateDisplay();
}
function calculate() {
  if (previous === null || !operator || current === 'Error') return;
  const a = Number(previous);
  const b = Number(current);
  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷': result = b === 0 ? NaN : a / b; break;
    default: return;
  }
  expression.textContent = `${previous} ${operator} ${current} =`;
  current = formatNumber(result);
  previous = null;
  operator = null;
  shouldReset = true;
  display.textContent = current;
}
function handleAction(action) {
  switch (action) {
    case 'clear':
      current = '0'; previous = null; operator = null; shouldReset = false;
      expression.textContent = ''; updateDisplay(); break;
    case 'sign':
      if (current !== '0' && current !== 'Error') current = current.startsWith('-') ? current.slice(1) : '-' + current;
      updateDisplay(); break;
    case 'percent':
      if (current !== 'Error') current = formatNumber(Number(current) / 100);
      updateDisplay(); break;
    case 'decimal':
      if (current === 'Error' || shouldReset) { current = '0.'; shouldReset = false; }
      else if (!current.includes('.')) current += '.';
      updateDisplay(); break;
    case 'equals': calculate(); break;
  }
}
keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.value !== undefined) {
    const value = button.dataset.value;
    if (/^\d$/.test(value)) inputDigit(value);
    else chooseOperator(value);
  } else if (button.dataset.action) handleAction(button.dataset.action);
});

document.addEventListener('keydown', (event) => {
  if (/^\d$/.test(event.key)) inputDigit(event.key);
  else if (event.key === '.') handleAction('decimal');
  else if (event.key === '+') chooseOperator('+');
  else if (event.key === '-') chooseOperator('−');
  else if (event.key === '*') chooseOperator('×');
  else if (event.key === '/') { event.preventDefault(); chooseOperator('÷'); }
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); calculate(); }
  else if (event.key === 'Escape') handleAction('clear');
  else if (event.key === '%') handleAction('percent');
  else if (event.key === 'Backspace') {
    if (!shouldReset && current !== 'Error') current = current.length > 1 ? current.slice(0, -1) : '0';
    updateDisplay();
  }
});
updateDisplay();
