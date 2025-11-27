import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts';
import ToastContainer from './components/Toast/ToastContainer';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PendingProperties, AllProperties } from './pages/Properties';
import PropertyDetail from './pages/Properties/PropertyDetail';
import { Users, UserDetail } from './pages/Users';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {/* Users Routes */}
            <Route path="users">
              <Route index element={<Users />} />
              <Route path=":id" element={<UserDetail />} />
            </Route>
            
            {/* Properties Routes */}
            <Route path="properties">
              <Route path="pending" element={<PendingProperties />} />
              <Route path="all" element={<AllProperties />} />
              <Route path=":id" element={<PropertyDetail />} />
              <Route index element={<Navigate to="/properties/all" replace />} />
            </Route>
            
            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

