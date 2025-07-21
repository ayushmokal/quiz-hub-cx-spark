import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QuizEngine } from './QuizEngine';
import { topicsAPI } from '../../services/api';
import { Topic } from '../../types';

export function QuizRoute() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopic = async () => {
      if (!topicId) {
        setError('No topic ID provided');
        setLoading(false);
        return;
      }

      try {
        const topics = await topicsAPI.getTopics();
        const foundTopic = topics.find(t => t.id === topicId);
        
        if (!foundTopic) {
          setError('Topic not found');
          setLoading(false);
          return;
        }

        setTopic(foundTopic);
        setLoading(false);
      } catch (err) {
        setError('Failed to load topic');
        setLoading(false);
      }
    };

    loadTopic();
  }, [topicId]);

  const handleQuizComplete = (score: number, accuracy: number) => {
    // Navigate back to quiz selection after completion
    navigate('/quiz');
  };

  const handleQuizExit = () => {
    // Navigate back to quiz selection
    navigate('/quiz');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#46494D]">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
          <p className="text-[#46494D] mb-4">{error || 'The requested quiz could not be found.'}</p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Quiz Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizEngine
      topic={topic}
      onComplete={handleQuizComplete}
      onExit={handleQuizExit}
    />
  );
}
