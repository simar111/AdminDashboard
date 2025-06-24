import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './Admindashboard';
import AdminLogin from './Adminlogin';
import AdminAddProduct from './Adminaddproduct';
import Adminuser from './Adminuser';
import Adminqueries from './Adminqueries';
import Adminproduct from './Adminproducts'

function Main() {
  return (
    <Router>
      
      <Routes>
      
        <Route path="/" element={<AdminLogin />} />
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminDashboard />}>
          <Route path="addproduct" element={<AdminAddProduct />} />
          <Route path="users" element={<Adminuser />} />
          <Route path="queries" element={<Adminqueries />} />
          <Route path="products" element={<Adminproduct />} />
          {/* Add other admin routes here */}
          <Route index element={<div className="p-6"><h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default Main;