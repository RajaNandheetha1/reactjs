import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:2262/assign/wp-json/custom-auth/v1/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => navigate('/login'));
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {user.username}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default Home;
