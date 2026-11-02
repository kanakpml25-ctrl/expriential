import { Quiz, QuizSubmission, StudentProfile } from '../types/quiz';

export const defaultStudentProfile: StudentProfile = {
  name: 'Kanak P.',
  rollNumber: '25ML042',
  email: 'kanakp.ml25@sbjit.edu.in',
  department: 'Artificial Intelligence & Machine Learning',
  institution: 'S. B. Jain Institute of Technology, Management & Research',
};

export const initialQuizzes: Quiz[] = [
  {
    id: 'quiz-dsa-101',
    title: 'Data Structures & Algorithmic Complexity',
    courseCode: 'CS301',
    category: 'Computer Science',
    description: 'Assessment covering asymptotic analysis, balanced search trees, graph traversals, and dynamic programming heuristics.',
    durationMinutes: 15,
    totalPoints: 20,
    passingPercentage: 60,
    negativeMarking: 0.25,
    difficulty: 'Intermediate',
    isPublished: true,
    shuffleQuestions: false,
    instructorName: 'Dr. V. Sharma (Dept of CSE)',
    createdAt: '2026-10-15T09:30:00Z',
    questions: [
      {
        id: 'q-dsa-1',
        text: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST) of n elements?',
        category: 'Data Structures',
        difficulty: 'Beginner',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-1a', text: 'O(log n)' },
          { id: 'opt-1b', text: 'O(n)' },
          { id: 'opt-1c', text: 'O(n log n)' },
          { id: 'opt-1d', text: 'O(1)' }
        ],
        correctOptionIds: ['opt-1b'],
        explanation: 'In the worst case, an unbalanced BST can degenerate into a linear chain (like a linked list) when elements are inserted in sorted order, resulting in O(n) search time.'
      },
      {
        id: 'q-dsa-2',
        text: 'Consider the following recurrence relation for the Merge Sort algorithm:\nT(n) = 2T(n/2) + O(n)\nWhat is the resulting asymptotic bound by the Master Theorem?',
        category: 'Algorithms',
        difficulty: 'Intermediate',
        type: 'single',
        points: 4,
        codeSnippet: `T(n) = 2T(n/2) + cn\n// a = 2, b = 2, f(n) = O(n)`,
        options: [
          { id: 'opt-2a', text: 'Θ(n log n)' },
          { id: 'opt-2b', text: 'Θ(n²)' },
          { id: 'opt-2c', text: 'Θ(log n)' },
          { id: 'opt-2d', text: 'Θ(n)' }
        ],
        correctOptionIds: ['opt-2a'],
        explanation: 'Here a = 2, b = 2, so log_b(a) = log_2(2) = 1. Since f(n) = Θ(n^1), by Case 2 of Master Theorem, T(n) = Θ(n^1 * log n) = Θ(n log n).'
      },
      {
        id: 'q-dsa-3',
        text: 'Which of the following statements regarding Graph Traversal algorithms are TRUE?',
        category: 'Algorithms',
        difficulty: 'Intermediate',
        type: 'multiple',
        points: 4,
        options: [
          { id: 'opt-3a', text: 'Breadth-First Search (BFS) finds the shortest path in unweighted graphs.' },
          { id: 'opt-3b', text: 'Depth-First Search (DFS) can be utilized to detect cycles in directed graphs via back-edges.' },
          { id: 'opt-3c', text: 'Dijkstra algorithm works correctly with negative edge weights.' },
          { id: 'opt-3d', text: 'Topological Sort can be performed on cyclic directed graphs.' }
        ],
        correctOptionIds: ['opt-3a', 'opt-3b'],
        explanation: 'BFS discovers nodes layer by layer, guaranteeing the shortest path in unweighted graphs. In DFS of directed graphs, back-edges signal cycles. Dijkstra fails with negative weights (Bellman-Ford is needed), and Topological Sort strictly requires Directed Acyclic Graphs (DAGs).'
      },
      {
        id: 'q-dsa-4',
        text: 'An array implementation of a Min-Heap stores elements starting at index 1. For a node located at index i, at which index is its right child located?',
        category: 'Data Structures',
        difficulty: 'Beginner',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-4a', text: '2i' },
          { id: 'opt-4b', text: '2i + 1' },
          { id: 'opt-4c', text: '2i - 1' },
          { id: 'opt-4d', text: 'i / 2' }
        ],
        correctOptionIds: ['opt-4b'],
        explanation: 'In 1-based indexing for a binary heap, the left child is at index 2i, the right child is at 2i + 1, and the parent is at floor(i/2).'
      },
      {
        id: 'q-dsa-5',
        text: 'True or False: Hash table lookups always guarantee strictly O(1) worst-case time complexity.',
        category: 'Data Structures',
        difficulty: 'Beginner',
        type: 'boolean',
        points: 4,
        options: [
          { id: 'opt-5a', text: 'True' },
          { id: 'opt-5b', text: 'False' }
        ],
        correctOptionIds: ['opt-5b'],
        explanation: 'False. While average-case lookup in a hash table is O(1), worst-case lookup can degrade to O(n) if severe hash collisions cause all keys to map to the same bucket chain.'
      }
    ]
  },
  {
    id: 'quiz-ml-202',
    title: 'Machine Learning & Neural Architectures',
    courseCode: 'AI402',
    category: 'Artificial Intelligence',
    description: 'Foundations of optimization, gradient descent, loss functions, regularization, and deep network mechanics.',
    durationMinutes: 12,
    totalPoints: 20,
    passingPercentage: 65,
    negativeMarking: 0.5,
    difficulty: 'Advanced',
    isPublished: true,
    shuffleQuestions: true,
    instructorName: 'Prof. R. Deshmukh (Dept of AI & DS)',
    createdAt: '2026-10-18T14:15:00Z',
    questions: [
      {
        id: 'q-ml-1',
        text: 'What primary issue in deep neural networks does the introduction of Residual Connections (ResNet) mitigate?',
        category: 'Deep Learning',
        difficulty: 'Intermediate',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-ml1a', text: 'Overfitting on small datasets' },
          { id: 'opt-ml1b', text: 'Vanishing and exploding gradient problem during backpropagation' },
          { id: 'opt-ml1c', text: 'Slow forward pass execution speed' },
          { id: 'opt-ml1d', text: 'Inability to process non-linear activation functions' }
        ],
        correctOptionIds: ['opt-ml1b'],
        explanation: 'Skip / residual connections allow gradients to backpropagate directly through the identity mappings, preventing gradients from diminishing to near-zero in very deep networks.'
      },
      {
        id: 'q-ml-2',
        text: 'Which regularization technique adds the absolute values of coefficients (L1 norm) to the loss function, encouraging parameter sparsity?',
        category: 'Optimization',
        difficulty: 'Beginner',
        type: 'single',
        points: 4,
        codeSnippet: `Loss = MSE(y, y_pred) + λ * ∑ |w_i|`,
        options: [
          { id: 'opt-ml2a', text: 'Ridge Regularization (L2)' },
          { id: 'opt-ml2b', text: 'Lasso Regularization (L1)' },
          { id: 'opt-ml2c', text: 'Dropout' },
          { id: 'opt-ml2d', text: 'Batch Normalization' }
        ],
        correctOptionIds: ['opt-ml2b'],
        explanation: 'Lasso (Least Absolute Shrinkage and Selection Operator) utilizes L1 penalty ∑|w_i|, driving less important feature weights exactly to zero, effectively acting as feature selection.'
      },
      {
        id: 'q-ml-3',
        text: 'Select all evaluation metrics that are insensitive to severe class imbalance in binary classification tasks:',
        category: 'Evaluation',
        difficulty: 'Advanced',
        type: 'multiple',
        points: 4,
        options: [
          { id: 'opt-ml3a', text: 'Raw Classification Accuracy' },
          { id: 'opt-ml3b', text: 'Precision-Recall AUC (PR-AUC)' },
          { id: 'opt-ml3c', text: 'F1 Score (Harmonic Mean of Precision & Recall)' },
          { id: 'opt-ml3d', text: 'Mean Squared Error' }
        ],
        correctOptionIds: ['opt-ml3b', 'opt-ml3c'],
        explanation: 'When 99% of samples belong to the negative class, raw accuracy easily hits 99% by simply predicting negative. PR-AUC and F1-score focus strictly on true positives and penalize false positives/negatives appropriately.'
      },
      {
        id: 'q-ml-4',
        text: 'In the Scaled Dot-Product Attention formula Attention(Q, K, V) = softmax((Q K^T) / √d_k) V, why is the dot product divided by √d_k?',
        category: 'Transformers',
        difficulty: 'Advanced',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-ml4a', text: 'To convert dot products into probability distributions directly' },
          { id: 'opt-ml4b', text: 'To prevent large dot products from pushing softmax into regions with extremely tiny gradients' },
          { id: 'opt-ml4c', text: 'To reduce memory consumption of attention matrices' },
          { id: 'opt-ml4d', text: 'To ensure queries and keys have orthogonal projections' }
        ],
        correctOptionIds: ['opt-ml4b'],
        explanation: 'For large values of d_k, dot products grow large in magnitude, driving softmax into regions with extremely small gradients. Scaling by 1/√d_k counteracts this effect.'
      },
      {
        id: 'q-ml-5',
        text: 'True or False: Dropout is kept active with the same probability during model inference / test evaluation time.',
        category: 'Deep Learning',
        difficulty: 'Beginner',
        type: 'boolean',
        points: 4,
        options: [
          { id: 'opt-ml5a', text: 'True' },
          { id: 'opt-ml5b', text: 'False' }
        ],
        correctOptionIds: ['opt-ml5b'],
        explanation: 'False. Dropout is exclusively an active regularizer during training. At inference, all neurons are active, with outputs scaled accordingly (or weights inverted during training).'
      }
    ]
  },
  {
    id: 'quiz-db-303',
    title: 'Database Management Systems & SQL Internals',
    courseCode: 'DB204',
    category: 'Databases',
    description: 'Relational algebra, normal forms (1NF to BCNF), indexing structures (B+ Trees), and transaction concurrency (ACID).',
    durationMinutes: 10,
    totalPoints: 16,
    passingPercentage: 60,
    negativeMarking: 0.25,
    difficulty: 'Intermediate',
    isPublished: true,
    shuffleQuestions: false,
    instructorName: 'Prof. A. Kulkarni (Dept of IT)',
    createdAt: '2026-10-20T11:00:00Z',
    questions: [
      {
        id: 'q-db-1',
        text: 'Which normal form requires that a table is already in 2NF and contains NO transitive functional dependencies among non-prime attributes?',
        category: 'Normalization',
        difficulty: 'Beginner',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-db1a', text: 'First Normal Form (1NF)' },
          { id: 'opt-db1b', text: 'Second Normal Form (2NF)' },
          { id: 'opt-db1c', text: 'Third Normal Form (3NF)' },
          { id: 'opt-db1d', text: 'Boyce-Codd Normal Form (BCNF)' }
        ],
        correctOptionIds: ['opt-db1c'],
        explanation: '3NF requires 2NF compliance and ensures non-prime attributes do not depend transitively on candidate keys (i.e. X -> A must have X as superkey or A as prime attribute).'
      },
      {
        id: 'q-db-2',
        text: 'In database transaction management, what property ensures that all operations in a transaction are executed completely, or none are executed at all?',
        category: 'Transactions',
        difficulty: 'Beginner',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-db2a', text: 'Atomicity' },
          { id: 'opt-db2b', text: 'Consistency' },
          { id: 'opt-db2c', text: 'Isolation' },
          { id: 'opt-db2d', text: 'Durability' }
        ],
        correctOptionIds: ['opt-db2a'],
        explanation: 'Atomicity is the "all-or-nothing" rule of ACID, handled via rollback logs and write-ahead logging.'
      },
      {
        id: 'q-db-3',
        text: 'Consider the SQL statement:\nSELECT department, AVG(salary) FROM employees GROUP BY department HAVING AVG(salary) > 60000;\nWhich clause filters aggregated group results?',
        category: 'SQL Queries',
        difficulty: 'Intermediate',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-db3a', text: 'WHERE' },
          { id: 'opt-db3b', text: 'GROUP BY' },
          { id: 'opt-db3c', text: 'HAVING' },
          { id: 'opt-db3d', text: 'ORDER BY' }
        ],
        correctOptionIds: ['opt-db3c'],
        explanation: 'The WHERE clause filters individual rows before grouping, whereas the HAVING clause filters groups produced by the GROUP BY aggregation.'
      },
      {
        id: 'q-db-4',
        text: 'Why are B+ Trees predominantly preferred over standard B Trees for disk-based database indexing?',
        category: 'Storage & Indexing',
        difficulty: 'Intermediate',
        type: 'multiple',
        points: 4,
        options: [
          { id: 'opt-db4a', text: 'All actual data records/pointers reside solely in leaf nodes, allowing internal nodes to hold more branch keys.' },
          { id: 'opt-db4b', text: 'Leaf nodes are linked in a sequential doubly linked list, enabling highly efficient range queries.' },
          { id: 'opt-db4c', text: 'B+ Trees have larger height than B Trees for the same number of keys.' },
          { id: 'opt-db4d', text: 'B+ Trees do not require rebalancing during deletions.' }
        ],
        correctOptionIds: ['opt-db4a', 'opt-db4b'],
        explanation: 'Because internal nodes only store keys (no data pointers), their fanout is significantly higher, reducing disk I/O. Furthermore, linked leaf nodes make range scans (e.g. BETWEEN 10 AND 50) rapid linear traversals.'
      }
    ]
  },
  {
    id: 'quiz-wt-404',
    title: 'Full-Stack Web Architecture & Performance',
    courseCode: 'WT205',
    category: 'Web Technology',
    description: 'HTTP/2 vs HTTP/3, browser event loop, virtual DOM reconciliation, state immutability, and API security.',
    durationMinutes: 10,
    totalPoints: 16,
    passingPercentage: 60,
    negativeMarking: 0.25,
    difficulty: 'Intermediate',
    isPublished: true,
    shuffleQuestions: false,
    instructorName: 'Prof. S. Joshi (Dept of CSE)',
    createdAt: '2026-10-22T16:00:00Z',
    questions: [
      {
        id: 'q-wt-1',
        text: 'In the JavaScript event loop, which queue has highest execution priority upon completion of current synchronous code?',
        category: 'JavaScript Runtime',
        difficulty: 'Intermediate',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-wt1a', text: 'Task / Macrotask Queue (setTimeout, setInterval)' },
          { id: 'opt-wt1b', text: 'Microtask Queue (Promise.then, queueMicrotask)' },
          { id: 'opt-wt1c', text: 'Rendering Frame Callback Queue' },
          { id: 'opt-wt1d', text: 'Idle Callback Queue' }
        ],
        correctOptionIds: ['opt-wt1b'],
        explanation: 'The microtask queue is drained completely before the event loop processes any macrotask from the task queue, even if a macrotask timer has elapsed.'
      },
      {
        id: 'q-wt-2',
        text: 'What HTTP response header protects against Cross-Site Scripting (XSS) by restricting sources from which executable scripts can be loaded?',
        category: 'Web Security',
        difficulty: 'Intermediate',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-wt2a', text: 'Access-Control-Allow-Origin' },
          { id: 'opt-wt2b', text: 'Content-Security-Policy (CSP)' },
          { id: 'opt-wt2c', text: 'Strict-Transport-Security (HSTS)' },
          { id: 'opt-wt2d', text: 'X-Frame-Options' }
        ],
        correctOptionIds: ['opt-wt2b'],
        explanation: 'Content-Security-Policy restricts origins of scripts, images, styles, and plugins, preventing inline script injection and unauthorized resource fetching.'
      },
      {
        id: 'q-wt-3',
        text: 'True or False: React state mutations done directly via `state.property = newValue` will reliably trigger component re-renders.',
        category: 'Frontend Frameworks',
        difficulty: 'Beginner',
        type: 'boolean',
        points: 4,
        options: [
          { id: 'opt-wt3a', text: 'True' },
          { id: 'opt-wt3b', text: 'False' }
        ],
        correctOptionIds: ['opt-wt3b'],
        explanation: 'False. React relies on shallow reference equality checks. Directly mutating an object retains the same object reference, so React skips re-rendering. State must be updated immutably.'
      },
      {
        id: 'q-wt-4',
        text: 'Which underlying transport protocol does HTTP/3 utilize instead of standard TCP to eliminate Head-of-Line blocking?',
        category: 'Networking',
        difficulty: 'Intermediate',
        type: 'single',
        points: 4,
        options: [
          { id: 'opt-wt4a', text: 'SCTP' },
          { id: 'opt-wt4b', text: 'QUIC (over UDP)' },
          { id: 'opt-wt4c', text: 'WebSockets' },
          { id: 'opt-wt4d', text: 'Raw ICMP' }
        ],
        correctOptionIds: ['opt-wt4b'],
        explanation: 'HTTP/3 is built on QUIC, an encrypted transport protocol based on UDP. In QUIC, independent streams suffer no cross-stream packet loss delays, eliminating TCP head-of-line blocking.'
      }
    ]
  }
];

export const initialSubmissions: QuizSubmission[] = [
  {
    id: 'sub-101-demo',
    quizId: 'quiz-dsa-101',
    quizTitle: 'Data Structures & Algorithmic Complexity',
    courseCode: 'CS301',
    studentName: 'Kanak P.',
    studentRoll: '25ML042',
    studentEmail: 'kanakp.ml25@sbjit.edu.in',
    score: 16,
    maxScore: 20,
    percentage: 80,
    passed: true,
    timeTakenSeconds: 524,
    totalQuestions: 5,
    correctAnswersCount: 4,
    incorrectAnswersCount: 1,
    unansweredCount: 0,
    submittedAt: '2026-10-28T10:45:00Z',
    answers: {
      'q-dsa-1': ['opt-1b'],
      'q-dsa-2': ['opt-2a'],
      'q-dsa-3': ['opt-3a', 'opt-3b'],
      'q-dsa-4': ['opt-4b'],
      'q-dsa-5': ['opt-5a'] // answered True instead of False
    }
  },
  {
    id: 'sub-102-demo',
    quizId: 'quiz-db-303',
    quizTitle: 'Database Management Systems & SQL Internals',
    courseCode: 'DB204',
    studentName: 'Aryan Verma',
    studentRoll: '25CS019',
    studentEmail: 'aryan.v@sbjit.edu.in',
    score: 16,
    maxScore: 16,
    percentage: 100,
    passed: true,
    timeTakenSeconds: 380,
    totalQuestions: 4,
    correctAnswersCount: 4,
    incorrectAnswersCount: 0,
    unansweredCount: 0,
    submittedAt: '2026-10-29T14:20:00Z',
    answers: {
      'q-db-1': ['opt-db1c'],
      'q-db-2': ['opt-db2a'],
      'q-db-3': ['opt-db3c'],
      'q-db-4': ['opt-db4a', 'opt-db4b']
    }
  },
  {
    id: 'sub-103-demo',
    quizId: 'quiz-dsa-101',
    quizTitle: 'Data Structures & Algorithmic Complexity',
    courseCode: 'CS301',
    studentName: 'Sneha Patel',
    studentRoll: '25ML088',
    studentEmail: 'sneha.p@sbjit.edu.in',
    score: 12,
    maxScore: 20,
    percentage: 60,
    passed: true,
    timeTakenSeconds: 610,
    totalQuestions: 5,
    correctAnswersCount: 3,
    incorrectAnswersCount: 2,
    unansweredCount: 0,
    submittedAt: '2026-10-29T16:10:00Z',
    answers: {
      'q-dsa-1': ['opt-1b'],
      'q-dsa-2': ['opt-2a'],
      'q-dsa-3': ['opt-3a'],
      'q-dsa-4': ['opt-4a'],
      'q-dsa-5': ['opt-5b']
    }
  }
];
