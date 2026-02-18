import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import StatsCard from '../../components/admin/StatsCard';
import ChartWrapper from '../../components/admin/ChartWrapper';
import { getAIStats } from '../../services/adminService';
import toast from 'react-hot-toast';

/**
 * Admin AI & Chatbot Analytics Page
 * Shows chat session stats, trends, and recent sessions
 */

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const AIAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAIStats();
        setData(res.data);
      } catch {
        toast.error('Failed to load AI stats');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const sessionsByDay = (data?.sessionsByDay || []).map(d => ({
    date: d._id,
    Sessions: d.count
  }));

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Chat Sessions"
          value={loading ? '...' : (data?.totalSessions || 0).toLocaleString()}
          icon={ChatBubbleLeftRightIcon}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Sessions (Last 30 Days)"
          value={loading ? '...' : (data?.sessionsByDay?.reduce((sum, d) => sum + d.count, 0) || 0).toLocaleString()}
          icon={SparklesIcon}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Recent Sessions"
          value={loading ? '...' : (data?.recentSessions?.length || 0).toString()}
          icon={ChatBubbleLeftRightIcon}
          color="indigo"
          trendLabel="in latest batch"
          loading={loading}
        />
      </div>

      {/* Sessions Trend Chart */}
      <ChartWrapper title="Daily Chat Sessions (Last 30 Days)" loading={loading}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={sessionsByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="Sessions" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Chat Sessions</h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : (data?.recentSessions || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No chat sessions yet</p>
        ) : (
          <div className="space-y-2">
            {(data?.recentSessions || []).map((session, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Session #{i + 1}
                    {session.user && (
                      <span className="text-xs text-gray-400 ml-2">(User: {session.user})</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {session.messages?.length || 0} messages
                  </p>
                </div>
                <span className="text-xs text-gray-400">{formatDate(session.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalyticsPage;
