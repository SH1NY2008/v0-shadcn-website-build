console.log("questionManager.js loaded");

// const totalQuestions = 11;
const topicCategories = [
    "Limits & Continuity",
    "Differentiation",
    "Application of Differentiation",
    "Integration",
    "Application of Integration",
    "Differential Equations",
    "Parametric, Polar & Vector Functions",
    "Infinite Sequences and Series",
];

function loadNextQuestion() {
    getProblemList().then(problemList => {
        let currentIndex = parseInt(localStorage.getItem('currentQuestionIndex') || '0');
        
        if (currentIndex >= problemList.length) {
            window.location.href = '../quizEnd.html';
            return;
        }
        
        let nextProblemNumber = problemList[currentIndex];
        let nextQuestionFile = `prob${nextProblemNumber.toString().padStart(3, '0')}.html`;
        
        // Check if we're already in the problems directory
        if (window.location.href.includes('/problems/')) {
            window.location.href = nextQuestionFile;
        } else {
            window.location.href = 'problems/' + nextQuestionFile;
        }
        
        markQuestionAsSeen(nextQuestionFile);
        currentIndex++;
        localStorage.setItem('currentQuestionIndex', currentIndex.toString());
    });
}

function markQuestionAsSeen(questionFile) {
    let seenQuestions = JSON.parse(localStorage.getItem('seenQuestions') || '[]');
    if (!seenQuestions.includes(questionFile)) {
        seenQuestions.push(questionFile);
        localStorage.setItem('seenQuestions', JSON.stringify(seenQuestions));
    }
}


function trackWrongAnswer(problemNumber, topic) {
    let wrongAnswers = JSON.parse(localStorage.getItem('wrongAnswers') || '[]');
    wrongAnswers.push({
        problemNumber,
        topic
    });
    localStorage.setItem('wrongAnswers', JSON.stringify(wrongAnswers));
}


// CHANGED: Updated updateScore function to track unknown problems
function updateScore(isCorrect) {
    let correctAnswers = parseInt(localStorage.getItem('correctAnswers') || '0');
    let totalAnswered = parseInt(localStorage.getItem('totalAnswered') || '0');
    let topicScores = JSON.parse(localStorage.getItem('topicScores') || '{}');
    
    // Extract topic and problem number from the question
    const { topic, problemNumber } = extractTopicFromQuestion();

    console.log("Updating score for topic:", topic);
    console.log("Current problem number:", problemNumber);
    console.log("Is answer correct?", isCorrect);
    
    if (isCorrect) {
        correctAnswers++;
        topicScores[topic] = topicScores[topic] || {};
        topicScores[topic].correct = (topicScores[topic].correct || 0) + 1;
    } else {
        trackWrongAnswer(problemNumber, topic);
    }
    totalAnswered++;
    
    // Update total attempts for the topic
    topicScores[topic] = topicScores[topic] || {};
    topicScores[topic].total = (topicScores[topic].total || 0) + 1;
    
    // Track unknown problems
    if (topic === "Unknown") {
        topicScores[topic].problems = topicScores[topic].problems || [];
        if (!topicScores[topic].problems.includes(problemNumber)) {
            topicScores[topic].problems.push(problemNumber);
        }
    }
    
    localStorage.setItem('correctAnswers', correctAnswers.toString());
    localStorage.setItem('totalAnswered', totalAnswered.toString());
    localStorage.setItem('topicScores', JSON.stringify(topicScores));
}

function markQuestionAsSeen(questionFile) {
    let seenQuestions = JSON.parse(localStorage.getItem('seenQuestions') || '[]');
    if (!seenQuestions.includes(questionFile)) {
        seenQuestions.push(questionFile);
        localStorage.setItem('seenQuestions', JSON.stringify(seenQuestions));
    }
}

function resetQuiz() {
    localStorage.removeItem('seenQuestions');
    localStorage.removeItem('correctAnswers');
    localStorage.removeItem('totalAnswered');
    localStorage.removeItem('topicScores');
    localStorage.removeItem('currentQuestionIndex');
    localStorage.removeItem('wrongAnswers');

    // Clear ProblemList from sessionStorage
    sessionStorage.removeItem('ProblemList');

    // Reset the global ProblemList variable
    window.ProblemList = null;

    window.location.href = 'index.html';
}

function getTopicScores() {
    return JSON.parse(localStorage.getItem('topicScores') || '{}');
}

// CHANGED: Updated function to extract topic and problem number from the question
function extractTopicFromQuestion() {
    const questionElement = document.querySelector('.question');
    let topic = "Unknown";
    let problemNumber = "Unknown";
    
    if (questionElement) {
        const dataTag = questionElement.getAttribute('data-tag');
        topic = topicCategories.find(category => dataTag.includes(category)) || "Unknown";
        console.log("Data tag found:", dataTag);
        // topic = topicCategories.find(category => dataTag.includes(category)) || "Unknown";
        topic = topicCategories.find(category => category === dataTag) || "Unknown";
        console.log("Matched topic:", topic);
        
        // Extract problem number from the current URL
        const match = window.location.href.match(/prob(\d+)\.html/);
        // const match = window.location.href.match(/problems\/prob(\d+)\.html/);
        if (match) {
            problemNumber = match[1];
        }
    }
    
    return { topic, problemNumber };
}

