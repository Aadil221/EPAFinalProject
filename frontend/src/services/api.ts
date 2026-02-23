import { awsConfig } from '../aws-config';

export interface Question {
  id: string;
  category: string;
  competency: string;
  create_at: string;
  difficulty: string;
  question_text: string;
  reference_answer: string;
}

export interface EvaluationRequest {
  question: string;
  answer: string;
  competency_type?: string;
}

export interface EvaluationResponse {
  is_correct: boolean;
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  marcus_comment: string;
}

const API_BASE_URL = awsConfig.API.REST.InterviewQuestionsAPI.endpoint;

/**
 * Public signup endpoint (no authentication required)
 */
export async function signupUser(email: string): Promise<{ message: string; username: string }> {
  const response = await fetch(`${API_BASE_URL}signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error((await response.json()).error || 'Signup failed');
  return response.json();
}

/**
 * Fetch all questions from the API
 */
export async function getAllQuestions(authToken: string | null): Promise<Question[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = authToken;
  }

  const response = await fetch(`${API_BASE_URL}questions`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch questions: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Fetch a single question by ID
 */
export async function getQuestionById(id: string, authToken: string | null): Promise<Question> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = authToken;
  }

  const response = await fetch(`${API_BASE_URL}questions/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Question not found');
    }
    const errorText = await response.text();
    throw new Error(`Failed to fetch question: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Evaluate a candidate's answer using Marcus AI
 */
export async function evaluateAnswer(
  request: EvaluationRequest,
  authToken: string | null
): Promise<EvaluationResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = authToken;
  }

  const response = await fetch(`${API_BASE_URL}answers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to evaluate answer: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Create a new question (Admin only)
 */
export async function createQuestion(
  questionData: {
    question_text: string;
    category: string;
    difficulty: string;
    reference_answer?: string;
  },
  authToken: string
): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify(questionData),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    const errorText = await response.text();
    throw new Error(`Failed to create question: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Update an existing question (Admin only)
 */
export async function updateQuestion(
  id: string,
  questionData: {
    question_text?: string;
    category?: string;
    difficulty?: string;
    reference_answer?: string;
  },
  authToken: string
): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}questions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify(questionData),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    if (response.status === 404) {
      throw new Error('Question not found');
    }
    const errorText = await response.text();
    throw new Error(`Failed to update question: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Delete a question (Admin only)
 */
export async function deleteQuestion(id: string, authToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}questions/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authToken,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Forbidden: Admin access required');
    }
    if (response.status === 404) {
      throw new Error('Question not found');
    }
    const errorText = await response.text();
    throw new Error(`Failed to delete question: ${response.status} ${errorText}`);
  }
}
