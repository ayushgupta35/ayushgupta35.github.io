import React, { useState, useEffect } from 'react';
import { visitorService } from '../../firebase/services';

const VisitorAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUniqueVisitors: 0
  });
  const [visitors, setVisitors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsData, visitorsData] = await Promise.all([
        visitorService.getAnalytics(),
        visitorService.getAllVisitors()
      ]);
      
      setAnalytics(analyticsData);
      setVisitors(visitorsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecentVisitors = () => {
    const visitorArray = Object.entries(visitors).map(([id, data]) => ({
      id,
      ...data
    }));
    
    return visitorArray
      .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <div style={{ 
          fontSize: '1.1rem', 
          color: '#6c757d' 
        }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        color: '#721c24'
      }}>
        <h3 style={{ margin: '0 0 1rem 0' }}>Error Loading Analytics</h3>
        <p style={{ margin: '0 0 1rem 0' }}>{error}</p>
        <button
          onClick={fetchAnalytics}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const recentVisitors = getRecentVisitors();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '2rem' 
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.8rem', 
          fontWeight: 'bold',
          color: '#495057'
        }}>
          📊 Site Analytics
        </h2>
        <button
          onClick={fetchAnalytics}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #bbdefb',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            color: '#1976d2'
          }}>
            {analytics.totalUniqueVisitors}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '1rem', 
            color: '#1565c0',
            fontWeight: '500'
          }}>
            Total Unique Visitors
          </p>
        </div>

        <div style={{
          backgroundColor: '#f3e5f5',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e1bee7',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            color: '#7b1fa2'
          }}>
            {Object.keys(visitors).length}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '1rem', 
            color: '#6a1b9a',
            fontWeight: '500'
          }}>
            Total Sessions
          </p>
        </div>

        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #c8e6c9',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            color: '#388e3c'
          }}>
            {recentVisitors.length > 0 ? Math.round(
              Object.values(visitors).reduce((sum, visitor) => sum + (visitor.visitCount || 1), 0) / Object.keys(visitors).length
            ) : 0}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '1rem', 
            color: '#2e7d32',
            fontWeight: '500'
          }}>
            Avg. Visits per User
          </p>
        </div>
      </div>

      {/* Recent Visitors Table */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #dee2e6'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '1.2rem', 
            fontWeight: '600',
            color: '#495057'
          }}>
            Recent Visitor Activity
          </h3>
        </div>
        
        {recentVisitors.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse' 
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left', 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    Visitor ID
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left', 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    First Visit
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'left', 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    Last Visit
                  </th>
                  <th style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'center', 
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    Visit Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentVisitors.map((visitor, index) => (
                  <tr key={visitor.id} style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                  }}>
                    <td style={{ 
                      padding: '0.75rem 1rem', 
                      fontSize: '0.85rem',
                      color: '#6c757d',
                      fontFamily: 'monospace'
                    }}>
                      {visitor.id.slice(-12)}...
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem', 
                      fontSize: '0.9rem',
                      color: '#495057'
                    }}>
                      {formatDate(visitor.firstVisit)}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem', 
                      fontSize: '0.9rem',
                      color: '#495057'
                    }}>
                      {formatDate(visitor.lastVisit)}
                    </td>
                    <td style={{ 
                      padding: '0.75rem 1rem', 
                      fontSize: '0.9rem',
                      color: '#495057',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      {visitor.visitCount || 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center',
            color: '#6c757d' 
          }}>
            No visitor data available yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorAnalytics;
