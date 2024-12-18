import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  UserGroupIcon,
  ListBulletIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  PlusCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Navigation from '../components/Navigation';
import { RootState } from '../redux/store';
import { formatTimeAgo } from '../utils/dateUtils';
import { logout } from '../redux/slices/authSlice';

interface Stats {
  teamMembers: number;
  activeTasks: number;
  documents: number;
  messages: number;
}

interface Activity {
  id: string;
  message: string;
  time: string;
  type: 'task' | 'document' | 'chat' | 'team';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    teamMembers: 0,
    activeTasks: 0,
    documents: 0,
    messages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch stats from the backend
        const response = await fetch('http://localhost:5001/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          dispatch(logout());
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats({
          teamMembers: data.teamMembers || 0,
          activeTasks: data.activeTasks || 0,
          documents: data.documents || 0,
          messages: data.unreadMessages || 0,
        });

        // Fetch recent activity
        const activityResponse = await fetch('http://localhost:5001/api/dashboard/activity', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!activityResponse.ok) {
          throw new Error('Failed to fetch activity data');
        }

        const activityData = await activityResponse.json();
        setRecentActivity(activityData.map((activity: any) => ({
          id: activity._id,
          message: activity.message,
          time: formatTimeAgo(activity.createdAt),
          type: activity.type
        })));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, isAuthenticated, navigate, dispatch]);

  const statsConfig = [
    {
      name: 'Active Tasks',
      value: stats.activeTasks,
      icon: ListBulletIcon,
      color: 'bg-gradient-to-br from-green-400 to-green-600',
      link: '/tasks',
      linkText: 'View All Tasks',
      description: 'Tasks needing attention'
    },
    {
      name: 'Documents',
      value: stats.documents,
      icon: DocumentIcon,
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      link: '/documents',
      linkText: 'View All Documents',
      description: 'Shared documents'
    },
    {
      name: 'Team Members',
      value: stats.teamMembers,
      icon: UserGroupIcon,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      link: null,
      description: 'Active members'
    },
    {
      name: 'Messages',
      value: stats.messages,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      link: '/chat',
      linkText: 'Open Chat',
      description: 'Unread messages'
    },
  ];

  const quickActions = [
    {
      name: 'New Task',
      icon: PlusCircleIcon,
      color: 'text-green-600',
      onClick: () => navigate('/tasks/new'),
      bgColor: 'bg-green-50',
      hoverBg: 'hover:bg-green-100'
    },
    {
      name: 'New Document',
      icon: DocumentIcon,
      color: 'text-purple-600',
      onClick: () => navigate('/documents/new'),
      bgColor: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100'
    },
    {
      name: 'Team Chat',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-yellow-600',
      onClick: () => navigate('/chat'),
      bgColor: 'bg-yellow-50',
      hoverBg: 'hover:bg-yellow-100'
    },
    {
      name: 'Calendar',
      icon: CalendarIcon,
      color: 'text-blue-600',
      onClick: () => navigate('/calendar'),
      bgColor: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <ListBulletIcon className="h-5 w-5 text-green-500" />;
      case 'document':
        return <DocumentIcon className="h-5 w-5 text-purple-500" />;
      case 'chat':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-yellow-500" />;
      case 'team':
        return <UserGroupIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated || !token) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 truncate">
                Welcome back, {user?.username}!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Here's what's happening with your team today
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-2 rounded-full bg-green-400"></span>
                Online
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user?.role || 'Member'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => (
            <Link
              key={stat.name}
              to={stat.link || '#'}
              className={`block group ${stat.link ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-lg p-3 ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </div>
                          <div className="ml-2 text-sm text-gray-500">
                            {stat.description}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                {stat.link && (
                  <div className="bg-gray-50 px-6 py-3">
                    <div className="text-sm flex justify-between items-center">
                      <span className="font-medium text-blue-600 group-hover:text-blue-900">
                        {stat.linkText}
                      </span>
                      <svg className="h-5 w-5 text-blue-600 group-hover:text-blue-900 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-500">Get started with common tasks</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    onClick={action.onClick}
                    className={`flex items-center p-4 rounded-lg ${action.bgColor} ${action.hoverBg} transition-colors duration-200`}
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <span className="ml-3 text-sm font-medium text-gray-900">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="mt-1 text-sm text-gray-500">Your team's latest updates</p>
              <div className="mt-6 flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, idx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {idx !== recentActivity.length - 1 && (
                          <span
                            className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center ring-8 ring-white">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-500">
                              {activity.message}
                            </p>
                            <div className="mt-1 text-sm text-gray-400">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
