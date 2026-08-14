import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import {
  HowWeWorkPage,
  ReferenceProjectsPage,
  SolutionsPage,
  StartDiscoveryPage,
} from './routes/IntegratedPublicPages';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="solutions" element={<SolutionsPage />} />
          <Route path="reference-projects" element={<ReferenceProjectsPage />} />
          <Route path="how-we-work" element={<HowWeWorkPage />} />
          <Route path="start" element={<StartDiscoveryPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
