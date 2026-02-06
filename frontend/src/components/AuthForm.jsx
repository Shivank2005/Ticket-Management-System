// // frontend/src/components/AuthForm.jsx

// import React, { useState } from 'react';
// import authService from '../services/authService';

// const AuthForm = ({ onAuthSuccess }) => {
//   const [isLoginMode, setIsLoginMode] = useState(true);
//   const [resetPasswordMode, setResetPasswordMode] = useState(false);
  
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const resetFormAndErrors = () => {
//     setUsername('');
//     setEmail('');
//     setPassword('');
//     setError('');
//   };

//   const toggleMode = (mode) => {
//     setIsLoginMode(mode === 'login');
//     setResetPasswordMode(false);
//     resetFormAndErrors();
//   };

//   const enterResetPasswordMode = () => {
//     setResetPasswordMode(true);
//     setIsLoginMode(false);
//     resetFormAndErrors();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     if (resetPasswordMode) {
//       if (!email.trim()) {
//         setError('Please enter your email address for password reset.');
//         setIsLoading(false);
//         return;
//       }
//       alert(`A mock password reset link has been sent to ${email}. Check your email!`);
//       setResetPasswordMode(false);
//       setIsLoginMode(true);
//       resetFormAndErrors();
//       setIsLoading(false); // Make sure this is set even if mock
//       return; 
//     }

//     if (!username.trim() || !password.trim() || (!isLoginMode && !email.trim())) {
//       setError('Please fill in all required fields.');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       if (isLoginMode) {
//         // Mock Login Flow
//         const userData = await authService.login(username, password); // This will attempt real backend call now
//         console.log('Login successful:', userData); // Logs received userData from backend (username & token)
//         alert(`Welcome, ${userData.username || 'User'}!`); // Alert confirms successful login
//         onAuthSuccess(userData.username); // Call App.jsx's handler, pass username from backend response
        
//       } else { // Sign Up Flow
//         const result = await authService.register(username, email, password); // This will attempt real backend call
//         console.log('Registration successful:', result); // Log the response from backend
//         alert(result.message || 'Registration successful! You can now log in.'); // Alert confirms registration
        
//         // --- CRITICAL CHANGE HERE: DON'T TRY TO LOG IN. JUST SWITCH MODE ---
//         setIsLoginMode(true); // Switch to login mode for the user to now login manually
//         resetFormAndErrors(); // Clear the form
//       }
//     } catch (err) {
//       // Improved error message display from backend if possible
//       const displayErrorMessage = err.message || 
//                                  (typeof err === 'string' ? err : 'An unexpected error occurred during authentication.');
//       console.error('Authentication error (CAUGHT):', err); // Log full error object
//       setError(displayErrorMessage); 
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // --- Rest of your component (rendering logic) is unchanged from previous ---
//   const currentTitle = resetPasswordMode ? 'Reset Password' : (isLoginMode ? 'Login' : 'Sign Up');
//   const submitButtonText = resetPasswordMode ? 'Send Reset Link' : (isLoading ? 'Loading...' : (isLoginMode ? 'Login' : 'Sign Up'));
  
//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <div className="auth-header">
//           <h2>{currentTitle}</h2>
//         </div>

//         {!resetPasswordMode && (
//           <div className="auth-toggle-buttons">
//             <button
//               className={`btn ${isLoginMode ? 'btn-primary' : 'btn-secondary'}`}
//               onClick={() => toggleMode('login')}
//               disabled={isLoading}
//             >
//               Login
//             </button>
//             <button
//               className={`btn ${!isLoginMode ? 'btn-primary' : 'btn-secondary'}`}
//               onClick={() => toggleMode('signup')}
//               disabled={isLoading}
//             >
//               Sign Up
//             </button>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="auth-form">
//           {!resetPasswordMode && (
//             <div className="form-group">
//               <label htmlFor="username">{isLoginMode ? 'Username or Email' : 'Username'}</label>
//               <input
//                 type="text"
//                 id="username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder={isLoginMode ? 'Enter your username or email' : 'Choose a username'}
//                 disabled={isLoading}
//               />
//             </div>
//           )}

//           {(!isLoginMode || resetPasswordMode) && (
//             <div className="form-group">
//               <label htmlFor="email">Email</label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter your email address"
//                 disabled={isLoading}
//               />
//             </div>
//           )}

//           {!resetPasswordMode && (
//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 disabled={isLoading}
//               />
//             </div>
//           )}

//           {error && <p className="auth-error">{error}</p>}

//           <button type="submit" className="btn btn-primary btn-submit" disabled={isLoading}>
//             {submitButtonText}
//           </button>
//         </form>

//         <div className="auth-form-footer">
//           {!resetPasswordMode && (
//             isLoginMode ? (
//               <>Don't have an account?{' '}
//                 <button onClick={() => toggleMode('signup')} disabled={isLoading}>
//                   Sign Up
//                 </button>
//               </>
//             ) : (
//               <>Already have an account?{' '}
//                 <button onClick={() => toggleMode('login')} disabled={isLoading}>
//                   Login
//                 </button>
//               </>
//             )
//           )}
          
//           {isLoginMode && !resetPasswordMode && (
//             <div style={{marginTop: '10px'}}>
//               <button onClick={enterResetPasswordMode} disabled={isLoading}>
//                 Forgot Password?
//               </button>
//             </div>
//           )}

//           {resetPasswordMode && (
//             <div style={{marginTop: '10px'}}>
//               <button onClick={() => toggleMode('login')} disabled={isLoading}>
//                 Back to Login
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;

// frontend/src/components/AuthForm.jsx

import React, { useState } from 'react';
import authService from '../services/authService';

const AuthForm = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetFormAndErrors = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const toggleMode = (mode) => {
    setIsLoginMode(mode === 'login');
    setResetPasswordMode(false);
    resetFormAndErrors();
  };

  const enterResetPasswordMode = () => {
    setResetPasswordMode(true);
    setIsLoginMode(false);
    resetFormAndErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (resetPasswordMode) {
      
      if (!email.trim()) {
        setError('Please enter your email address.');
        setIsLoading(false);
        return;
      }
      try {
        
        const response = await authService.forgotPassword(email);
        alert(response.message); 
        toggleMode('login'); 
      } catch (err) {
        
        setError(err.message || "Failed to send reset link. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return; 
    }

    // LOGIN / SIGN UP 
    if (!username.trim() || !password.trim() || (!isLoginMode && !email.trim())) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLoginMode) {
        const userData = await authService.login(username, password);
        console.log('Login successful:', userData);
        alert(`Welcome, ${userData.username || 'User'}!`);
        onAuthSuccess(userData.username);
      } else { 
        const result = await authService.register(username, email, password);
        console.log('Registration successful:', result);
        alert(result.message || 'Registration successful! You can now log in.');
        setIsLoginMode(true); 
        resetFormAndErrors(); 
      }
    } catch (err) {
      const displayErrorMessage = err.message || 
                                 (typeof err === 'string' ? err : 'An unexpected error occurred.');
      console.error('Authentication error (CAUGHT):', err);
      setError(displayErrorMessage); 
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const currentTitle = resetPasswordMode ? 'Reset Password' : (isLoginMode ? 'Login' : 'Sign Up');
  const submitButtonText = resetPasswordMode ? 'Send Reset Link' : (isLoading ? 'Loading...' : (isLoginMode ? 'Login' : 'Sign Up'));
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{currentTitle}</h2>
        </div>

        {!resetPasswordMode && (
          <div className="auth-toggle-buttons">
            <button
              className={`btn ${isLoginMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => toggleMode('login')}
              disabled={isLoading}
            >
              Login
            </button>
            <button
              className={`btn ${!isLoginMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => toggleMode('signup')}
              disabled={isLoading}
            >
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!resetPasswordMode && (
            <div className="form-group">
              <label htmlFor="username">{isLoginMode ? 'Username or Email' : 'Username'}</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLoginMode ? 'Enter your username or email' : 'Choose a username'}
                disabled={isLoading}
              />
            </div>
          )}

          {(!isLoginMode || resetPasswordMode) && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>
          )}

          {!resetPasswordMode && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-submit" disabled={isLoading}>
            {submitButtonText}
          </button>
        </form>

        <div className="auth-form-footer">
          {!resetPasswordMode && (
            isLoginMode ? (
              <>Don't have an account?{' '}
                <button onClick={() => toggleMode('signup')} disabled={isLoading}>
                  Sign Up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => toggleMode('login')} disabled={isLoading}>
                  Login
                </button>
              </>
            )
          )}
          
          {isLoginMode && !resetPasswordMode && (
            <div style={{marginTop: '10px'}}>
              <button onClick={enterResetPasswordMode} disabled={isLoading}>
                Forgot Password?
              </button>
            </div>
          )}

          {resetPasswordMode && (
            <div style={{marginTop: '10px'}}>
              <button onClick={() => toggleMode('login')} disabled={isLoading}>
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;