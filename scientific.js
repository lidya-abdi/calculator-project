let firstOperand = null;
let currentOperation = null;
let waitingForSecondNumber = false;

let currentFunction = null;           
let waitingForFunctionInput = false;  
let isDegreeMode = true;              

let shouldResetDisplay = false; // FLag

// define the display element
const display = document.getElementById('display');


// update display function
function updateDisplay(value) {
   // أخطاء أو لانهاية
   if (value === 'Error' || value === undefined || value === null || !isFinite(Number(value))) {
     display.textContent = 'Error';
     return;
   }
   let n = Number(value);
   const EPS = 1e-12;
   // أرقام صغيرة جدًا بعتبرها صفر
   if (Math.abs(n) < EPS) n = 0;
   // لو شبه عدد صحيح اعرضه كعدد صحيح
   if (Math.abs(n - Math.round(n)) < 1e-10) {
     display.textContent = String(Math.round(n));
     return;
   }
   // اعرضلي حتى 10 منازل واحذف الأصفار اللاحقة
   let s = n.toFixed(10).replace(/\.?0+$/, '');
   if (s === '-0') s = '0';
   display.textContent = s;
 }

function resetCalculator() {
    updateDisplay('0');
    firstOperand = null;
    currentOperation = null;
    waitingForSecondNumber = false;
    currentFunction = null;
    waitingForFunctionInput = false;
    shouldResetDisplay = false;
}

// number buttons
const numberButtons = document.querySelectorAll('.number');
numberButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const number = button.dataset.value;

        if (display.textContent === 'Error') {
            updateDisplay(number);
            waitingForSecondNumber = false;
            shouldResetDisplay = false;
            waitingForFunctionInput = false;
            currentFunction = null;
            return;
        }

        if (waitingForFunctionInput) {
        display.textContent += number;
        return;
        }

        if (display.textContent === '0' || waitingForSecondNumber || shouldResetDisplay) {
        updateDisplay(number);
        waitingForSecondNumber = false;
        shouldResetDisplay = false;
        } else {
        updateDisplay(display.textContent + number);
        }
    });
});

// dot button
const dotButton = document.querySelector(".decimal");
if (dotButton) {
  dotButton.addEventListener('click', () => {
        if (waitingForFunctionInput) {
        // نضيف نقطة داخل الدالة (من غير تكرار النقطة المتتالية)
        if (!display.textContent.endsWith('.')) {
            display.textContent += '.';
        }
        return;
        }

        if (shouldResetDisplay || waitingForSecondNumber) {
            updateDisplay('0.');
            shouldResetDisplay = false;
            waitingForSecondNumber = false;
            return;
        }

        if (!display.textContent.includes('.')) {
        updateDisplay(display.textContent + '.');
        }
    });
}
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

// yardımcı fonksiyon equals için
function parseInsideArg(txt){
  const open = txt.indexOf('(');
  const close = txt.indexOf(')', open + 1);
  const raw = (open > -1) ? txt.slice(open + 1, (close > -1 ? close : undefined)) : txt;
  return parseFloat(raw.trim()); // يدعم السالب والـ e تلقائياً
}

// equals button
const equalsButton = document.querySelector('[data-action="equals"]');
equalsButton.addEventListener("click", function() {
    if (currentFunction) {
        const inside = parseInsideArg(display.textContent);
       //بدل القيم الغريبة برجعلي Error
        if (isNaN(inside)) {
            updateDisplay('Error');
            currentFunction = null;
            waitingForFunctionInput = false;
            shouldResetDisplay = true;
            return;
        }

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

                const c = Math.cos(angle);
                if (Math.abs(c) < 1e-12) {
                    result = "Error"; // tan(90° + k*180) غير معرّفة
                } else {
                    result = Math.tan(angle);
                }
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

        if (typeof result === 'number' && Math.abs(result) < 1e-12) result = 0;
        updateDisplay(result);
        // Save the operation to history
        if (result !== "Error") {
            addToHistory(`${currentFunction}(${inside})`, result);
        }

        currentFunction = null;
        waitingForFunctionInput = false;
        shouldResetDisplay = true;
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
                shouldResetDisplay = true; 
                return;
            }
            result = firstOperandNumber / secondOperandNumber;
            break;
        case "power":
            result = Math.pow(firstOperandNumber, secondOperandNumber);
            break;
    }

    if (typeof result === 'number' && Math.abs(result) < 1e-12) result = 0;
    updateDisplay(result);
    const map = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
    addToHistory(`${firstOperandNumber} ${map[currentOperation] || currentOperation} ${secondOperandNumber}`, result); // Save the operation to history

    firstOperand = null;
    currentOperation = null;
    waitingForSecondNumber = false;
    shouldResetDisplay = true;
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

  // نخزن الخيار بالـ localStorage مشان يتذكره المتصفح
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
