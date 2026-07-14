import { useLocation } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import VideoGrid from '../components/VideoGrid';

export default function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');

  return (
    <MainLayout showSidebar={true} defaultCollapsed={true}>
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Search Results for "{query}"
        </h2>
      </div>
      <VideoGrid searchQuery={query} />
    </MainLayout>
  );
}
