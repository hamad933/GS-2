import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { PublicRoutePage } from './pages/PublicRoutePage';
import { PUBLIC_PAGE_CONTENT } from './routes/publicRoutes';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          {PUBLIC_PAGE_CONTENT.map((page) => (
            <Route
              key={page.path}
              path={page.path.slice(1)}
              element={<PublicRoutePage page={page} />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
