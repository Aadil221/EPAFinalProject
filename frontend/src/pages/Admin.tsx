import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type Question,
} from '../services/api';
import './Admin.css';

export default function Admin() {
  const navigate = useNavigate();
  const { user, getAuthToken } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    question_text: '',
    category: '',
    difficulty: 'Medium',
    reference_answer: '',
  });

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setCheckingAdmin(true);
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] | undefined;
        const adminAccess = groups?.includes('Admin') || false;

        setIsAdmin(adminAccess);

        if (!adminAccess) {
          setError('Access Denied: Admin privileges required');
          setTimeout(() => navigate('/questions'), 2000);
        }
      } catch (err) {
        console.error('Error checking admin access:', err);
        setError('Failed to verify admin access');
        setTimeout(() => navigate('/questions'), 2000);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (user) {
      checkAdminAccess();
    }
  }, [user, navigate]);

  // Load questions
  const loadQuestions = async () => {
    if (!user || !isAdmin) return;

    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      const data = await getAllQuestions(token);
      setQuestions(data);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && user) {
      loadQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, user]);

  // Computed values
  const categories = useMemo(() => {
    const cats = new Set(questions.map(q => q.category));
    return ['All', ...Array.from(cats)];
  }, [questions]);

  const difficulties = useMemo(() => {
    const diffs = new Set(questions.map(q => q.difficulty.toLowerCase()));
    return ['All', ...Array.from(diffs)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      const matchesSearch =
        question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || question.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'All' ||
        question.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [questions, searchTerm, selectedCategory, selectedDifficulty]);

  // Handlers
  const openCreateModal = () => {
    setModalMode('create');
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      category: '',
      difficulty: 'Medium',
      reference_answer: '',
    });
    setShowModal(true);
  };

  const openEditModal = (question: Question) => {
    setModalMode('edit');
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      category: question.category,
      difficulty: question.difficulty,
      reference_answer: question.reference_answer || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.question_text.trim() || !formData.category.trim()) {
      setError('Question text and category are required');
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) {
        setError('Authentication token not available');
        return;
      }

      if (modalMode === 'create') {
        await createQuestion(formData, token);
      } else if (editingQuestion) {
        await updateQuestion(editingQuestion.id, formData, token);
      }

      await loadQuestions();
      closeModal();
    } catch (err) {
      console.error(`Error ${modalMode === 'create' ? 'creating' : 'updating'} question:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${modalMode} question`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const token = await getAuthToken();
      if (!token) {
        setError('Authentication token not available');
        return;
      }

      await deleteQuestion(id, token);
      await loadQuestions();
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  const getDifficultyClass = (difficulty: string) => {
    return `difficulty difficulty-${difficulty.toLowerCase()}`;
  };

  if (checkingAdmin) {
    return (
      <div className="admin-container">
        <div className="loading">Verifying admin access...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You do not have admin privileges. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage interview questions</p>
        <span className="admin-badge">Admin Access</span>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="admin-actions">
        <button onClick={openCreateModal} className="create-button">
          + Create New Question
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="filter-select"
        >
          {difficulties.map(diff => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading questions...</div>
      ) : (
        <>
          <div className="questions-stats">
            Showing {filteredQuestions.length} of {questions.length} questions
          </div>

          <div className="questions-grid">
            {filteredQuestions.map(question => (
              <div key={question.id} className="question-card">
                <div className="question-header-row">
                  <span className={getDifficultyClass(question.difficulty)}>
                    {question.difficulty}
                  </span>
                  <span className="category-badge">{question.category}</span>
                </div>

                <h3 className="question-title">{question.question_text}</h3>

                {question.reference_answer && (
                  <div className="reference-answer">
                    <strong>Reference Answer:</strong>
                    <p>{question.reference_answer}</p>
                  </div>
                )}

                <div className="question-actions">
                  <button
                    onClick={() => openEditModal(question)}
                    className="edit-button"
                  >
                    Edit
                  </button>

                  {deleteConfirmId === question.id ? (
                    <div className="delete-confirm">
                      <span>Confirm delete?</span>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="confirm-delete"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="cancel-delete"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(question.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Create New Question' : 'Edit Question'}</h2>
              <button onClick={closeModal} className="close-button">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="question_text">Question Text *</label>
                <textarea
                  id="question_text"
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  placeholder="Enter the interview question..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <input
                    type="text"
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., AWS, JavaScript, React"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty *</label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reference_answer">Reference Answer (Optional)</label>
                <textarea
                  id="reference_answer"
                  value={formData.reference_answer}
                  onChange={(e) => setFormData({ ...formData, reference_answer: e.target.value })}
                  placeholder="Enter the ideal answer or key points..."
                  rows={6}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {modalMode === 'create' ? 'Create Question' : 'Update Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
