// Define the number of problems to select for each category
const selectionCounts = {
    "Limits & Continuity": 2,
    "Differentiation": 2,
    "Application of Differentiation": 2,
    "Integration": 2,
    "Application of Integration": 2,
    "Differential Equations": 2,
    "Parametric, Polar & Vector Functions": 2,
    "Infinite Sequences and Series": 2,
  };
  
  // Function to get multiple random items from an array
  function getRandomItems(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  // Function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Function to generate ProblemList
  function generateProblemList(topicCategories) {
    let allSelectedProblems = [];
    for (const [category, problems] of Object.entries(topicCategories)) {
      const selectedProblems = getRandomItems(problems, selectionCounts[category]);
      allSelectedProblems = allSelectedProblems.concat(selectedProblems);
    }
    return shuffleArray(allSelectedProblems);
  }
  
  // Function to get the correct path to prob_categories.json
  function getJsonPath() {
    return window.location.pathname.includes('/problems/') ? '../prob_categories.json' : 'prob_categories.json';
  }
  
  // Function to fetch and generate ProblemList
  function fetchAndGenerateProblemList() {
    // Check if ProblemList already exists in sessionStorage
    const storedProblemList = sessionStorage.getItem('ProblemList');
    if (storedProblemList) {
      window.ProblemList = JSON.parse(storedProblemList);
      console.log('ProblemList retrieved from session storage:', window.ProblemList);
      return Promise.resolve(window.ProblemList);
    }
  
    const jsonPath = getJsonPath();
    return fetch(jsonPath)
      .then(response => response.json())
      .then(topicCategories => {
        window.ProblemList = generateProblemList(topicCategories);
        // Store ProblemList in sessionStorage
        sessionStorage.setItem('ProblemList', JSON.stringify(window.ProblemList));
        console.log('ProblemList generated and stored:', window.ProblemList);
        return window.ProblemList;
      })
      .catch(error => {
        console.error(`Error loading or parsing ${jsonPath}:`, error);
        window.ProblemList = [];
        return window.ProblemList;
      });
  }
  
  // Function to get the current ProblemList or generate a new one if it doesn't exist
  function getProblemList() {
    if (window.ProblemList && window.ProblemList.length > 0) {
      return Promise.resolve(window.ProblemList);
    } else {
      return fetchAndGenerateProblemList();
    }
  }
  
  // Function to get the next problem number
  function getNextProblemNumber() {
    return getProblemList().then(problemList => {
      const currentIndex = parseInt(sessionStorage.getItem('currentQuestionIndex') || '0');
      if (currentIndex < problemList.length) {
        const nextProblem = problemList[currentIndex];
        sessionStorage.setItem('currentQuestionIndex', (currentIndex + 1).toString());
        return nextProblem;
      } else {
        // Quiz is finished
        return null;
      }
    });
  }
  
  // Initialize ProblemList when the script loads
  getProblemList().then(() => {
    window.dispatchEvent(new Event('ProblemListReady'));
  });
  
  // Make functions globally available
  window.getNextProblemNumber = getNextProblemNumber;
  window.resetQuiz = () => {
    sessionStorage.removeItem('ProblemList');
    sessionStorage.removeItem('currentQuestionIndex');
    window.ProblemList = null;
    return getProblemList();
  };