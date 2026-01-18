//ELEMENTS
const timeButtons = document.querySelectorAll(".time-btn");
const timerDisplay = document.getElementById("timer");
const taskInput = document.getElementById("taskInput");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const historyList = document.getElementById("historyList");
const progress = document.getElementById("progress");

//STATE
let selectedTime = 0;        // total session time (seconds)
let remainingTime = 0;       // remaining time (seconds)
let timerInterval = null;
let endTime = null;          // REAL end timestamp (ms)

//LOAD HISTORY
let focusHistory = JSON.parse(localStorage.getItem("focusHistory")) || [];
renderHistory();

//ENABLE / DISABLE INPUTS
function setInputsDisabled(disabled) {
timeButtons.forEach(btn => btn.disabled = disabled);
taskInput.disabled = disabled;
}

//TIME SELECTION
timeButtons.forEach(btn => {
btn.addEventListener("click", () => {
    timeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    selectedTime = Number(btn.dataset.time) * 60;
    remainingTime = selectedTime;

    updateTimerDisplay(remainingTime);
    progress.style.width = "100%";
});
});

//START TIMER
startBtn.addEventListener("click", () => {
const task = taskInput.value.trim();

if (!selectedTime) {
    alert("Please select a focus time.");
    return;
}

if (!task) {
    alert("Please enter a task.");
    return;
}

  if (timerInterval) return; // prevent multiple intervals

  // Disable inputs during session
setInputsDisabled(true);

  // Set real end time (IMPORTANT FIX)
  endTime = Date.now() + remainingTime * 1000;

timerInterval = setInterval(() => {
    const now = Date.now();
    remainingTime = Math.max(
    0,
    Math.floor((endTime - now) / 1000)
    );

    updateTimerDisplay(remainingTime);

    const percentage = (remainingTime / selectedTime) * 100;
    progress.style.width = percentage + "%";

    if (remainingTime <= 0) {
    completeSession(task);
    }
}, 1000);
});

//RESET TIMER
resetBtn.addEventListener("click", () => {
clearInterval(timerInterval);
timerInterval = null;
endTime = null;

remainingTime = selectedTime;
updateTimerDisplay(remainingTime);
progress.style.width = "100%";

setInputsDisabled(false);
});

//COMPLETE SESSION
function completeSession(task) {
clearInterval(timerInterval);
timerInterval = null;
endTime = null;

const session = {
    task: task,
    duration: selectedTime / 60 + " min",
    completedAt: new Date().toLocaleString()
};

focusHistory.unshift(session);
localStorage.setItem("focusHistory", JSON.stringify(focusHistory));

alert("🎉 Focus session completed! Great job!");

taskInput.value = "";
updateTimerDisplay(0);
progress.style.width = "0%";

setInputsDisabled(false);
renderHistory();
}

//TIMER DISPLAY
function updateTimerDisplay(seconds) {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;

timerDisplay.textContent =
    String(mins).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0");
}

//RENDER HISTORY
function renderHistory() {
historyList.innerHTML = "";

focusHistory.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
    <strong>✅ ${item.task}</strong><br>
    <small>${item.duration} • ${item.completedAt}</small>
    `;
    historyList.appendChild(li);
});
}
