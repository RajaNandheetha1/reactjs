import Cookies from 'js-cookie';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginstyle.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const url = isLogin
      ? 'http://localhost:2262/assign/wp-json/custom-auth/v1/login'
      : 'http://localhost:2262/assign/wp-json/custom-auth/v1/signup';
    const body = isLogin ? { username, password } : { username, email, password };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      Cookies.set('token', data.token);
      setSuccessMessage(isLogin ? 'Successfully logged in!' : 'Successfully signed up!');
      setTimeout(() => navigate('/'), 2000); 
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="login-container">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        {!isLogin && (
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        )}
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Login'}
      </button>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default Login;
