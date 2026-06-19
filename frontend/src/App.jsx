import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import { AppProvider } from './context/AppContext';
import CustomersPage from './pages/CustomersPage';
import DashboardPage from './pages/DashboardPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
