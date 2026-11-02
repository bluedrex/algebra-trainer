// Helper to get a random integer between min and max (inclusive), excluding 0
function getRandomInt(min, max, allowZero = false) {
  let val;
  do {
    val = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (!allowZero && val === 0);
  return val;
}

// LEVEL 1: Substitution
// Generates: Evaluate ax + b for given x (or ax^2 + by)
function generateSubstitution() {
  const a = getRandomInt(-4, 6);
  const b = getRandomInt(-8, 8);
  const x = getRandomInt(-5, 5);

  const expression = `${a === -1 ? '-' : a === 1 ? '' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;
  const numericAnswer = (a * x) + b;

  return {
    level: 1,
    type: "Substitution",
    question: `Evaluate $${expression}$ when $x = ${x}$`,
    answer: numericAnswer.toString()
  };
}

// LEVEL 2: Distributive Law & Expansion
// Generates: a(bx + c) -> ab*x + ac
function generateExpansion() {
  const a = getRandomInt(-5, 9);
  const b = getRandomInt(1, 6);
  const c = getRandomInt(-9, 9);

  const expression = `${a === -1 ? '-' : a === 1 ? '' : a}(${b === 1 ? '' : b}x ${c < 0 ? '-' : '+'} ${Math.abs(c)})`;
  
  // Calculate expanded terms
  const term1 = a * b;
  const term2 = a * c;

  // Format canonical answer string (e.g., "6x-15" or "-2x+8")
  let answer = "";
  if (term1 === -1) answer += "-x";
  else if (term1 === 1) answer += "x";
  else answer += `${term1}x`;

  if (term2 > 0) answer += `+${term2}`;
  else if (term2 < 0) answer += `-${Math.abs(term2)}`;

  return {
    level: 2,
    type: "Expansion",
    question: `Expand: $${expression}$`,
    answer: answer // expected clean string format
  };
}

// LEVEL 3: Common Factorisation
// Generates: ab*x + ac -> a(bx + c)
function generateFactorisation() {
  const a = getRandomInt(2, 8); // Common factor (HCF)
  const b = getRandomInt(1, 5);
  const c = getRandomInt(-8, 8);

  const term1 = a * b;
  const term2 = a * c;

  const expression = `${term1 === 1 ? '' : term1}x ${term2 < 0 ? '-' : '+'} ${Math.abs(term2)}`;
  
  // Form canonical answer string: "a(bx+c)"
  const inside = `${b === 1 ? '' : b}x${c < 0 ? '-' : '+'}${Math.abs(c)}`;
  const answer = `${a}(${inside})`;

  return {
    level: 3,
    type: "Factorisation",
    question: `Factorise fully: $${expression}$`,
    answer: answer
  };
}

// LEVEL 4: Solving Linear Equations
// Generates: ax + b = c (Guarantees clean integer answers)
function generateLinearEquation() {
  const x = getRandomInt(-9, 9); // Target solution
  const a = getRandomInt(-6, 6); // Coefficient
  const b = getRandomInt(-12, 12); // Constant
  const c = (a * x) + b; // Resulting right hand side

  const lhs = `${a === -1 ? '-' : a === 1 ? '' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;

  return {
    level: 4,
    type: "Linear Equations",
    question: `Solve for $x$: $${lhs} = ${c}$`,
    answer: x.toString() // e.g. "4" or "-3"
  };
}

// LEVEL 5: Changing the Subject (Transposing Formulas)
// Generates: Rearrange formulas like v = u + at -> t = (v - u)/a
function generateChangeSubject() {
  // Variant A: v = u + at  --> Make t the subject: (v - u)/a
  // Variant B: y = mx + c  --> Make x the subject: (y - c)/m
  // Variant C: A = bh / 2  --> Make h the subject: 2A / b
  const variants = [
    {
      question: "Make $t$ the subject of the formula: $v = u + at$",
      answer: "(v-u)/a"
    },
    {
      question: "Make $x$ the subject of the formula: $y = mx + c$",
      answer: "(y-c)/m"
    },
    {
      question: "Make $h$ the subject of the formula: $A = \\frac{bh}{2}$",
      answer: "2A/b"
    },
    {
      question: "Make $r$ the subject of the formula: $C = 2\\pi r$",
      answer: "C/(2\\pi)"
    }
  ];

  const selected = variants[Math.floor(Math.random() * variants.length)];

  return {
    level: 5,
    type: "Changing the Subject",
    question: selected.question,
    answer: selected.answer
  };
}

// LEVEL 6: Basic Exponents & Index Laws
// Generates product law (x^a * x^b), quotient law (x^a / x^b), or power law (x^a)^b
function generateExponents() {
  const baseVars = ['x', 'a', 'y', 'n'];
  const base = baseVars[Math.floor(Math.random() * baseVars.length)];
  const lawType = getRandomInt(1, 3); // 1: Product, 2: Quotient, 3: Power Law

  let questionText = "";
  let answerStr = "";

  if (lawType === 1) {
    // Product Law: x^p * x^q = x^(p+q)
    const p = getRandomInt(2, 7);
    const q = getRandomInt(2, 7);
    questionText = `Simplify: $${base}^{${p}} \\times ${base}^{${q}}$`;
    answerStr = `${base}^${p + q}`;
  } else if (lawType === 2) {
    // Quotient Law: x^p / x^q = x^(p-q)
    const q = getRandomInt(2, 5);
    const diff = getRandomInt(1, 6);
    const p = q + diff; // Guarantees positive power
    questionText = `Simplify: $\\frac{${base}^{${p}}}{${base}^{${q}}}$`;
    answerStr = `${base}^${diff}`;
  } else {
    // Power Law: (x^p)^q = x^(p*q)
    const p = getRandomInt(2, 5);
    const q = getRandomInt(2, 4);
    questionText = `Simplify: $(${base}^{${p}})^{${q}}$`;
    answerStr = `${base}^${p * q}`;
  }

  return {
    level: 6,
    type: "Exponents",
    question: questionText,
    answer: answerStr
  };
}

// Master Router Function
function getRandomQuestion(level) {
  switch (parseInt(level)) {
    case 1: return generateSubstitution();
    case 2: return generateExpansion();
    case 3: return generateFactorisation();
    case 4: return generateLinearEquation();
    case 5: return generateChangeSubject();
    case 6: return generateExponents();
    default: return generateSubstitution();
  }
}
