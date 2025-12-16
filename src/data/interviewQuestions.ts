export const interviewQuestions = [
  // Intro (Q1)
  {
    question: "Hey there! Great to meet you. Before we dive in, I'd love to hear a bit about yourself. What's your background, and what got you excited about frontend web development?",
    topic: "Introduction",
    difficulty: "Easy"
  },
  // Easy (Q2-Q3)
  {
    question: "Alright, let's talk about CSS. So, there are different ways to add styles to a webpage - inline, internal, and external CSS. Can you walk me through the differences and when you'd pick one over the other?",
    topic: "CSS Fundamentals",
    difficulty: "Easy"
  },
  {
    question: "Nice! Now switching to HTML. You've probably seen tags like header, nav, main, and footer. Why do you think these semantic elements exist when we could just use divs for everything?",
    topic: "HTML Fundamentals",
    difficulty: "Easy"
  },
  // Medium (Q4-Q6)
  {
    question: "Let's move on to JavaScript. You've got let, const, and var for declaring variables. What's the deal with each of them, and when would you choose one over another?",
    topic: "JavaScript Basics",
    difficulty: "Medium"
  },
  {
    question: "Okay, now I'm curious about your Git knowledge. What exactly is a branch in Git? Why do developers bother with branches instead of just working on the main code?",
    topic: "Git & GitHub",
    difficulty: "Medium"
  },
  {
    question: "Staying with GitHub here - can you explain what a Pull Request is? What happens during the review process?",
    topic: "Git & GitHub",
    difficulty: "Medium"
  },
  // Medium-Challenging (Q7-Q9)
  {
    question: "Let's talk React. Props and state - they're both about data in your components, but they work differently. Can you explain the difference and when you'd use each?",
    topic: "React Basics",
    difficulty: "Medium"
  },
  {
    question: "Back to CSS for a moment. The Box Model is pretty fundamental. Can you describe how margin, border, padding, and content work together?",
    topic: "CSS Fundamentals",
    difficulty: "Medium"
  },
  {
    question: "JavaScript events are everywhere in web development. Can you explain what event bubbling is and how you'd handle a click event on a button?",
    topic: "JavaScript Basics",
    difficulty: "Medium"
  },
  // Challenging (Q10)
  {
    question: "Alright, last one! Imagine a user complains that your webpage loads really slowly. What would you look at first? What are some things you could do to speed it up?",
    topic: "Web Performance",
    difficulty: "Challenging"
  }
];

export const evaluateAnswer = (questionIndex: number, answer: string): {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
} => {
  const trimmedAnswer = answer.trim().toLowerCase();
  const wordCount = answer.split(/\s+/).filter(w => w.length > 0).length;
  
  // Base scoring logic
  let score = 5;
  const strengths: string[] = [];
  const improvements: string[] = [];
  let feedback = "";
  
  // Check for empty or very short answers
  if (wordCount < 5) {
    return {
      score: 1,
      feedback: "Your answer was too brief. Try to explain concepts more thoroughly with examples.",
      strengths: [],
      improvements: ["Provide more detailed explanations", "Include examples when possible"]
    };
  }
  
  // Question-specific keyword evaluation
  const keywordSets: Record<number, { keywords: string[], bonusKeywords: string[] }> = {
    0: {
      keywords: ["learn", "interest", "project", "web", "frontend", "coding", "development", "student"],
      bonusKeywords: ["passion", "experience", "portfolio", "goal", "career", "motivated"]
    },
    1: {
      keywords: ["inline", "internal", "external", "style", "link", "maintainability", "reusability"],
      bonusKeywords: ["specificity", "performance", "separation of concerns", "stylesheet"]
    },
    2: {
      keywords: ["semantic", "accessibility", "seo", "meaning", "structure", "screen reader"],
      bonusKeywords: ["a11y", "search engine", "crawl", "meaningful"]
    },
    3: {
      keywords: ["let", "const", "var", "scope", "hoisting", "block", "function"],
      bonusKeywords: ["temporal dead zone", "reassign", "redeclare", "mutable"]
    },
    4: {
      keywords: ["branch", "git", "checkout", "create", "feature", "main", "master", "isolated"],
      bonusKeywords: ["merge", "git branch", "git checkout", "parallel", "workflow"]
    },
    5: {
      keywords: ["pull request", "pr", "review", "merge", "code review", "changes", "feedback"],
      bonusKeywords: ["approve", "request changes", "comments", "collaboration", "github"]
    },
    6: {
      keywords: ["props", "state", "parent", "child", "rerender", "component", "data"],
      bonusKeywords: ["immutable", "useState", "lifting state", "unidirectional"]
    },
    7: {
      keywords: ["margin", "padding", "border", "content", "box-sizing", "border-box"],
      bonusKeywords: ["content-box", "width", "height", "calculation", "total"]
    },
    8: {
      keywords: ["event", "click", "listener", "bubbling", "handler", "addeventlistener"],
      bonusKeywords: ["capturing", "propagation", "stoppropagation", "target", "currenttarget"]
    },
    9: {
      keywords: ["image", "optimize", "cache", "minify", "compress", "lazy", "load"],
      bonusKeywords: ["cdn", "bundle", "lighthouse", "network", "render", "blocking"]
    }
  };
  
  const { keywords, bonusKeywords } = keywordSets[questionIndex] || { keywords: [], bonusKeywords: [] };
  
  // Count keyword matches
  const keywordMatches = keywords.filter(k => trimmedAnswer.includes(k)).length;
  const bonusMatches = bonusKeywords.filter(k => trimmedAnswer.includes(k)).length;
  
  // Calculate score
  score = Math.min(10, 3 + (keywordMatches * 1.5) + (bonusMatches * 1));
  
  // Add word count bonus for detailed answers
  if (wordCount > 30) score = Math.min(10, score + 1);
  if (wordCount > 50) score = Math.min(10, score + 0.5);
  
  // Round score
  score = Math.round(score);
  
  // Generate feedback based on score
  if (score >= 8) {
    feedback = "Excellent answer! You demonstrated strong understanding of the concept.";
    strengths.push("Clear explanation of core concepts");
    if (bonusMatches > 0) strengths.push("Good use of technical terminology");
    if (wordCount > 30) strengths.push("Thorough and detailed response");
  } else if (score >= 6) {
    feedback = "Good answer! You covered the basics well, but could expand on some points.";
    strengths.push("Understood the fundamental concepts");
    improvements.push("Could provide more specific examples");
    improvements.push("Try to cover edge cases or additional details");
  } else if (score >= 4) {
    feedback = "Decent attempt! You touched on some key points but missed important concepts.";
    if (keywordMatches > 0) strengths.push("Some understanding of basic concepts");
    improvements.push("Review the core concepts more thoroughly");
    improvements.push("Practice explaining with concrete examples");
  } else {
    feedback = "This answer needs more work. Review the fundamentals of this topic.";
    improvements.push("Study the fundamental concepts");
    improvements.push("Try to understand why these concepts exist");
    improvements.push("Practice with hands-on coding exercises");
  }
  
  return { score, feedback, strengths, improvements };
};

export const calculateFinalResult = (scores: number[]): {
  overall_score: number;
  level: "Beginner" | "Intermediate" | "Strong";
  summary: string;
  strong_areas: string[];
  weak_areas: string[];
  recommendations: string[];
} => {
  const overall_score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
  
  let level: "Beginner" | "Intermediate" | "Strong";
  if (overall_score >= 7.5) level = "Strong";
  else if (overall_score >= 5) level = "Intermediate";
  else level = "Beginner";
  
  const topics = [
    "Self Introduction",
    "CSS Styling", 
    "Semantic HTML", 
    "JavaScript Variables", 
    "Git Branches", 
    "Pull Requests",
    "React Props/State",
    "CSS Box Model",
    "JavaScript Events",
    "Web Performance"
  ];
  const strong_areas: string[] = [];
  const weak_areas: string[] = [];
  
  scores.forEach((score, i) => {
    if (score >= 7) strong_areas.push(topics[i]);
    else if (score < 5) weak_areas.push(topics[i]);
  });
  
  const recommendations: string[] = [];
  if (weak_areas.length > 0) {
    recommendations.push(`Focus on improving: ${weak_areas.join(", ")}`);
  }
  recommendations.push("Practice building small projects to reinforce concepts");
  recommendations.push("Review documentation for topics you found challenging");
  if (level !== "Strong") {
    recommendations.push("Consider taking structured frontend courses");
  }
  
  let summary = "";
  if (level === "Strong") {
    summary = "Great job! You demonstrated solid frontend knowledge across most topics. Keep building projects to maintain and expand your skills.";
  } else if (level === "Intermediate") {
    summary = "You have a good foundation in frontend development. With some focused practice on weaker areas, you'll be ready for junior developer positions.";
  } else {
    summary = "You're on the right track! Focus on building a stronger foundation in HTML, CSS, and JavaScript fundamentals before diving into frameworks.";
  }
  
  return { overall_score, level, summary, strong_areas, weak_areas, recommendations };
};
