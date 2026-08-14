import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { RouteLoadingState } from './routes/RouteLoadingState';

const SolutionsRoute = lazy(() => import('./routes/SolutionsRoute'));
const ReferenceProjectsRoute = lazy(() => import('./routes/ReferenceProjectsRoute'));
const HowWeWorkRoute = lazy(() => import('./routes/HowWeWorkRoute'));
const StartDiscoveryRoute = lazy(() => import('./routes/StartDiscoveryRoute'));

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route
            path="solutions"
            element={(
              <Suspense fallback={<RouteLoadingState />}>
                <SolutionsRoute />
              </Suspense>
            )}
          />
          <Route
            path="reference-projects"
            element={(
              <Suspense fallback={<RouteLoadingState />}>
                <ReferenceProjectsRoute />
              </Suspense>
            )}
          />
          <Route
            path="how-we-work"
            element={(
              <Suspense fallback={<RouteLoadingState />}>
                <HowWeWorkRoute />
              </Suspense>
            )}
          />
          <Route
            path="start"
            element={(
              <Suspense fallback={<RouteLoadingState />}>
                <StartDiscoveryRoute />
              </Suspense>
            )}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
