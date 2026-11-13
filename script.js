
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const streakElement = document.getElementById("streak");

const questionElement = document.getElementById("question");
const instructionElement = document.getElementById("instruction");
const objectsElement = document.getElementById("objects");
const choicesElement = document.getElementById("choices");
const feedbackElement = document.getElementById("feedback");

const nextButton = document.getElementById("next");
const restartButton = document.getElementById("restart");

const roundElement = document.getElementById("round");
const levelElement = document.getElementById("level");
const progressElement = document.getElementById("progress");

const trophiesElement = document.getElementById("trophies");
const achievementElement = document.getElementById("achievement");

let score = 0;
let best = Number(localStorage.getItem("mathBest") || 0);
let streak = 0;

let round = 0;
let level = 1;

let mode = "count";
let answer = 0;
let locked = false;

const totalQuestions = 10;

const emojis = [
    "⭐", "🍎", "🧸", "🍓",
    "🐥", "🌸", "🚗", "🦋"
];

bestElement.textContent = best;


// Random Number
function randomNumber(max) {
    return Math.floor(Math.random() * max);
}


// Shuffle Array
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}


// Generate Question
function generateQuestion() {

    locked = false;

    nextButton.hidden = true;

    feedbackElement.textContent =
        "🌟 You can do it! Pick your answer.";

    feedbackElement.style.background = "#f5f3ff";

    roundElement.textContent =
        `Question ${round + 1} of ${totalQuestions}`;

    levelElement.textContent = `⭐ Level ${level}`;

    progressElement.style.width =
        `${(round / totalQuestions) * 100}%`;

    let a, b;

    const emoji = emojis[randomNumber(emojis.length)];

    let visual = "";


    // COUNTING GAME
    if (mode === "count") {

        answer = randomNumber(Math.min(10, level + 3)) + 1;

        questionElement.textContent =
            "How many objects do you see?";

        instructionElement.textContent =
            "Count the objects carefully!";

        visual = Array(answer)
            .fill(`<span class="object">${emoji}</span>`)
            .join("");

    }


    // ADDITION GAME
    else if (mode === "add") {

        a = randomNumber(Math.min(5, level + 1)) + 1;

        b = randomNumber(Math.min(5, level + 1)) + 1;

        answer = a + b;

        questionElement.textContent =
            `What is ${a} + ${b} ?`;

        instructionElement.textContent =
            "Count them all together!";

        visual = `
            <div>
                ${Array(a).fill(
                    `<span class="object">${emoji}</span>`
                ).join("")}
            </div>

            <span class="object">➕</span>

            <div>
                ${Array(b).fill(
                    `<span class="object">${emoji}</span>`
                ).join("")}
            </div>
        `;

    }


    // SUBTRACTION GAME
    else if (mode === "sub") {

        a = randomNumber(Math.min(7, level + 2)) + 2;

        b = randomNumber(a) + 1;

        answer = a - b;

        questionElement.textContent =
            `What is ${a} − ${b} ?`;

        instructionElement.textContent =
            "Some objects go away. How many are left?";

        visual = Array(a)
            .fill(0)
            .map((_, i) => {

                if (i >= answer) {
                    return `
                        <span class="object"
                        style="opacity:0.22;
                        text-decoration:line-through;">
                        ${emoji}
                        </span>
                    `;
                }

                return `
                    <span class="object">${emoji}</span>
                `;

            }).join("");

    }


    objectsElement.innerHTML = visual;


    // Generate Answer Options
    let options = new Set();

    options.add(answer);

    while (options.size < 4) {

        let randomAnswer = answer + randomNumber(7) - 3;

        if (randomAnswer >= 0 && randomAnswer <= 20) {
            options.add(randomAnswer);
        }

    }

    const shuffledOptions = shuffle([...options]);

    choicesElement.innerHTML = "";

    shuffledOptions.forEach(value => {

        const button = document.createElement("button");

        button.className = "choice";

        button.textContent = value;

        button.addEventListener("click", () => {
            checkAnswer(value, button);
        });

        choicesElement.appendChild(button);

    });

}


// Sound Effects
function playSound(correct) {

    try {

        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) return;

        const audio = new AudioContext();

        const oscillator = audio.createOscillator();

        const gain = audio.createGain();

        oscillator.connect(gain);

        gain.connect(audio.destination);

        oscillator.frequency.value = correct ? 660 : 220;

        gain.gain.value = 0.07;

        oscillator.start();

        oscillator.stop(audio.currentTime + 0.16);

        oscillator.onended = () => audio.close();

    } catch (error) {
        console.log("Audio unavailable");
    }

}


// Check Answer
function checkAnswer(selected, button) {

    if (locked) return;

    locked = true;

    const buttons = choicesElement.querySelectorAll("button");

    if (selected === answer) {

        score += 10;

        streak++;

        button.classList.add("correct");

        feedbackElement.textContent =
            "🎉 Amazing! You are super smart!";

        feedbackElement.style.background = "#dcfce7";

        playSound(true);


        // Save Best Score
        if (score > best) {

            best = score;

            localStorage.setItem("mathBest", best);

            bestElement.textContent = best;

        }

    }

    else {

        streak = 0;

        button.classList.add("wrong");

        feedbackElement.textContent =
            `💛 Good try! The correct answer is ${answer}.`;

        feedbackElement.style.background = "#fff7ed";

        playSound(false);


        // Show Correct Answer
        buttons.forEach(btn => {

            if (Number(btn.textContent) === answer) {
                btn.classList.add("correct");
            }

        });

    }


    // Disable All Buttons
    buttons.forEach(btn => {
        btn.disabled = true;
    });


    // Update Score
    scoreElement.textContent = score;

    streakElement.textContent = streak;


    // Update Achievements
    updateAchievements();

    nextButton.hidden = false;

    nextButton.textContent =
        round === totalQuestions - 1
            ? "See My Results 🏆"
            : "Next Question ➜";

}


// Achievement System
function updateAchievements() {

    let stars = Math.min(5, score / 10);

    trophiesElement.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const star = document.createElement("span");

        star.textContent = i < stars ? "⭐" : "☆";

        trophiesElement.appendChild(star);

    }

    if (score >= 50) {

        achievementElement.textContent =
            "🏆 Super Star! You earned your badge!";

    }

    else {

        achievementElement.textContent =
            `Collect ${5 - stars} more stars for your badge!`;

    }

}


// Next Question
function nextQuestion() {

    round++;

    if (round >= totalQuestions) {

        showResults();

        return;

    }

    level = Math.min(10, 1 + Math.floor(round / 2));

    generateQuestion();

}


// Final Results
function showResults() {

    progressElement.style.width = "100%";

    questionElement.textContent =
        score >= 80
            ? "🏆 Math Superstar!"
            : score >= 40
                ? "🌟 Great Work!"
                : "💛 Well Done, Little Learner!";

    instructionElement.textContent =
        "You finished all 10 questions!";

    objectsElement.innerHTML =
        '<div style="font-size:60px">🎉 🧸 🌈</div>';

    choicesElement.innerHTML = `
        <div style="
            grid-column:1/-1;
            font-size:26px;
            font-weight:bold;
            color:#7559e8;
            padding:15px;">
            Your Score: ${score} / 100
        </div>
    `;

    feedbackElement.textContent =
        score >= 80
            ? "Amazing work! You are a Math Champion!"
            : "Keep practising. You are getting better!";

    nextButton.hidden = false;

    nextButton.textContent = "Play Again ↻";

    nextButton.onclick = resetGame;

}


// Reset Game
function resetGame() {

    score = 0;

    streak = 0;

    round = 0;

    level = 1;

    scoreElement.textContent = 0;

    streakElement.textContent = 0;

    trophiesElement.textContent = "☆ ☆ ☆ ☆ ☆";

    achievementElement.textContent =
        "Collect 5 stars to earn your first badge!";

    nextButton.onclick = nextQuestion;

    generateQuestion();

}


// Change Game Mode
document.querySelectorAll(".mode").forEach(button => {

    button.addEventListener("click", () => {

        mode = button.dataset.mode;

        document.querySelectorAll(".mode").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        resetGame();

    });

});


// Next Button
nextButton.addEventListener("click", nextQuestion);


// Restart Button
restartButton.addEventListener("click", resetGame);


// Start Game
generateQuestion();
