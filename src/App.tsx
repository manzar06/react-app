import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Topics from './pages/Topics';
import Subscriptions from './pages/Subscriptions';
import OpenAITester from './components/OpenAITester';
// Import Leaflet CSS first
import 'leaflet/dist/leaflet.css';
// Then import our custom CSS
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="post/:id" element={<PostDetail />} />
          <Route path="topics" element={<Topics />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="openai-test" element={<OpenAITester />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
