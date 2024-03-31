'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config'; // Import auth object from config.js
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import signInWithEmailAndPassword function

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Specify type for error state
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      if (!email || !password) {
        setError('Please fill in all fields.'); // Set error message if fields are empty
        return;
      }

      await signInWithEmailAndPassword(auth, email, password); // Using auth object for authentication
      setEmail('');
      setPassword('');
      setError(null); // Clear error message
      router.push('/dashboard');
    } catch (error) {
      setError('Invalid email or password.'); // Set error message for invalid credentials
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-950">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Log In</h1>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>} {/* Render error message */}
        <button 
          onClick={handleSignIn}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default LogIn;