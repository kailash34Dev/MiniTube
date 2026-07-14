import MainLayout from '../components/MainLayout';
import DashboardVideoList from '../components/DashboardVideoList';

export default function Dashboard() {
  return (
    <MainLayout showSidebar={false}>
      <div className="dashboard-content">
        <h1 className="dashboard-header">Channel Dashboard</h1>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-title">Total Views</span>
            <span className="metric-value">1.4M</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Watch Time (hours)</span>
            <span className="metric-value">45.2K</span>
          </div>
          <div className="metric-card">
            <span className="metric-title">Subscribers</span>
            <span className="metric-value">12.5K</span>
          </div>
        </div>

        <DashboardVideoList />
      </div>
    </MainLayout>
  );
}
