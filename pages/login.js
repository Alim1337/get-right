import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from 'sonner';
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import Head from "next/head";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isPhoneNumberValid = (p) => !isNaN(p) && p.length === 10;
const isValidStudentId = (s) => !isNaN(s) && s.length === 12;

const STEPS = [
  { label: "Name" },
  { label: "Phone" },
  { label: "Email" },
  { label: "Password" },
  { label: "Student ID" },
];

const Login = () => {
  const router = useRouter();
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push("/");
  }, []);

  const validateFields = () => {
    if (step === 1) {
      if (!firstName.trim()) return 'First name is required';
      if (!lastName.trim()) return 'Last name is required';
    } else if (step === 2) {
      if (!isPhoneNumberValid(phoneNumber)) return 'Phone number must be 10 digits';
    } else if (step === 3) {
      if (!validateEmail(username)) return 'Invalid email address';
    } else if (step === 4) {
      if (!password.trim()) return 'Password is required';
    } else if (step === 5) {
      if (!isValidStudentId(studentId)) return 'Student ID must be 12 digits';
    }
    return null;
  };

  const handleNextStep = () => {
    const err = validateFields();
    if (err) { toast.error(err); return; }
    setStep(s => s + 1);
  };

  const handlePrevStep = () => setStep(s => Math.max(1, s - 1));
  const handleToggleMode = (state) => { setStep(1); setIsRegisterVisible(state); };

  const handleLogin = async () => {
    if (!validateEmail(username)) { toast.error('Invalid email format.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/login_users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token_login) {
          localStorage.setItem('token', data.token_login);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('role', data.role);
          toast.success('Welcome back!');
          router.push("/");
        } else { toast.error('Login failed'); }
      } else { toast.error('Invalid credentials. Please try again.'); }
    } catch { toast.error('Login failed. Check your connection.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/signup_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phoneNumber, email: username, password, studentId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token_signup) {
          localStorage.setItem('token', data.token_signup);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('role', data.role);
          toast.success('Registration successful!');
          router.push('/');
        }
      } else if (res.status === 400) {
        const err = await res.json();
        toast.error(`Registration failed: ${err.error}`);
      } else { toast.error('Registration failed. Please try again.'); }
    } catch { toast.error('Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .gr-page {
          display: flex;
          width: 100vw;
          height: 100vh;
          background: #0a0a0f;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── LEFT ── */
        .gr-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem;
          position: relative;
          overflow: hidden;
        }
        .gr-left::before {
          content: '';
          position: absolute;
          top: 10%; left: -10%;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(124,92,252,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .gr-left::after {
          content: '';
          position: absolute;
          bottom: 5%; right: 5%;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(20,180,120,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .gr-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          position: absolute;
          top: 2.5rem; left: 3rem;
          z-index: 1;
        }
        .gr-logo span {
          background: linear-gradient(135deg, #7c5cfc, #14b478);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gr-hero { position: relative; z-index: 1; }
        .gr-eyebrow {
          font-size: 0.7rem; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #7c5cfc; margin-bottom: 1.25rem;
        }
        .gr-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 4vw, 4.5rem);
          font-weight: 800; color: #fff;
          line-height: 1.05; letter-spacing: -0.03em;
          margin-bottom: 1.5rem;
        }
        .gr-title em {
          font-style: normal;
          background: linear-gradient(135deg, #7c5cfc, #14b478);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gr-desc {
          font-size: 1rem; color: #666;
          line-height: 1.75; max-width: 380px;
        }

        /* ── RIGHT ── */
        .gr-right {
          width: 480px;
          flex-shrink: 0;
          background: #111118;
          border-left: 1px solid #1c1c28;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .gr-form {
          width: 100%;
          max-width: 360px;
        }

        .gr-tag {
          display: inline-block;
          font-size: 0.65rem; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #7c5cfc;
          background: rgba(124,92,252,0.1);
          border: 1px solid rgba(124,92,252,0.2);
          border-radius: 100px;
          padding: 0.3rem 0.9rem;
          margin-bottom: 1rem;
        }
        .gr-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 2rem; font-weight: 800;
          color: #fff; letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
        }
        .gr-form-sub { font-size: 0.85rem; color: #555; margin-bottom: 2rem; }

        .gr-steps { display: flex; gap: 5px; margin-bottom: 0.6rem; }
        .gr-step-bar { flex: 1; height: 3px; border-radius: 2px; background: #1e1e2e; transition: background 0.3s; }
        .gr-step-bar.active { background: #7c5cfc; }
        .gr-step-bar.done { background: #14b478; }
        .gr-step-lbl { font-size: 0.72rem; color: #555; margin-bottom: 1.5rem; }
        .gr-step-lbl strong { color: #7c5cfc; font-weight: 500; }

        .gr-field { margin-bottom: 1rem; }
        .gr-field label {
          display: block; font-size: 0.7rem; font-weight: 500;
          color: #555; letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 0.45rem;
        }
        .gr-input {
          width: 100%; background: #0c0c14;
          border: 1px solid #1c1c28; border-radius: 10px;
          padding: 0.85rem 1rem; font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif; color: #fff;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .gr-input::placeholder { color: #2e2e40; }
        .gr-input:focus { border-color: #7c5cfc; box-shadow: 0 0 0 3px rgba(124,92,252,0.12); }

        .gr-btn-primary {
          width: 100%; padding: 0.9rem;
          background: #7c5cfc; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 500;
          border: none; border-radius: 10px; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 0.5rem; margin-bottom: 0.75rem;
        }
        .gr-btn-primary:hover { background: #6a49f0; }
        .gr-btn-primary:active { transform: scale(0.98); }
        .gr-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .gr-btn-ghost {
          width: 100%; padding: 0.9rem;
          background: transparent; color: #666;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          border: 1px solid #1c1c28; border-radius: 10px; cursor: pointer;
          transition: all 0.2s;
        }
        .gr-btn-ghost:hover { border-color: #333; color: #ccc; }

        .gr-nav { display: flex; gap: 0.6rem; margin-top: 0.5rem; margin-bottom: 0.75rem; }
        .gr-btn-back {
          flex: 1; padding: 0.9rem;
          background: transparent; color: #555;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
          border: 1px solid #1c1c28; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.2s;
        }
        .gr-btn-back:hover { border-color: #333; color: #ccc; }
        .gr-btn-next {
          flex: 1; padding: 0.9rem;
          background: #7c5cfc; color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
          border: none; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: background 0.2s;
        }
        .gr-btn-next:hover { background: #6a49f0; }
        .gr-btn-next:disabled { opacity: 0.5; cursor: not-allowed; }

        .gr-divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0; }
        .gr-divider-line { flex: 1; height: 1px; background: #1c1c28; }
        .gr-divider-txt { font-size: 0.72rem; color: #3a3a50; white-space: nowrap; }

        /* ── MOBILE ── */
        @media (max-width: 860px) {
          .gr-page { flex-direction: column; height: auto; min-height: 100vh; }
          .gr-left {
            padding: 6rem 2rem 3rem;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          .gr-logo { left: 50%; transform: translateX(-50%); }
          .gr-desc { margin: 0 auto; }
          .gr-right {
            width: 100%;
            border-left: none;
            border-top: 1px solid #1c1c28;
            padding: 2.5rem 1.5rem;
          }
          .gr-form { max-width: 100%; }
        }

        @media (max-width: 480px) {
          .gr-left { padding: 5rem 1.5rem 2.5rem; }
          .gr-right { padding: 2rem 1.25rem; }
          .gr-title { font-size: 2rem; }
          .gr-form-title { font-size: 1.7rem; }
        }
      `}</style>

      <div className="gr-page">

        {/* LEFT */}
        <div className="gr-left">
          <div className="gr-logo">get<span>right</span></div>
          <div className="gr-hero">
            <p className="gr-eyebrow">University ride sharing</p>
            <h1 className="gr-title">Your campus,<br /><em>your commute.</em></h1>
            <p className="gr-desc">Connect with fellow students for safe, affordable rides across campus and beyond. No hassle, no strangers.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="gr-right">
          <div className="gr-form">

            {!isRegisterVisible ? (
              <>
                <span className="gr-tag">Welcome back</span>
                <h2 className="gr-form-title">Sign in</h2>
                <p className="gr-form-sub">Enter your student credentials to continue</p>

                <div className="gr-field">
                  <label>Email address</label>
                  <input className="gr-input" type="email" placeholder="you@university.edu"
                    value={username} onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <div className="gr-field">
                  <label>Password</label>
                  <input className="gr-input" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>

                <button className="gr-btn-primary" onClick={handleLogin} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in →'}
                </button>
                <div className="gr-divider">
                  <div className="gr-divider-line" />
                  <span className="gr-divider-txt">No account yet?</span>
                  <div className="gr-divider-line" />
                </div>
                <button className="gr-btn-ghost" onClick={() => handleToggleMode(true)}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                <span className="gr-tag">New student</span>
                <h2 className="gr-form-title">Register</h2>
                <p className="gr-form-sub">Set up your account in a few quick steps</p>

                <div className="gr-steps">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`gr-step-bar ${i + 1 < step ? 'done' : i + 1 === step ? 'active' : ''}`} />
                  ))}
                </div>
                <p className="gr-step-lbl">Step <strong>{step} of 5</strong> — {STEPS[step - 1].label}</p>

                {step === 1 && (<>
                  <div className="gr-field"><label>First name</label><input className="gr-input" type="text" placeholder="Ahmed" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
                  <div className="gr-field"><label>Last name</label><input className="gr-input" type="text" placeholder="Benali" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
                </>)}
                {step === 2 && <div className="gr-field"><label>Phone number</label><input className="gr-input" type="tel" placeholder="0551234567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} /></div>}
                {step === 3 && <div className="gr-field"><label>Email address</label><input className="gr-input" type="email" placeholder="you@university.edu" value={username} onChange={e => setUsername(e.target.value)} /></div>}
                {step === 4 && <div className="gr-field"><label>Password</label><input className="gr-input" type="password" placeholder="Choose a strong password" value={password} onChange={e => setPassword(e.target.value)} /></div>}
                {step === 5 && <div className="gr-field"><label>Student ID</label><input className="gr-input" type="text" placeholder="12-digit student ID" value={studentId} onChange={e => setStudentId(e.target.value)} /></div>}

                <div className="gr-nav">
                  {step > 1 && <button className="gr-btn-back" onClick={handlePrevStep}><BsArrowLeft size={13} /> Back</button>}
                  {step < 5
                    ? <button className="gr-btn-next" style={step === 1 ? { flex: 1 } : {}} onClick={handleNextStep}>Next <BsArrowRight size={13} /></button>
                    : <button className="gr-btn-next" onClick={handleRegister} disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
                  }
                </div>

                <div className="gr-divider">
                  <div className="gr-divider-line" />
                  <span className="gr-divider-txt">Already have an account?</span>
                  <div className="gr-divider-line" />
                </div>
                <button className="gr-btn-ghost" onClick={() => handleToggleMode(false)}>
                  Sign in instead
                </button>
              </>
            )}

          </div>
        </div>

      </div>
    </>
  );
};

export default Login;