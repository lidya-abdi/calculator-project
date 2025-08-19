console.log("lidoo");

let firstOperand = null;
let currentOperation = null;
let waitingForSecondNumber = false;

// hold the display element
const display = document.getElementById('display');

// number buttons
const numberButtons = document.querySelectorAll('.number');
numberButtons.forEach(function(button){
    button.addEventListener("click",function(){
        // خذي الرقم الموجود داخل data-value
        const number = button.dataset.value;

        if(display.textContent === '0' || waitingForSecondNumber){
            display.textContent = number;// you can use updateDisplay(number) if you have that function
            waitingForSecondNumber = false; // Reset the flag after entering the first number
        } else {
            display.textContent += number;
        }
    });
});


//AC button
const clearButton = document.querySelector('.function[data-action="clear"]');
clearButton.addEventListener("click", function() {
    display.textContent = '0';
    // Reset all variables
    firstOperand = null;
    currentOperation = null;
    waitingForSecondNumber = false;
});



// dot button
const dotButton = document.querySelector(".decimal");
dotButton.addEventListener("click", function() {
    if(!display.textContent.includes('.')) {    
        display.textContent += '.';               // you can also use updateDisplay(display.textContent + '.'); if you have that function
    }
});



// operator buttons
const operatorButtons = document.querySelectorAll('.operator');
operatorButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        firstOperand = display.textContent;           // get the first operand from the display
        currentOperation = button.dataset.action;     // get the operation from the button
        waitingForSecondNumber = true;                // set the flag to true to wait for the second number
        console.log('Saved:', firstOperand, currentOperation);   
    
    });
});



// equals button
const equalsButton = document.querySelector('[data-action="equals"]');
equalsButton.addEventListener("click",function() {

    if (!currentOperation) return;
    const secondOperand = display.textContent;
    // Convert the two numbers from text to numbers.
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
                console.log("Error");
                return;
            }
            result = firstOperandNumber / secondOperandNumber;
            break;
        default:
            console.log("Unknown operation");
            return;
    }

    display.textContent = result;
    addToHistory(`${firstOperandNumber} ${currentOperation} ${secondOperandNumber}`, result); // Save the operation to history
    // Reset the calculator state
    firstOperand = null;
    currentOperation = null;
    waitingForSecondNumber = false;

});



// ± change sign button
const plusMinusButton = document.querySelector('.function[data-action="plus-minus"]');
plusMinusButton.addEventListener("click", function() {
    if (display.textContent !== '0') {
        const currentValue = parseFloat(display.textContent);
        display.textContent = (-currentValue).toString();      // you can use updateDisplay(-currentValue) if you have that function
    }
});



// % percentage button
const percentageButton = document.querySelector('.function[data-action="percent"]');
percentageButton.addEventListener("click", function(){
    if (display.textContent !== '0') {
        const currentValue = parseFloat(display.textContent);
        display.textContent = (currentValue / 100).toString();
    }
});


// ---------------------History management-----------------------JSON LOCALSTORAGE

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
