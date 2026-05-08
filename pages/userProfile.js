// pages/userProfile.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import Head from "next/head";
import Link from "next/link";

const isPhoneNumberValid = (phoneNumber) => !isNaN(phoneNumber) && phoneNumber.length === 10;
const isValidStudentId = (studentId) => !isNaN(studentId) && studentId.length === 12;

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    studentId: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      fetch(`/api/updateUser?userId=${decoded.userId}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          setUser({ role: decoded.role, id: decoded.userId, ...data });
          setFormValues({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            studentId: data.studentId || "",
          });
        })
        .catch(() => toast.error("Error fetching user details"));
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e) =>
    setFormValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPhoneNumberValid(formValues.phoneNumber)) {
      toast.error("Phone number must be 10 digits"); return;
    }
    if (!isValidStudentId(formValues.studentId)) {
      toast.error("Student ID must be 12 digits"); return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/updateUser", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, ...formValues }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token_update) {
          localStorage.setItem("token", data.token_update);
          localStorage.setItem("userId", data.userId);
        }
        toast.success("Profile updated successfully");
      } else if (res.status === 400) {
        const err = await res.json();
        toast.error(`Update failed: ${err.error}`);
      } else {
        toast.error("Update failed. Please try again.");
      }
    } catch { toast.error("Update failed. Please try again."); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "?";

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=Geist:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Geist', sans-serif; background: #f4f5f9; }

        .up-root { min-height: 100vh; display: flex; flex-direction: column; }

        /* TOPBAR */
        .up-topbar {
          height: 60px; flex-shrink: 0; background: #0f1117;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; padding: 0 1.25rem; gap: 0.85rem;
        }
        .up-back {
          width: 32px; height: 32px; border-radius: 7px;
          background: rgba(255,255,255,0.08); border: none;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); cursor: pointer;
          text-decoration: none; transition: background 0.14s;
        }
        .up-back:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .up-topbar-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #fff;
        }
        .up-logout {
          margin-left: auto;
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.38rem 0.8rem;
          background: rgba(248,113,113,0.12);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 7px; color: #f87171;
          font-family: 'Geist', sans-serif; font-size: 0.75rem; font-weight: 500;
          cursor: pointer; transition: all 0.14s;
        }
        .up-logout:hover { background: rgba(248,113,113,0.2); color: #fca5a5; }

        /* BODY */
        .up-body {
          flex: 1; display: flex; justify-content: center;
          padding: 2rem 1.25rem;
        }

        .up-card {
          background: #fff; border: 1px solid #e8eaf0;
          border-radius: 16px; width: 100%; max-width: 480px;
          overflow: hidden; align-self: flex-start;
        }

        /* Profile header inside card */
        .up-profile-head {
          background: linear-gradient(135deg, #0f1117 0%, #1e2235 100%);
          padding: 1.75rem 1.5rem 1.25rem;
          display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
        }
        .up-avatar-wrap { position: relative; }
        .up-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: #6366f1; border: 3px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1.1rem; font-weight: 700; color: #fff;
        }
        .up-profile-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 1rem; font-weight: 600; color: #fff;
        }
        .up-profile-email { font-size: 0.72rem; color: rgba(255,255,255,0.4); }
        .up-role-pill {
          font-size: 0.62rem; font-weight: 600; padding: 3px 10px;
          border-radius: 100px; background: rgba(99,102,241,0.25);
          color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3);
          text-transform: capitalize;
        }

        /* Form */
        .up-form { padding: 1.25rem 1.5rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

        .up-section-label {
          font-size: 0.62rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 0.15rem;
        }

        .up-fields { display: flex; flex-direction: column; gap: 0.75rem; }

        .up-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

        .up-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .up-label {
          font-size: 0.68rem; font-weight: 500; color: #6b7280;
        }
        .up-input {
          width: 100%; padding: 0.6rem 0.85rem;
          background: #f9fafb; border: 1px solid #e8eaf0;
          border-radius: 8px; font-size: 0.82rem;
          font-family: 'Geist', sans-serif; color: #111827;
          outline: none; transition: border-color 0.14s, box-shadow 0.14s;
        }
        .up-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
          background: #fff;
        }

        .up-divider { height: 1px; background: #f0f1f5; }

        /* Save button */
        .up-btn-save {
          width: 100%; padding: 0.65rem;
          background: #6366f1; color: #fff; border: none;
          border-radius: 9px;
          font-family: 'Geist', sans-serif; font-size: 0.85rem; font-weight: 500;
          cursor: pointer; transition: background 0.14s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .up-btn-save:hover:not(:disabled) { background: #4f46e5; }
        .up-btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <div className="up-root">

        {/* TOPBAR */}
        <div className="up-topbar">
          <Link href="/" passHref>
            <a className="up-back">
              <i className="ti ti-arrow-left" style={{ fontSize: 16 }} aria-hidden="true" />
            </a>
          </Link>
          <div className="up-topbar-title">Your Profile</div>
          <button className="up-logout" onClick={handleLogout}>
            <i className="ti ti-logout" style={{ fontSize: 13 }} aria-hidden="true" />
            Sign out
          </button>
        </div>

        {/* BODY */}
        <div className="up-body">
          <div className="up-card">

            {/* Profile header */}
            <div className="up-profile-head">
              <div className="up-avatar">{initials}</div>
              <div className="up-profile-name">
                {user ? `${user.firstName} ${user.lastName}` : "Loading…"}
              </div>
              <div className="up-profile-email">{user?.email}</div>
              {user?.role && <div className="up-role-pill">{user.role}</div>}
            </div>

            {/* Form */}
            <form className="up-form" onSubmit={handleSubmit}>
              <div>
                <div className="up-section-label">Personal info</div>
                <div className="up-fields">
                  <div className="up-row">
                    <div className="up-field">
                      <label className="up-label" htmlFor="firstName">First name</label>
                      <input
                        className="up-input" id="firstName" name="firstName" type="text"
                        value={formValues.firstName} onChange={handleChange}
                      />
                    </div>
                    <div className="up-field">
                      <label className="up-label" htmlFor="lastName">Last name</label>
                      <input
                        className="up-input" id="lastName" name="lastName" type="text"
                        value={formValues.lastName} onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="up-field">
                    <label className="up-label" htmlFor="email">Email address</label>
                    <input
                      className="up-input" id="email" name="email" type="email"
                      value={formValues.email} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="up-divider" />

              <div>
                <div className="up-section-label">Account details</div>
                <div className="up-fields">
                  <div className="up-field">
                    <label className="up-label" htmlFor="phoneNumber">Phone number</label>
                    <input
                      className="up-input" id="phoneNumber" name="phoneNumber" type="text"
                      value={formValues.phoneNumber} onChange={handleChange}
                      placeholder="10 digits"
                    />
                  </div>
                  <div className="up-field">
                    <label className="up-label" htmlFor="studentId">Student ID</label>
                    <input
                      className="up-input" id="studentId" name="studentId" type="text"
                      value={formValues.studentId} onChange={handleChange}
                      placeholder="12 digits"
                    />
                  </div>
                </div>
              </div>

              <button className="up-btn-save" type="submit" disabled={saving}>
                <i className="ti ti-device-floppy" style={{ fontSize: 15 }} aria-hidden="true" />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;