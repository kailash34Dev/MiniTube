import MainLayout from '../components/MainLayout';
import VideoGrid from '../components/VideoGrid';

export default function Home() {
  return (
    <MainLayout showSidebar={true} defaultCollapsed={true}>
      <VideoGrid />
    </MainLayout>
  );
}
