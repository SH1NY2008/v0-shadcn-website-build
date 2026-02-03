const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../calc questions/practice');
const publicImagesDir = path.join(__dirname, '../public/quizzes');
const outputFile = path.join(__dirname, '../app/data/questions.json');

// Ensure directories exist
if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
}
if (!fs.existsSync(path.dirname(outputFile))) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
}

const files = fs.readdirSync(sourceDir);
const questions = [];

// Calculus topics to normalize
const calculusTopics = [
    "Integration", "Differentiation", "Application of Differentiation", 
    "Limits", "Continuity", "Series", "Differential Equations",
    "Parametric Equations", "Polar Coordinates", "Vectors"
];

files.forEach(file => {
    if (file.endsWith('.png')) {
        // Copy image
        fs.copyFileSync(path.join(sourceDir, file), path.join(publicImagesDir, file));
        console.log(`Copied image: ${file}`);
    } else if (file.endsWith('.html')) {
        const content = fs.readFileSync(path.join(sourceDir, file), 'utf-8');
        const id = file.replace('.html', '');
        
        // Extract Category
        const categoryMatch = content.match(/data-tag="([^"]+)"/);
        let originalCategory = categoryMatch ? categoryMatch[1] : 'Uncategorized';
        
        let category = originalCategory;
        let topic = originalCategory;

        // Normalize Calculus categories
        if (calculusTopics.includes(originalCategory)) {
            category = "Calculus";
        }

        // Extract Question Content
        let questionContent = '';
        
        // Find images
        const imgMatch = content.match(/<img[^>]+src="([^"]+)"[^>]*>/g);
        if (imgMatch) {
            imgMatch.forEach(imgTag => {
                const updatedImgTag = imgTag.replace(/src="([^"]+)"/, 'src="/quizzes/$1"');
                questionContent += `<div class="flex justify-center my-4">${updatedImgTag}</div>`;
            });
        }

        // Find question text
        const questionDivMatch = content.match(/<div class="question"[^>]*>([\s\S]*?)<\/div>/);
        if (questionDivMatch) {
            let qText = questionDivMatch[1].trim();
            questionContent += qText;
        }

        // Extract Options
        const options = [];
        const optionRegex = /<div class="option"[^>]*data-value="([A-D])"[\s\S]*?>([\s\S]*?)<\/div>/g;
        let optionMatch;
        while ((optionMatch = optionRegex.exec(content)) !== null) {
            let optContent = optionMatch[2].trim();
            // Remove "(A) " prefix if present
            optContent = optContent.replace(/^\([A-D]\)\s*/, '');
            
            options.push({
                id: optionMatch[1],
                content: optContent
            });
        }

        // Extract Correct Answer
        const correctAnswerMatch = content.match(/const correctAnswer = '([A-D])';/);
        const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1] : null;

        if (correctAnswer && options.length > 0) {
            questions.push({
                id,
                category,
                topic,
                content: questionContent,
                options,
                correctAnswer
            });
        }
    }
});

// Additional Questions for other Courses
const additionalQuestions = [
    // --- Algebra 1 ---
    {
        id: "alg1_001",
        category: "Algebra 1",
        topic: "Linear Equations",
        content: "<p>Solve for \\(x\\): \\(3x + 5 = 14\\)</p>",
        options: [
            { id: "A", content: "3" },
            { id: "B", content: "9" },
            { id: "C", content: "5" },
            { id: "D", content: "\\(\\frac{19}{3}\\)" }
        ],
        correctAnswer: "A"
    },
    {
        id: "alg1_002",
        category: "Algebra 1",
        topic: "Slope",
        content: "<p>Find the slope of the line passing through the points \\((2, 3)\\) and \\((4, 7)\\).</p>",
        options: [
            { id: "A", content: "1" },
            { id: "B", content: "2" },
            { id: "C", content: "4" },
            { id: "D", content: "\\(\\frac{1}{2}\\)" }
        ],
        correctAnswer: "B"
    },
    {
        id: "alg1_003",
        category: "Algebra 1",
        topic: "Inequalities",
        content: "<p>Solve the inequality: \\(-2x > 6\\)</p>",
        options: [
            { id: "A", content: "\\(x > -3\\)" },
            { id: "B", content: "\\(x < -3\\)" },
            { id: "C", content: "\\(x > 3\\)" },
            { id: "D", content: "\\(x < 3\\)" }
        ],
        correctAnswer: "B"
    },
    {
        id: "alg1_004",
        category: "Algebra 1",
        topic: "Systems of Equations",
        content: "<p>Solve the system:<br>\\(y = 2x\\)<br>\\(x + y = 12\\)</p>",
        options: [
            { id: "A", content: "\\((4, 8)\\)" },
            { id: "B", content: "\\((3, 6)\\)" },
            { id: "C", content: "\\((2, 10)\\)" },
            { id: "D", content: "\\((4, 2)\\)" }
        ],
        correctAnswer: "A"
    },
    {
        id: "alg1_005",
        category: "Algebra 1",
        topic: "Factoring",
        content: "<p>Factor completely: \\(x^2 - 9\\)</p>",
        options: [
            { id: "A", content: "\\((x-3)(x-3)\\)" },
            { id: "B", content: "\\((x+3)(x+3)\\)" },
            { id: "C", content: "\\((x-3)(x+3)\\)" },
            { id: "D", content: "\\((x-9)(x+1)\\)" }
        ],
        correctAnswer: "C"
    },

    // --- Geometry ---
    {
        id: "geo_001",
        category: "Geometry",
        topic: "Angles",
        content: "<p>If two angles are complementary and one measures \\(35^\\circ\\), what is the measure of the other?</p>",
        options: [
            { id: "A", content: "\\(55^\\circ\\)" },
            { id: "B", content: "\\(145^\\circ\\)" },
            { id: "C", content: "\\(65^\\circ\\)" },
            { id: "D", content: "\\(45^\\circ\\)" }
        ],
        correctAnswer: "A"
    },
    {
        id: "geo_002",
        category: "Geometry",
        topic: "Triangles",
        content: "<p>In a right triangle, the legs have lengths 3 and 4. What is the length of the hypotenuse?</p>",
        options: [
            { id: "A", content: "5" },
            { id: "B", content: "6" },
            { id: "C", content: "7" },
            { id: "D", content: "\\(\\sqrt{7}\\)" }
        ],
        correctAnswer: "A"
    },
    {
        id: "geo_003",
        category: "Geometry",
        topic: "Circles",
        content: "<p>What is the area of a circle with radius 5?</p>",
        options: [
            { id: "A", content: "\\(10\\pi\\)" },
            { id: "B", content: "\\(25\\pi\\)" },
            { id: "C", content: "\\(5\\pi\\)" },
            { id: "D", content: "25" }
        ],
        correctAnswer: "B"
    },
    {
        id: "geo_004",
        category: "Geometry",
        topic: "Polygons",
        content: "<p>What is the sum of the interior angles of a hexagon?</p>",
        options: [
            { id: "A", content: "\\(360^\\circ\\)" },
            { id: "B", content: "\\(540^\\circ\\)" },
            { id: "C", content: "\\(720^\\circ\\)" },
            { id: "D", content: "\\(180^\\circ\\)" }
        ],
        correctAnswer: "C"
    },
    {
        id: "geo_005",
        category: "Geometry",
        topic: "Similarity",
        content: "<p>Two triangles are similar. The ratio of their corresponding sides is 1:2. What is the ratio of their areas?</p>",
        options: [
            { id: "A", content: "1:2" },
            { id: "B", content: "1:3" },
            { id: "C", content: "1:4" },
            { id: "D", content: "1:8" }
        ],
        correctAnswer: "C"
    },

    // --- Algebra 2 ---
    {
        id: "alg2_001",
        category: "Algebra 2",
        topic: "Complex Numbers",
        content: "<p>Simplify \\(i^2\\).</p>",
        options: [
            { id: "A", content: "1" },
            { id: "B", content: "-1" },
            { id: "C", content: "\\(i\\)" },
            { id: "D", content: "\\(-i\\)" }
        ],
        correctAnswer: "B"
    },
    {
        id: "alg2_002",
        category: "Algebra 2",
        topic: "Logarithms",
        content: "<p>Evaluate \\(\\log_2(8)\\).</p>",
        options: [
            { id: "A", content: "3" },
            { id: "B", content: "4" },
            { id: "C", content: "2" },
            { id: "D", content: "8" }
        ],
        correctAnswer: "A"
    },
    {
        id: "alg2_003",
        category: "Algebra 2",
        topic: "Quadratics",
        content: "<p>Find the zeros of \\(y = x^2 - 5x + 6\\).</p>",
        options: [
            { id: "A", content: "2 and 3" },
            { id: "B", content: "-2 and -3" },
            { id: "C", content: "1 and 6" },
            { id: "D", content: "-1 and -6" }
        ],
        correctAnswer: "A"
    },
    {
        id: "alg2_004",
        category: "Algebra 2",
        topic: "Functions",
        content: "<p>If \\(f(x) = 2x + 1\\) and \\(g(x) = x^2\\), find \\(f(g(2))\\).</p>",
        options: [
            { id: "A", content: "5" },
            { id: "B", content: "9" },
            { id: "C", content: "25" },
            { id: "D", content: "10" }
        ],
        correctAnswer: "B"
    },
    {
        id: "alg2_005",
        category: "Algebra 2",
        topic: "Series",
        content: "<p>Find the sum of the first 5 terms of the geometric sequence: 2, 6, 18, ...</p>",
        options: [
            { id: "A", content: "80" },
            { id: "B", content: "242" },
            { id: "C", content: "121" },
            { id: "D", content: "484" }
        ],
        correctAnswer: "B"
    },

    // --- Precalculus ---
    {
        id: "precalc_001",
        category: "Precalculus",
        topic: "Trigonometry",
        content: "<p>What is the exact value of \\(\\sin(\\frac{\\pi}{3})\\)?</p>",
        options: [
            { id: "A", content: "\\(\\frac{1}{2}\\)" },
            { id: "B", content: "\\(\\frac{\\sqrt{2}}{2}\\)" },
            { id: "C", content: "\\(\\frac{\\sqrt{3}}{2}\\)" },
            { id: "D", content: "1" }
        ],
        correctAnswer: "C"
    },
    {
        id: "precalc_002",
        category: "Precalculus",
        topic: "Trig Identities",
        content: "<p>Which of the following is equal to \\(\\sin^2(x) + \\cos^2(x)\\)?</p>",
        options: [
            { id: "A", content: "0" },
            { id: "B", content: "1" },
            { id: "C", content: "\\(\\tan^2(x)\\)" },
            { id: "D", content: "2" }
        ],
        correctAnswer: "B"
    },
    {
        id: "precalc_003",
        category: "Precalculus",
        topic: "Polar Coordinates",
        content: "<p>Convert the rectangular point \\((0, 3)\\) to polar coordinates \\((r, \\theta)\\).</p>",
        options: [
            { id: "A", content: "\\((3, 0)\\)" },
            { id: "B", content: "\\((3, \\pi)\\)" },
            { id: "C", content: "\\((3, \\frac{\\pi}{2})\\)" },
            { id: "D", content: "\\((3, \\pi)\\)" }
        ],
        correctAnswer: "C"
    },
    {
        id: "precalc_004",
        category: "Precalculus",
        topic: "Vectors",
        content: "<p>Find the magnitude of the vector \\(\\mathbf{v} = \\langle 3, 4 \\rangle\\).</p>",
        options: [
            { id: "A", content: "5" },
            { id: "B", content: "7" },
            { id: "C", content: "25" },
            { id: "D", content: "1" }
        ],
        correctAnswer: "A"
    },
    {
        id: "precalc_005",
        category: "Precalculus",
        topic: "Matrices",
        content: "<p>Find the determinant of the matrix \\(\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}\\).</p>",
        options: [
            { id: "A", content: "-2" },
            { id: "B", content: "2" },
            { id: "C", content: "10" },
            { id: "D", content: "0" }
        ],
        correctAnswer: "A"
    }
];

const finalQuestions = [...questions, ...additionalQuestions];

fs.writeFileSync(outputFile, JSON.stringify(finalQuestions, null, 2));
console.log(`Processed ${finalQuestions.length} questions.`);
