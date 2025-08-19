let firstOperand = null;
let currentOperation = null;
let waitingForSecondNumber = false;

let currentFunction = null;           
let waitingForFunctionInput = false;  
let isDegreeMode = true;              

// define the display element
const display = document.getElementById('display');
const modeToggle = document.getElementById('mode-toggle');

// update display function
function updateDisplay(value) {
    if (isNaN(value)) {
        display.textContent = value;
    } else {
        const str = value.toString();
        if (str.length > 12) {
            display.textContent = Number(value).toExponential(6);
        } else {
            display.textContent = str;
        }
    }
}


function resetCalculator() {
    updateDisplay('0');
    firstOperand = null;
    currentOperation = null;
    waitingForSecondNumber = false;
    currentFunction = null;
    waitingForFunctionInput = false;
}

// number buttons
const numberButtons = document.querySelectorAll('.number');
numberButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const number = button.dataset.value;

        if (display.textContent === '0' || waitingForSecondNumber) {
            updateDisplay(number);
            waitingForSecondNumber = false;
        } else if (waitingForFunctionInput) {
            display.textContent += number;
        } else {
            updateDisplay(display.textContent + number);       // you can also use display.textContent += number; 
        }
    });
});

// dot button
const dotButton = document.querySelector(".decimal");
dotButton.addEventListener("click", function() {
    if (!display.textContent.includes('.')) {
        updateDisplay(display.textContent + '.');             // you can also use display.textContent += '.'; if you have that function
    }
});

// AC button
const clearButton = document.querySelector('.function[data-action="clear"]');
clearButton.addEventListener("click", resetCalculator);

// operator buttons
const operatorButtons = document.querySelectorAll('.operator');
operatorButtons.forEach(button => {
    button.addEventListener("click", function() {
        firstOperand = display.textContent;
        currentOperation = button.dataset.action;
        waitingForSecondNumber = true;
    });
});

// equals button
const equalsButton = document.querySelector('[data-action="equals"]');
equalsButton.addEventListener("click", function() {
    if (currentFunction) {
        const inside = parseFloat(display.textContent.replace(/[^0-9.]/g, ""));
       
        let result;
        switch (currentFunction) {
            case "sin": {
                let angle;
                if (isDegreeMode) {
                    angle = inside * (Math.PI / 180);
                } else {
                    angle = inside;
                }
                result = Math.sin(angle);
                break;
            }
            case "cos": {
                let angle;
                if (isDegreeMode) {
                    angle = inside * (Math.PI / 180);
                } else {
                    angle = inside;
                }
                result = Math.cos(angle);
                break;
            }
            case "tan": {
                let angle;
                if (isDegreeMode) {
                    angle = inside * (Math.PI / 180);
                } else {
                    angle = inside;
                }
                result = Math.tan(angle);
                break;
            }
            case "√":
                if (inside < 0) {
                    result = "Error";
                } else {
                    result = Math.sqrt(inside);
                }
                break;
            case "log":
                if (inside <= 0) {
                    result = "Error";
                } else {
                    result = Math.log10(inside);
                }
                break;
            case "ln":
                if (inside <= 0) {
                    result = "Error";
                } else {
                    result = Math.log(inside);
                }
                break;
            case "exp":
                result = Math.exp(inside);
                break;
        }

        display.textContent = currentFunction + "(" + inside + ") = " + result;
        addToHistory(`${currentFunction}(${inside})`, result); // Save the operation to history
        currentFunction = null;
        waitingForFunctionInput = false;
        return;
    }

    if (!currentOperation) return;
    const secondOperand = display.textContent;
    const firstOperandNumber = parseFloat(firstOperand);
    const secondOperandNumber = parseFloat(secondOperand);

    let result;
    switch (currentOperation) {
        case "add":
            result = firstOperandNumber + secondOperandNumber;
            break;
        case "subtract":
            result = firstOperandNumber - secondOperandNumber;
            break;
        case "multiply":
            result = firstOperandNumber * secondOperandNumber;
            break;
        case "divide":
            if (secondOperandNumber === 0) {
                updateDisplay("Error");
                return;
            }
            result = firstOperandNumber / secondOperandNumber;
            break;
        case "power":
            result = Math.pow(firstOperandNumber, secondOperandNumber);
            break;
    }

    updateDisplay(result);
    firstOperand = null;
    currentOperation = null;
    waitingForSecondNumber = false;
});

// ± change sign button
const plusMinusButton = document.querySelector('.function[data-action="plus-minus"]');
plusMinusButton.addEventListener("click", function()  {
    if (display.textContent !== '0') {
        const currentValue = parseFloat(display.textContent);
        updateDisplay(-currentValue);
    }
});

// % percentage button
const percentageButton = document.querySelector('.function[data-action="percent"]');
percentageButton.addEventListener("click", function() {
    if (display.textContent !== '0') {
        const currentValue = parseFloat(display.textContent);
        updateDisplay(currentValue / 100);
    }
});

// x^y power button
const powButton = document.querySelector('.function[data-action="pow"]');
powButton.addEventListener("click", function() {
    firstOperand = parseFloat(display.textContent);
    currentOperation = "power";
    waitingForSecondNumber = true;
});

// Function buttons
function handleFunction(funcName) {
    currentFunction = funcName;
    display.textContent = funcName + "(";
    waitingForFunctionInput = true;
}

document.querySelector('.function[data-action="sin"]').addEventListener("click", () => handleFunction("sin"));
document.querySelector('.function[data-action="cos"]').addEventListener("click", () => handleFunction("cos"));
document.querySelector('.function[data-action="tan"]').addEventListener("click", () => handleFunction("tan"));
document.querySelector('.function[data-action="sqrt"]').addEventListener("click", () => handleFunction("√"));
document.querySelector('.function[data-action="log"]').addEventListener("click", () => handleFunction("log"));
document.querySelector('.function[data-action="ln"]').addEventListener("click", () => handleFunction("ln"));
document.querySelector('.function[data-action="exp"]').addEventListener("click", () => handleFunction("exp"));



// --------------------History management---------------------JSON LOCALSTORAGE

// مفتاح التخزين
const HISTORY_KEY = "calcHistory";

// تحميل الأرشيف
function loadHistory() {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

// حفظ الأرشيف
function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// تحديث العرض
function renderHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;
  list.innerHTML = "";

  const history = loadHistory();
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.operation} = ${item.result} (${item.time})`;
    list.appendChild(li);
  });
}

// إضافة عملية جديدة
function addToHistory(operation, result) {
  const history = loadHistory();
  history.push({ operation, result, time: new Date().toLocaleString() });
  saveHistory(history);
  renderHistory();
}

// زر مسح الأرشيف
const clearHistoryBtn = document.getElementById("clearHistory");
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    saveHistory([]);
    renderHistory();
  });
}

// لما تفتح الصفحة
renderHistory();


// Dark/Light mode toggle
const themeSwitch = document.getElementById("themeSwitch");

themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeSwitch.checked);

  // نخزن الخيار بالـ localStorage عشان يتذكره المتصفح
  if (themeSwitch.checked) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// لما تفتح الصفحة يرجّع آخر اختيار
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeSwitch.checked = true;
}
