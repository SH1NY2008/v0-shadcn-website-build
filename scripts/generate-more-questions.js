
const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../app/data/questions.json');
const currentQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

// Helper to generate IDs
const generateId = (prefix, index) => `${prefix}_${index}_${Date.now()}`;

const algebra1Questions = [
    {
        category: "Algebra 1",
        topic: "Linear Equations",
        content: "<p>Solve for \\(x\\): \\(3x - 7 = 14\\)</p>",
        options: [
            { id: "A", content: "7" },
            { id: "B", content: "21" },
            { id: "C", content: "5" },
            { id: "D", content: "3" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 1",
        topic: "Exponents",
        content: "<p>Simplify the expression: \\((2x^3)^4\\)</p>",
        options: [
            { id: "A", content: "\\(8x^{12}\\)" },
            { id: "B", content: "\\(16x^7\\)" },
            { id: "C", content: "\\(16x^{12}\\)" },
            { id: "D", content: "\\(2x^{12}\\)" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Algebra 1",
        topic: "Factoring",
        content: "<p>Factor the quadratic expression: \\(x^2 - 9x + 20\\)</p>",
        options: [
            { id: "A", content: "\\((x-4)(x-5)\\)" },
            { id: "B", content: "\\((x+4)(x+5)\\)" },
            { id: "C", content: "\\((x-2)(x-10)\\)" },
            { id: "D", content: "\\((x-1)(x-20)\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 1",
        topic: "Systems of Equations",
        content: "<p>Solve the system of equations:<br>\\(x + y = 10\\)<br>\\(2x - y = 5\\)</p>",
        options: [
            { id: "A", content: "\\(x=3, y=7\\)" },
            { id: "B", content: "\\(x=5, y=5\\)" },
            { id: "C", content: "\\(x=4, y=6\\)" },
            { id: "D", content: "\\(x=5, y=0\\)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Algebra 1",
        topic: "Inequalities",
        content: "<p>Solve for \\(x\\): \\(-2x + 4 > 10\\)</p>",
        options: [
            { id: "A", content: "\\(x > -3\\)" },
            { id: "B", content: "\\(x < -3\\)" },
            { id: "C", content: "\\(x > 3\\)" },
            { id: "D", content: "\\(x < 3\\)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Algebra 1",
        topic: "Slope",
        content: "<p>Find the slope of the line passing through the points (2, 3) and (5, 9).</p>",
        options: [
            { id: "A", content: "2" },
            { id: "B", content: "3" },
            { id: "C", content: "1/2" },
            { id: "D", content: "6" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 1",
        topic: "Radicals",
        content: "<p>Simplify \\(\\sqrt{72}\\)</p>",
        options: [
            { id: "A", content: "\\(6\\sqrt{2}\\)" },
            { id: "B", content: "\\(36\\sqrt{2}\\)" },
            { id: "C", content: "\\(2\\sqrt{6}\\)" },
            { id: "D", content: "\\(6\\sqrt{3}\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 1",
        topic: "Linear Equations",
        content: "<p>Which of the following represents a line parallel to \\(y = 3x + 2\\)?</p>",
        options: [
            { id: "A", content: "\\(y = -3x + 5\\)" },
            { id: "B", content: "\\(y = \\frac{1}{3}x + 2\\)" },
            { id: "C", content: "\\(y = 3x - 7\\)" },
            { id: "D", content: "\\(y = -\\frac{1}{3}x + 4\\)" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Algebra 1",
        topic: "Polynomials",
        content: "<p>Expand: \\((x+3)(x-3)\\)</p>",
        options: [
            { id: "A", content: "\\(x^2 - 6x - 9\\)" },
            { id: "B", content: "\\(x^2 + 9\\)" },
            { id: "C", content: "\\(x^2 - 9\\)" },
            { id: "D", content: "\\(x^2 + 6x + 9\\)" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Algebra 1",
        topic: "Functions",
        content: "<p>If \\(f(x) = 2x^2 - 3x + 1\\), find \\(f(-2)\\).</p>",
        options: [
            { id: "A", content: "3" },
            { id: "B", content: "15" },
            { id: "C", content: "5" },
            { id: "D", content: "-1" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Algebra 1",
        topic: "Quadratic Formula",
        content: "<p>Which of the following is the quadratic formula for solving \\(ax^2 + bx + c = 0\\)?</p>",
        options: [
            { id: "A", content: "\\(x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\)" },
            { id: "B", content: "\\(x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}\\)" },
            { id: "C", content: "\\(x = \\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}\\)" },
            { id: "D", content: "\\(x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2}\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 1",
        topic: "Absolute Value",
        content: "<p>Solve: \\(|x - 3| = 5\\)</p>",
        options: [
            { id: "A", content: "\\(x = 8\\)" },
            { id: "B", content: "\\(x = -2\\)" },
            { id: "C", content: "\\(x = 8\\) or \\(x = -2\\)" },
            { id: "D", content: "\\(x = 2\\) or \\(x = -8\\)" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Algebra 1",
        topic: "Percentages",
        content: "<p>What is 15% of 60?</p>",
        options: [
            { id: "A", content: "9" },
            { id: "B", content: "4" },
            { id: "C", content: "12" },
            { id: "D", content: "15" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 1",
        topic: "Scientific Notation",
        content: "<p>Write 0.00045 in scientific notation.</p>",
        options: [
            { id: "A", content: "\\(4.5 \\times 10^4\\)" },
            { id: "B", content: "\\(4.5 \\times 10^{-4}\\)" },
            { id: "C", content: "\\(4.5 \\times 10^{-5}\\)" },
            { id: "D", content: "\\(45 \\times 10^{-5}\\)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Algebra 1",
        topic: "Ratios",
        content: "<p>If the ratio of boys to girls in a class is 2:3 and there are 20 boys, how many girls are there?</p>",
        options: [
            { id: "A", content: "20" },
            { id: "B", content: "30" },
            { id: "C", content: "15" },
            { id: "D", content: "40" }
        ],
        correctAnswer: "B"
    }
];

const geometryQuestions = [
    {
        category: "Geometry",
        topic: "Triangles",
        content: "<p>In a right triangle, if the legs are 3 and 4, what is the length of the hypotenuse?</p>",
        options: [
            { id: "A", content: "5" },
            { id: "B", content: "6" },
            { id: "C", content: "7" },
            { id: "D", content: "25" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Geometry",
        topic: "Circles",
        content: "<p>What is the area of a circle with radius 5? (\\(A = \\pi r^2\\))</p>",
        options: [
            { id: "A", content: "10\\(\\pi\\)" },
            { id: "B", content: "25\\(\\pi\\)" },
            { id: "C", content: "5\\(\\pi\\)" },
            { id: "D", content: "50" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Geometry",
        topic: "Angles",
        content: "<p>If two angles are complementary and one is 30°, what is the other?</p>",
        options: [
            { id: "A", content: "60°" },
            { id: "B", content: "150°" },
            { id: "C", content: "90°" },
            { id: "D", content: "45°" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Geometry",
        topic: "Polygons",
        content: "<p>What is the sum of the interior angles of a pentagon?</p>",
        options: [
            { id: "A", content: "360°" },
            { id: "B", content: "540°" },
            { id: "C", content: "720°" },
            { id: "D", content: "180°" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Geometry",
        topic: "Coordinate Geometry",
        content: "<p>What is the distance between points (1, 1) and (4, 5)?</p>",
        options: [
            { id: "A", content: "5" },
            { id: "B", content: "7" },
            { id: "C", content: "25" },
            { id: "D", content: "4" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Geometry",
        topic: "Volume",
        content: "<p>Calculate the volume of a cube with side length 3.</p>",
        options: [
            { id: "A", content: "9" },
            { id: "B", content: "18" },
            { id: "C", content: "27" },
            { id: "D", content: "12" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Geometry",
        topic: "Similarity",
        content: "<p>Two triangles are similar. Triangle A has sides 2, 3, 4. Triangle B has a shortest side of 6. What is the longest side of Triangle B?</p>",
        options: [
            { id: "A", content: "8" },
            { id: "B", content: "9" },
            { id: "C", content: "12" },
            { id: "D", content: "10" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Geometry",
        topic: "Circles",
        content: "<p>What is the circumference of a circle with diameter 10?</p>",
        options: [
            { id: "A", content: "10\\(\\pi\\)" },
            { id: "B", content: "20\\(\\pi\\)" },
            { id: "C", content: "5\\(\\pi\\)" },
            { id: "D", content: "100\\(\\pi\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Geometry",
        topic: "Quadrilaterals",
        content: "<p>Which quadrilateral has 4 equal sides but no right angles?</p>",
        options: [
            { id: "A", content: "Square" },
            { id: "B", content: "Rectangle" },
            { id: "C", content: "Rhombus" },
            { id: "D", content: "Trapezoid" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Geometry",
        topic: "Trigonometry",
        content: "<p>In a right triangle, \\(\\sin(\\theta) = \\frac{3}{5}\\). What is \\(\\cos(\\theta)\\)?</p>",
        options: [
            { id: "A", content: "\\(\\frac{4}{5}\\)" },
            { id: "B", content: "\\(\\frac{3}{4}\\)" },
            { id: "C", content: "\\(\\frac{5}{4}\\)" },
            { id: "D", content: "\\(\\frac{5}{3}\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Geometry",
        topic: "Area",
        content: "<p>What is the area of a triangle with base 10 and height 5?</p>",
        options: [
            { id: "A", content: "50" },
            { id: "B", content: "25" },
            { id: "C", content: "15" },
            { id: "D", content: "100" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Geometry",
        topic: "Lines",
        content: "<p>Vertical angles are always:</p>",
        options: [
            { id: "A", content: "Supplementary" },
            { id: "B", content: "Complementary" },
            { id: "C", content: "Equal" },
            { id: "D", content: "Adjacent" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Geometry",
        topic: "Transformations",
        content: "<p>Reflecting the point (2, 3) over the x-axis gives:</p>",
        options: [
            { id: "A", content: "(-2, 3)" },
            { id: "B", content: "(2, -3)" },
            { id: "C", content: "(-2, -3)" },
            { id: "D", content: "(3, 2)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Geometry",
        topic: "Surface Area",
        content: "<p>Calculate the surface area of a cube with side length 2.</p>",
        options: [
            { id: "A", content: "4" },
            { id: "B", content: "8" },
            { id: "C", content: "24" },
            { id: "D", content: "12" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Geometry",
        topic: "Logic",
        content: "<p>What is the contrapositive of \"If it rains, then the ground is wet\"?</p>",
        options: [
            { id: "A", content: "If the ground is wet, then it rained." },
            { id: "B", content: "If it does not rain, then the ground is not wet." },
            { id: "C", content: "If the ground is not wet, then it did not rain." },
            { id: "D", content: "It rained and the ground is wet." }
        ],
        correctAnswer: "C"
    }
];

const algebra2Questions = [
    {
        category: "Algebra 2",
        topic: "Complex Numbers",
        content: "<p>Simplify \\((3 + 2i) + (1 - 5i)\\)</p>",
        options: [
            { id: "A", content: "\\(4 - 3i\\)" },
            { id: "B", content: "\\(4 + 3i\\)" },
            { id: "C", content: "\\(2 - 7i\\)" },
            { id: "D", content: "\\(4 - 7i\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 2",
        topic: "Logarithms",
        content: "<p>Evaluate \\(\\log_2(32)\\)</p>",
        options: [
            { id: "A", content: "4" },
            { id: "B", content: "5" },
            { id: "C", content: "16" },
            { id: "D", content: "6" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Algebra 2",
        topic: "Functions",
        content: "<p>Find the inverse of \\(f(x) = 2x - 4\\)</p>",
        options: [
            { id: "A", content: "\\(f^{-1}(x) = \\frac{x+4}{2}\\)" },
            { id: "B", content: "\\(f^{-1}(x) = \\frac{x-4}{2}\\)" },
            { id: "C", content: "\\(f^{-1}(x) = 2x + 4\\)" },
            { id: "D", content: "\\(f^{-1}(x) = \\frac{1}{2x-4}\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 2",
        topic: "Polynomials",
        content: "<p>Divide \\((x^3 + 2x^2 - 5x - 6)\\) by \\((x - 2)\\)</p>",
        options: [
            { id: "A", content: "\\(x^2 + 4x + 3\\)" },
            { id: "B", content: "\\(x^2 - 4x + 3\\)" },
            { id: "C", content: "\\(x^2 + 4x - 3\\)" },
            { id: "D", content: "\\(x^2 + 2x + 3\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 2",
        topic: "Rational Expressions",
        content: "<p>Simplify \\(\\frac{1}{x} + \\frac{1}{y}\\)</p>",
        options: [
            { id: "A", content: "\\(\\frac{2}{x+y}\\)" },
            { id: "B", content: "\\(\\frac{x+y}{xy}\\)" },
            { id: "C", content: "\\(\\frac{xy}{x+y}\\)" },
            { id: "D", content: "\\(\\frac{1}{xy}\\)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Algebra 2",
        topic: "Complex Numbers",
        content: "<p>Simplify \\(i^{25}\\)</p>",
        options: [
            { id: "A", content: "1" },
            { id: "B", content: "-1" },
            { id: "C", content: "\\(i\\)" },
            { id: "D", content: "\\(-i\\)" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Algebra 2",
        topic: "Sequences",
        content: "<p>Find the 10th term of the arithmetic sequence: 2, 5, 8, 11...</p>",
        options: [
            { id: "A", content: "29" },
            { id: "B", content: "32" },
            { id: "C", content: "27" },
            { id: "D", content: "30" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 2",
        topic: "Probability",
        content: "<p>If you roll two 6-sided dice, what is the probability of rolling a sum of 7?</p>",
        options: [
            { id: "A", content: "\\(1/6\\)" },
            { id: "B", content: "\\(1/12\\)" },
            { id: "C", content: "\\(1/36\\)" },
            { id: "D", content: "\\(7/36\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 2",
        topic: "Exponential Functions",
        content: "<p>Solve for \\(x\\): \\(2^{x+1} = 16\\)</p>",
        options: [
            { id: "A", content: "3" },
            { id: "B", content: "4" },
            { id: "C", content: "5" },
            { id: "D", content: "2" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 2",
        topic: "Logarithms",
        content: "<p>Expand \\(\\log(ab^2)\\)</p>",
        options: [
            { id: "A", content: "\\(\\log a + \\log b^2\\)" },
            { id: "B", content: "\\(\\log a + 2\\log b\\)" },
            { id: "C", content: "\\(2\\log a + 2\\log b\\)" },
            { id: "D", content: "\\(\\log a \\cdot 2\\log b\\)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Algebra 2",
        topic: "Matrices",
        content: "<p>Calculate the determinant of \\(\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}\\)</p>",
        options: [
            { id: "A", content: "-2" },
            { id: "B", content: "2" },
            { id: "C", content: "10" },
            { id: "D", content: "0" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 2",
        topic: "Conic Sections",
        content: "<p>What is the center of the circle \\((x-2)^2 + (y+3)^2 = 16\\)?</p>",
        options: [
            { id: "A", content: "(2, 3)" },
            { id: "B", content: "(-2, 3)" },
            { id: "C", content: "(2, -3)" },
            { id: "D", content: "(-2, -3)" }
        ],
        correctAnswer: "C"
    },
    {
        category: "Algebra 2",
        topic: "Rational Equations",
        content: "<p>Solve \\(\\frac{3}{x} = \\frac{2}{x+1}\\)</p>",
        options: [
            { id: "A", content: "-3" },
            { id: "B", content: "3" },
            { id: "C", content: "2" },
            { id: "D", content: "-2" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Algebra 2",
        topic: "System of Inequalities",
        content: "<p>Which point is a solution to \\(y > x\\) and \\(y < 5\\)?</p>",
        options: [
            { id: "A", content: "(6, 4)" },
            { id: "B", content: "(2, 3)" },
            { id: "C", content: "(2, 6)" },
            { id: "D", content: "(5, 5)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Algebra 2",
        topic: "Binomial Expansion",
        content: "<p>What is the coefficient of \\(x^2\\) in \\((x+1)^3\\)?</p>",
        options: [
            { id: "A", content: "1" },
            { id: "B", content: "2" },
            { id: "C", content: "3" },
            { id: "D", content: "4" }
        ],
        correctAnswer: "C"
    }
];

const precalculusQuestions = [
    {
        category: "Precalculus",
        topic: "Trigonometry",
        content: "<p>What is the exact value of \\(\\cos(2\\pi/3)\\)?</p>",
        options: [
            { id: "A", content: "\\(1/2\\)" },
            { id: "B", content: "\\(-1/2\\)" },
            { id: "C", content: "\\(\\sqrt{3}/2\\)" },
            { id: "D", content: "\\(-\\sqrt{3}/2\\)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Precalculus",
        topic: "Vectors",
        content: "<p>Find the dot product of vectors \\(\\vec{u} = \\langle 3, 4 \\rangle\\) and \\(\\vec{v} = \\langle 1, -2 \\rangle\\).</p>",
        options: [
            { id: "A", content: "-5" },
            { id: "B", content: "5" },
            { id: "C", content: "11" },
            { id: "D", content: "-11" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Limits",
        content: "<p>Evaluate \\(\\lim_{x \\to 2} (3x^2 - 1)\\)</p>",
        options: [
            { id: "A", content: "11" },
            { id: "B", content: "5" },
            { id: "C", content: "12" },
            { id: "D", content: "Undefined" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Polar Coordinates",
        content: "<p>Convert the polar point \\((4, \\pi)\\) to rectangular coordinates.</p>",
        options: [
            { id: "A", content: "(4, 0)" },
            { id: "B", content: "(-4, 0)" },
            { id: "C", content: "(0, 4)" },
            { id: "D", content: "(0, -4)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Precalculus",
        topic: "Trigonometric Identities",
        content: "<p>Simplify \\(\\sin^2 x + \\cos^2 x\\)</p>",
        options: [
            { id: "A", content: "0" },
            { id: "B", content: "1" },
            { id: "C", content: "\\(2\\sin x\\)" },
            { id: "D", content: "\\(-1\\)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Precalculus",
        topic: "Matrices",
        content: "<p>If \\(A\\) is a 2x3 matrix and \\(B\\) is a 3x2 matrix, what are the dimensions of \\(AB\\)?</p>",
        options: [
            { id: "A", content: "2x2" },
            { id: "B", content: "3x3" },
            { id: "C", content: "2x3" },
            { id: "D", content: "Undefined" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Series",
        content: "<p>Find the sum of the infinite geometric series: \\(1 + 1/2 + 1/4 + 1/8 + ...\\)</p>",
        options: [
            { id: "A", content: "2" },
            { id: "B", content: "1.5" },
            { id: "C", content: "3" },
            { id: "D", content: "Infinity" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Functions",
        content: "<p>Determine the domain of \\(f(x) = \\sqrt{x-5}\\)</p>",
        options: [
            { id: "A", content: "\\(x \\ge 5\\)" },
            { id: "B", content: "\\(x > 5\\)" },
            { id: "C", content: "\\(x \\le 5\\)" },
            { id: "D", content: "All real numbers" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Trigonometry",
        content: "<p>Solve for \\(\\theta\\) in \\([0, 2\\pi]\\): \\(2\\sin \\theta = 1\\)</p>",
        options: [
            { id: "A", content: "\\(\\pi/6, 5\\pi/6\\)" },
            { id: "B", content: "\\(\\pi/3, 2\\pi/3\\)" },
            { id: "C", content: "\\(\\pi/4, 3\\pi/4\\)" },
            { id: "D", content: "\\(\\pi/2\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Parametric Equations",
        content: "<p>Eliminate the parameter \\(t\\): \\(x = t + 1, y = t^2\\)</p>",
        options: [
            { id: "A", content: "\\(y = x^2 - 1\\)" },
            { id: "B", content: "\\(y = (x-1)^2\\)" },
            { id: "C", content: "\\(y = x^2 + 1\\)" },
            { id: "D", content: "\\(x = y^2 - 1\\)" }
        ],
        correctAnswer: "B"
    },
    {
        category: "Precalculus",
        topic: "Vectors",
        content: "<p>Find the magnitude of the vector \\(\\langle 3, -4 \\rangle\\)</p>",
        options: [
            { id: "A", content: "5" },
            { id: "B", content: "7" },
            { id: "C", content: "1" },
            { id: "D", content: "25" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Complex Plane",
        content: "<p>Write \\(1 + i\\) in polar form.</p>",
        options: [
            { id: "A", content: "\\(\\sqrt{2} \\text{cis}(\\pi/4)\\)" },
            { id: "B", content: "\\(2 \\text{cis}(\\pi/4)\\)" },
            { id: "C", content: "\\(\\sqrt{2} \\text{cis}(\\pi/2)\\)" },
            { id: "D", content: "\\(1 \\text{cis}(\\pi/4)\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Rational Functions",
        content: "<p>Find the vertical asymptote of \\(y = \\frac{1}{x-3}\\)</p>",
        options: [
            { id: "A", content: "\\(x = 3\\)" },
            { id: "B", content: "\\(x = -3\\)" },
            { id: "C", content: "\\(y = 0\\)" },
            { id: "D", content: "\\(y = 3\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Polynomials",
        content: "<p>According to the Rational Root Theorem, which is a possible rational root of \\(2x^3 + ... + 3\\)?</p>",
        options: [
            { id: "A", content: "\\(\\pm 3/2\\)" },
            { id: "B", content: "\\(\\pm 2/3\\)" },
            { id: "C", content: "\\(\\pm 5\\)" },
            { id: "D", content: "\\(\\pm 4\\)" }
        ],
        correctAnswer: "A"
    },
    {
        category: "Precalculus",
        topic: "Limits",
        content: "<p>Evaluate \\(\\lim_{x \\to \\infty} \\frac{2x^2 + 1}{x^2 - 5}\\)</p>",
        options: [
            { id: "A", content: "2" },
            { id: "B", content: "0" },
            { id: "C", content: "1" },
            { id: "D", content: "Infinity" }
        ],
        correctAnswer: "A"
    }
];

// Combine all new questions
const allNewQuestions = [
    ...algebra1Questions,
    ...geometryQuestions,
    ...algebra2Questions,
    ...precalculusQuestions
];

// Add IDs
const newQuestionsWithIds = allNewQuestions.map((q, i) => ({
    ...q,
    id: generateId(q.category.replace(/\s+/g, ''), i)
}));

// Filter out existing placeholder questions for these categories from the source
// (We assume the current "5 questions" are placeholders we can replace, 
// or we can append. Let's append to keep it safe, or replace if we want to be clean.
// The user said "add a lot more", so appending is safer, but replacing duplicates is better.)

// Let's keep the "Calculus" and other specific calculus categories untouched.
// We will replace "Algebra 1", "Geometry", "Algebra 2", "Precalculus" with our new bigger sets.

const categoriesToReplace = ["Algebra 1", "Geometry", "Algebra 2", "Precalculus"];

const preservedQuestions = currentQuestions.filter(q => !categoriesToReplace.includes(q.category));
const finalQuestions = [...preservedQuestions, ...newQuestionsWithIds];

fs.writeFileSync(questionsPath, JSON.stringify(finalQuestions, null, 2));

console.log(`Updated questions.json`);
console.log(`Preserved ${preservedQuestions.length} existing questions.`);
console.log(`Added ${newQuestionsWithIds.length} new questions.`);
console.log(`Total questions: ${finalQuestions.length}`);
