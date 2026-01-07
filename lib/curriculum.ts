export interface Topic {
  name: string
  videoId: string // Direct YouTube video ID
}

export interface Unit {
  name: string
  topics: Topic[]
}

export interface Course {
  id: string
  name: string
  units: Unit[]
}

export const curriculum: Course[] = [
  {
    id: "algebra-1",
    name: "Algebra 1",
    units: [
      {
        name: "Unit 1: Foundations of Algebra",
        topics: [
          { name: "Variables and expressions", videoId: "tVxztUV96qY" },
          { name: "Order of operations", videoId: "dAgfnK528RA" },
          { name: "Evaluating expressions", videoId: "Diqd3Y39QMA" },
          { name: "Properties of numbers (commutative, associative, distributive)", videoId: "3yjJszPDWZA" },
        ],
      },
      {
        name: "Unit 2: Solving Equations and Inequalities",
        topics: [
          { name: "One-step and two-step equations", videoId: "bAerID24QJ0" },
          { name: "Multi-step equations", videoId: "QLUy5uDQ2vI" },
          { name: "Solving inequalities", videoId: "Ei5RPjMPPMo" },
          { name: "Absolute value equations and inequalities", videoId: "SvACUUF8KP4" },
        ],
      },
      {
        name: "Unit 3: Functions and Relations",
        topics: [
          { name: "Definition of a function", videoId: "kvGsIo1TmsM" },
          { name: "Domain and range", videoId: "VbKkq6tHB2g" },
          { name: "Function notation", videoId: "4HnFEvBAqX8" },
          { name: "Linear vs. nonlinear functions", videoId: "V4LsKZzSiVw" },
        ],
      },
      {
        name: "Unit 4: Linear Functions",
        topics: [
          { name: "Slope and rate of change", videoId: "R948Tsyq4vA" },
          { name: "Graphing lines (slope-intercept, point-slope, standard form)", videoId: "3HN_0GooUfE" },
          { name: "Writing equations of lines", videoId: "_kY_E4RJ5o8" },
          { name: "Parallel and perpendicular lines", videoId: "xB4FRdHW9nA" },
        ],
      },
      {
        name: "Unit 5: Systems of Equations and Inequalities",
        topics: [
          { name: "Solving systems by graphing, substitution, and elimination", videoId: "aGlP0WJ5eA8" },
          { name: "Applications of systems", videoId: "f8_9pQ2Xy7g" },
          { name: "Systems of inequalities and graphing solutions", videoId: "FAmvUCbY46Q" },
        ],
      },
      {
        name: "Unit 6: Polynomials and Factoring",
        topics: [
          { name: "Adding, subtracting, multiplying polynomials", videoId: "VcZbH7EfZKY" },
          { name: "Special products (square of a binomial, difference of squares)", videoId: "s4AaoXjeRBo" },
          { name: "Factoring trinomials and grouping", videoId: "JpLcv6f-XGc" },
        ],
      },
      {
        name: "Unit 7: Quadratic Functions",
        topics: [
          { name: "Graphing quadratics (vertex, axis of symmetry)", videoId: "eF6zYNzlZKQ" },
          { name: "Solving quadratics (factoring, completing the square, formula)", videoId: "LdmPXC7cJZI" },
          { name: "Discriminant and nature of roots", videoId: "oYb2NVIWVLQ" },
        ],
      },
      {
        name: "Unit 8: Exponents and Radicals",
        topics: [
          { name: "Laws of exponents", videoId: "kITJ6qH7jS0" },
          { name: "Simplifying radicals and rationalizing denominators", videoId: "XUYS8V2a_WU" },
          { name: "Solving radical equations", videoId: "Kw-6n8pPYRE" },
        ],
      },
      {
        name: "Unit 9: Data and Statistics",
        topics: [
          { name: "Mean, median, mode, and range", videoId: "h8EYEJ32oQ8" },
          { name: "Measures of spread (variance, standard deviation)", videoId: "mk8tOD0t8M0" },
          { name: "Box plots and interpreting data", videoId: "Xp42tBLHqhA" },
        ],
      },
    ],
  },
  {
    id: "geometry",
    name: "Geometry",
    units: [
      {
        name: "Unit 1: Basics of Geometry",
        topics: [
          { name: "Points, lines, planes, and angles", videoId: "YRAzNOZwlqc" },
          { name: "Angle relationships (complementary, supplementary, vertical)", videoId: "cGOveQBcX5w" },
          { name: "Constructions with compass and straightedge", videoId: "HqBK_6jTe3s" },
        ],
      },
      {
        name: "Unit 2: Logic and Proof",
        topics: [
          { name: "Conditional statements and converses", videoId: "pRn6_xAZkl4" },
          { name: "Postulates and theorems", videoId: "SvJKJNqRvy4" },
          { name: "Two-column proofs and paragraph proofs", videoId: "SqBmvcnEBTg" },
        ],
      },
      {
        name: "Unit 3: Parallel and Perpendicular Lines",
        topics: [
          { name: "Transversals and angle relationships", videoId: "0EFGZZPXsRI" },
          { name: "Proving lines parallel or perpendicular", videoId: "8GvRbf0Jg1E" },
          { name: "Slopes of parallel and perpendicular lines", videoId: "JG3zFkb5NXQ" },
        ],
      },
      {
        name: "Unit 4: Triangles",
        topics: [
          { name: "Triangle angle sum and exterior angle theorem", videoId: "qPz6JwP-JLM" },
          { name: "Congruence criteria (SSS, SAS, ASA, AAS, HL)", videoId: "Px-CfwU-uDM" },
          { name: "Properties of isosceles and equilateral triangles", videoId: "wDqhk3tHhqU" },
          { name: "Triangle inequalities", videoId: "tmv0_GkMR8E" },
        ],
      },
      {
        name: "Unit 5: Polygons and Quadrilaterals",
        topics: [
          { name: "Interior and exterior angles of polygons", videoId: "qBBpCHFvVzU" },
          { name: "Properties of parallelograms, rectangles, rhombi, squares, and trapezoids", videoId: "5Uc99qDW_DE" },
          { name: "Coordinate geometry of quadrilaterals", videoId: "KK8GE4Y7z14" },
        ],
      },
      {
        name: "Unit 6: Similarity",
        topics: [
          { name: "Ratio and proportion", videoId: "UScTsaB7pCE" },
          { name: "Similar triangles and AA, SAS, SSS similarity", videoId: "LPDiQEYCPV0" },
          { name: "Side splitter and triangle proportionality theorems", videoId: "KPUm_rZ-hm0" },
        ],
      },
      {
        name: "Unit 7: Right Triangles and Trigonometry",
        topics: [
          { name: "Pythagorean theorem and its converse", videoId: "A_QtOFYEhvs" },
          { name: "Special right triangles (30-60-90, 45-45-90)", videoId: "ewUEHOPCZFY" },
          { name: "Basic trigonometric ratios (sine, cosine, tangent)", videoId: "jBIxz7ax23I" },
        ],
      },
      {
        name: "Unit 8: Circles",
        topics: [
          { name: "Parts of a circle (radius, diameter, chord, arc, sector)", videoId: "WN4tD2X1ehc" },
          { name: "Central and inscribed angles", videoId: "GsJtgZWobJA" },
          { name: "Tangent properties and theorems", videoId: "BWBVF7vRMtI" },
          { name: "Arc length and sector area", videoId: "3A2ZJ3TtPaI" },
        ],
      },
      {
        name: "Unit 9: Area and Perimeter",
        topics: [
          { name: "Area formulas for polygons", videoId: "LWq0r8ZT0Lk" },
          { name: "Circumference and area of circles", videoId: "6yT5C2ruU8A" },
          { name: "Composite figures and irregular shapes", videoId: "v1YYr9-XHCY" },
        ],
      },
      {
        name: "Unit 10: Surface Area and Volume",
        topics: [
          { name: "Prisms, cylinders, pyramids, cones, and spheres", videoId: "3slvbDUMYYE" },
          { name: "Nets and 3D visualization", videoId: "3m7V-Z7NBdk" },
          { name: "Volume and surface area of solids", videoId: "ZfI8dCBmTvg" },
        ],
      },
      {
        name: "Unit 11: Transformations",
        topics: [
          { name: "Translations, rotations, reflections, and dilations", videoId: "MVZFWN-Avm0" },
          { name: "Symmetry and tessellations", videoId: "_1Ry3f9ggz8" },
          { name: "Coordinate geometry transformations", videoId: "BZgC8EiVXlo" },
        ],
      },
    ],
  },
  {
    id: "algebra-2",
    name: "Algebra 2 with Trigonometry",
    units: [
      {
        name: "Unit 1: Review of Algebra 1",
        topics: [
          { name: "Linear equations and inequalities", videoId: "WUvv2vZx7j0" },
          { name: "Systems of equations", videoId: "zyly7YuJXfc" },
          { name: "Factoring and quadratic equations", videoId: "jgNDAjUfa7M" },
        ],
      },
      {
        name: "Unit 2: Functions",
        topics: [
          { name: "Function notation and operations (composite, inverse)", videoId: "TrDDj0M5WpA" },
          { name: "Domain, range, and transformations", videoId: "NaFtuLcsVIg" },
          { name: "Even and odd functions", videoId: "aooYrST-kPE" },
        ],
      },
      {
        name: "Unit 3: Quadratic Functions and Equations",
        topics: [
          { name: "Graphing quadratics in vertex and standard form", videoId: "O6DqSCFfG0Q" },
          { name: "Completing the square and the quadratic formula", videoId: "9WOPKXoUi7Q" },
          { name: "Complex numbers and imaginary roots", videoId: "ORoyjzIjBw0" },
        ],
      },
      {
        name: "Unit 4: Polynomial Functions",
        topics: [
          { name: "Graphing polynomial functions", videoId: "mXYz6B2gXYI" },
          { name: "Synthetic division and the Remainder Theorem", videoId: "yZCp7OKJqc4" },
          { name: "Zeros, roots, and the Factor Theorem", videoId: "v2WUt0kTvYA" },
          { name: "Factoring higher-degree polynomials", videoId: "9yPDIBgxhkU" },
        ],
      },
      {
        name: "Unit 5: Rational Expressions and Equations",
        topics: [
          { name: "Simplifying rational expressions", videoId: "kNm7pVZMj4s" },
          { name: "Operations with rational expressions", videoId: "6Xvez7u_VQg" },
          { name: "Solving rational equations", videoId: "Ls4KgCQG_ZA" },
          { name: "Rational functions and asymptotes", videoId: "fO75w7PeseI" },
        ],
      },
      {
        name: "Unit 6: Radical Functions and Rational Exponents",
        topics: [
          { name: "Simplifying radicals and operations with radicals", videoId: "DGJWiMN8qQA" },
          { name: "Solving radical equations", videoId: "G6n9nSfUjCk" },
          { name: "Rational exponents and their properties", videoId: "UXjoVSrF4Bc" },
        ],
      },
      {
        name: "Unit 7: Exponential and Logarithmic Functions",
        topics: [
          { name: "Exponential growth and decay", videoId: "6WMZ7J0wwMI" },
          { name: "Logarithms and their properties", videoId: "XZd8QjvtnE4" },
          { name: "Solving exponential and logarithmic equations", videoId: "QSFPPftW6gw" },
          { name: "Natural logarithms and the number e", videoId: "AuA2EAgAegE" },
        ],
      },
      {
        name: "Unit 8: Sequences and Series",
        topics: [
          { name: "Arithmetic sequences and series", videoId: "R2vxv6Ert3w" },
          { name: "Geometric sequences and series", videoId: "ztaNl-9l3dM" },
          { name: "Summation notation", videoId: "5jwXThH6fg4" },
        ],
      },
      {
        name: "Unit 9: Introduction to Trigonometry",
        topics: [
          { name: "Angles in standard position and radian measure", videoId: "cgPYLJ-s5II" },
          { name: "Unit circle and special angles", videoId: "1m9p9iubMLU" },
          { name: "Trigonometric functions (sin, cos, tan, csc, sec, cot)", videoId: "PUB0TaZ7bhA" },
        ],
      },
      {
        name: "Unit 10: Trigonometric Graphs and Identities",
        topics: [
          { name: "Graphing sine and cosine functions", videoId: "e3BsFXcPJv0" },
          { name: "Amplitude, period, phase shift, and vertical shift", videoId: "UoJn0C8mPfU" },
          { name: "Pythagorean and cofunction identities", videoId: "Yv8Pys73b4c" },
        ],
      },
      {
        name: "Unit 11: Solving Trigonometric Equations",
        topics: [
          { name: "Solving basic trigonometric equations", videoId: "G0Cv1Ih-9qU" },
          { name: "Inverse trigonometric functions", videoId: "s5WXe4RWw04" },
          { name: "Using identities to simplify and solve", videoId: "X8SQoaWxNuE" },
        ],
      },
      {
        name: "Unit 12: Probability and Statistics",
        topics: [
          { name: "Permutations and combinations", videoId: "XqQTXW7XfYA" },
          { name: "Binomial theorem", videoId: "EaL7F17wMlw" },
          { name: "Probability distributions", videoId: "iYiOVISWXS4" },
        ],
      },
    ],
  },
  {
    id: "precalculus",
    name: "Pre-Calculus",
    units: [
      {
        name: "Unit 1: Functions Review",
        topics: [
          { name: "Polynomial, rational, exponential, and logarithmic functions", videoId: "FTlN8pXJsWw" },
          { name: "Transformations and compositions", videoId: "Ql05GFHn-24" },
          { name: "Inverse functions", videoId: "F8fR-2sy4Wg" },
        ],
      },
      {
        name: "Unit 2: Trigonometric Functions",
        topics: [
          { name: "Trigonometric identities and equations", videoId: "O_qEIcPV_M8" },
          { name: "Sum and difference formulas", videoId: "ufRFbADdakg" },
          { name: "Double-angle and half-angle formulas", videoId: "0g_1D2o0t1A" },
        ],
      },
      {
        name: "Unit 3: Analytic Trigonometry",
        topics: [
          { name: "Law of Sines and Law of Cosines", videoId: "2W-yRz4TT0A" },
          { name: "Applications to triangles (area formulas)", videoId: "xM8rXsKxLo4" },
          { name: "Solving general triangles", videoId: "q8q9u7K-5Vs" },
        ],
      },
      {
        name: "Unit 4: Polar Coordinates and Complex Numbers",
        topics: [
          { name: "Polar coordinate system", videoId: "8yV92eZ-1I0" },
          { name: "Converting between polar and rectangular coordinates", videoId: "3uOqeL8A3qE" },
          { name: "Graphing polar equations", videoId: "D1vbYIjvhPc" },
          { name: "De Moivre's Theorem and nth roots", videoId: "QEqkJ5rPDrM" },
        ],
      },
      {
        name: "Unit 5: Vectors",
        topics: [
          { name: "Vector operations and magnitude", videoId: "ml4NSzCQobk" },
          { name: "Dot product and projections", videoId: "LyGKycYT2v0" },
          { name: "Applications of vectors in 2D and 3D", videoId: "oJqiK9sRIDE" },
        ],
      },
      {
        name: "Unit 6: Matrices and Determinants",
        topics: [
          { name: "Matrix operations (addition, multiplication)", videoId: "kT4Mp9EdVqs" },
          { name: "Determinants and inverses", videoId: "iUQR0enP7RQ" },
          { name: "Solving systems using matrices (Gaussian elimination, Cramer's Rule)", videoId: "oCygbOvQqgQ" },
        ],
      },
      {
        name: "Unit 7: Conic Sections",
        topics: [
          { name: "Parabolas, ellipses, and hyperbolas", videoId: "o2mCMYj7SNA" },
          { name: "Standard and general forms of conic equations", videoId: "kAxJjxBT3dc" },
          { name: "Graphing and applications", videoId: "aL1eZB-L3EM" },
        ],
      },
      {
        name: "Unit 8: Parametric Equations",
        topics: [
          { name: "Parametric representation of curves", videoId: "dqRWXNpZ4kM" },
          { name: "Converting parametric to rectangular form", videoId: "FcX3eWm1aKM" },
          { name: "Graphing parametric equations", videoId: "WnVGPBk8W5I" },
        ],
      },
      {
        name: "Unit 9: Sequences, Series, and Mathematical Induction",
        topics: [
          { name: "Arithmetic and geometric sequences", videoId: "lOgKi-PvvGo" },
          { name: "Infinite series and convergence", videoId: "S-WoMC2lYfE" },
          { name: "Mathematical induction", videoId: "TVSD1IJPP3g" },
        ],
      },
      {
        name: "Unit 10: Introduction to Limits",
        topics: [
          { name: "Intuitive understanding of limits", videoId: "riXcZT2ICjA" },
          { name: "One-sided limits and continuity", videoId: "ByjVx0mQvY4" },
          { name: "Limits at infinity and asymptotes", videoId: "DhUUINcPHC8" },
        ],
      },
      {
        name: "Unit 11: Advanced Probability and Statistics",
        topics: [
          { name: "Counting principles", videoId: "uqkdjAJMk-g" },
          { name: "Probability rules and conditional probability", videoId: "ibINrxucIO4" },
          { name: "Binomial probability and normal distributions", videoId: "2GyUkKmjgTk" },
        ],
      },
    ],
  },
  {
    id: "calculus-1",
    name: "Calculus 1 (AP Calc AB)",
    units: [
      {
        name: "Unit 1: Limits and Continuity",
        topics: [
          { name: "Definition and properties of limits", videoId: "riXcZT2ICjA" },
          { name: "Evaluating limits algebraically and graphically", videoId: "X3FSi9xckHE" },
          { name: "One-sided limits and infinite limits", videoId: "dxR6NyW3xnk" },
          { name: "Continuity and types of discontinuities", videoId: "iQBb7xRqBqI" },
          { name: "Intermediate Value Theorem", videoId: "3w7V7kOUagc" },
        ],
      },
      {
        name: "Unit 2: Differentiation: Definition and Basic Rules",
        topics: [
          { name: "Definition of the derivative", videoId: "5yfh5cf4-0w" },
          { name: "Derivative as a rate of change and slope", videoId: "Xsy9aWvlKHY" },
          { name: "Power rule, product rule, quotient rule", videoId: "HEH4Ohs_nSg" },
          { name: "Chain rule", videoId: "hBYcEXPGGQ4" },
        ],
      },
      {
        name: "Unit 3: Differentiation: Composite, Implicit, and Inverse Functions",
        topics: [
          { name: "Derivatives of trigonometric functions", videoId: "dZI4fMlFYek" },
          { name: "Implicit differentiation", videoId: "qb40J4N1fa4" },
          { name: "Derivatives of inverse functions", videoId: "BbjHv_AYjnU" },
          { name: "Derivatives of exponential and logarithmic functions", videoId: "vl03F2WzvVw" },
        ],
      },
      {
        name: "Unit 4: Contextual Applications of Differentiation",
        topics: [
          { name: "Related rates problems", videoId: "06tWwvg-2_M" },
          { name: "Linear approximation and differentials", videoId: "UYs4hEn5N_k" },
          { name: "L'Hôpital's Rule", videoId: "4bFfzKE7ozY" },
        ],
      },
      {
        name: "Unit 5: Analytical Applications of Differentiation",
        topics: [
          { name: "Mean Value Theorem", videoId: "AaHM_FHZn80" },
          { name: "Extreme values and critical points", videoId: "SzJwXYrZSG0" },
          { name: "Increasing and decreasing functions (first derivative test)", videoId: "kXFR4UhNDYg" },
          { name: "Concavity and points of inflection (second derivative test)", videoId: "cY1kI6PY5j0" },
          { name: "Optimization problems", videoId: "Tx5c6nH9tks" },
        ],
      },
      {
        name: "Unit 6: Integration and Accumulation of Change",
        topics: [
          { name: "Antiderivatives and indefinite integrals", videoId: "rHetrzMH5vA" },
          { name: "Riemann sums and the definite integral", videoId: "FnJqaIESC2s" },
          { name: "Properties of integrals", videoId: "o1hRkHyFGYY" },
          { name: "Fundamental Theorem of Calculus (Parts 1 and 2)", videoId: "rfG8ce4nNh0" },
        ],
      },
      {
        name: "Unit 7: Differential Equations",
        topics: [
          { name: "Modeling with differential equations", videoId: "zwN6nlYB3h8" },
          { name: "Slope fields and solution curves", videoId: "a3U0RLTSwq4" },
          { name: "Separation of variables", videoId: "FUkUawu-5CA" },
          { name: "Exponential growth and decay models", videoId: "GmAH0kRsiBs" },
        ],
      },
      {
        name: "Unit 8: Applications of Integration",
        topics: [
          { name: "Area between curves", videoId: "UNwdL7X72Ew" },
          { name: "Volumes using cross-sections (disk and washer methods)", videoId: "UyX7_f5p1rw" },
          { name: "Volumes using shells", videoId: "TnBx56NZCz8" },
          { name: "Arc length", videoId: "hMewwkx-Iy0" },
        ],
      },
    ],
  },
  {
    id: "calculus-2",
    name: "Calculus 2 (AP Calc BC)",
    units: [
      {
        name: "Unit 1: Review of Calculus AB Topics",
        topics: [
          { name: "Limits, derivatives, and integrals", videoId: "3Ym5CiLVkBI" },
          { name: "Applications and problem-solving", videoId: "dkAQ2YCX-UM" },
        ],
      },
      {
        name: "Unit 2: Parametric Equations, Polar Coordinates, and Vector-Valued Functions",
        topics: [
          { name: "Parametric equations and calculus", videoId: "rR0lNrfwWEk" },
          { name: "Arc length and surface area (parametric)", videoId: "i_lUFWSkxow" },
          { name: "Polar coordinates and graphing", videoId: "MkBGQdFwjcc" },
          { name: "Calculus with polar functions (area, arc length)", videoId: "2CKwAXpNOJY" },
          { name: "Vector-valued functions and motion", videoId: "8yV92eZ-1I0" },
        ],
      },
      {
        name: "Unit 3: Series",
        topics: [
          { name: "Sequences and convergence", videoId: "Kq0cJW5e0hA" },
          { name: "Infinite series and convergence tests", videoId: "c_Dq7xKJmRo" },
          { name: "Geometric and p-series", videoId: "Seb8R0Y-D1s" },
          { name: "Comparison tests (direct and limit)", videoId: "5EUBePCQ-Yg" },
          { name: "Ratio and root tests", videoId: "axbodJZvlZ0" },
          { name: "Alternating series and absolute convergence", videoId: "9kKHYrI3fAY" },
        ],
      },
      {
        name: "Unit 4: Taylor and Maclaurin Series",
        topics: [
          { name: "Power series and radius of convergence", videoId: "vy9kPIqPAlA" },
          { name: "Taylor and Maclaurin polynomials", videoId: "3d6DsjIBzJ4" },
          { name: "Taylor series representations", videoId: "sRkRWNVDHMQ" },
          { name: "Lagrange error bound", videoId: "S4ffNW-z4Hk" },
        ],
      },
      {
        name: "Unit 5: Advanced Integration Techniques",
        topics: [
          { name: "Integration by parts", videoId: "2I-_SV8cwsw" },
          { name: "Partial fraction decomposition", videoId: "cqz5HzhBcBU" },
          { name: "Improper integrals", videoId: "oOkNDHFEWVw" },
          { name: "Numerical integration (trapezoidal and Simpson's rule)", videoId: "RTX-ik_8OHo" },
        ],
      },
      {
        name: "Unit 6: Additional BC Topics",
        topics: [
          { name: "Logistic differential equations", videoId: "1_XdiFR_Boc" },
          { name: "Euler's method for approximating solutions", videoId: "q87L9R9v274" },
          { name: "L'Hôpital's Rule (extended cases)", videoId: "YCCQ3oClNiU" },
        ],
      },
    ],
  },
]
