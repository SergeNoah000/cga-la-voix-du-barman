import {BrowserRouter, Routes, Route } from 'react-router-dom'

import NoPage from './components/NoPage';
import Login from './components/login';
import ForgotPassword from './components/forgot';
import ResetPassword from './components/reset-password';
import HomePage from './components/home';
import RegistrationForm from './components/contrib-register';
import ScrollLogger from './components/test';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
            <Route index element={<HomePage />} />
            <Route path='/' element={<HomePage />} />
            <Route path='/contrib-register' element={<RegistrationForm />} />
            <Route path='/login' element={<Login />} />
            <Route path='/test' element={<ScrollLogger />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='*' element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
