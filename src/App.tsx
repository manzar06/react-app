import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Topics from './pages/Topics';
import Subscriptions from './pages/Subscriptions';
import OpenAITester from './components/OpenAITester';
import PostSearch from './components/PostSearch';
import { TopicProvider } from './contexts/TopicContext';
// Import Leaflet CSS first
import 'leaflet/dist/leaflet.css';
// Then import our custom CSS
import './App.css';

function App() {
  return (
    <TopicProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="topics" element={<Topics />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="openai-test" element={<OpenAITester />} />
            <Route path="search" element={<PostSearch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TopicProvider>
  );
}

export default App;
