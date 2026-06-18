import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';

import NewCustomer from './pages/NewCustomer';
import EditDeleteCustomer from './pages/EditDeleteCustomer';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-erp-dark text-text-primary">
        <Header />
        <main className="flex-1 w-full p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-customer" element={<NewCustomer />} />
            <Route path="/edit-delete-customer" element={<EditDeleteCustomer />} />
            {/* Other routes will go here */}
          </Routes>
        </main>
      </div>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
