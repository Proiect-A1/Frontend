import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../services/AuthContext";
import { authService, AuthError } from "../services/authService";
import type { ValidationErrors } from "../services/authService";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const { lang } = useLanguage();
  const t = translations[lang];
  const { login } = useAuth();

  // ── Form state ──────────────────────────────────────────────
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  // Register-only fields
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────

  function clearMessages() {
    setError(null);
    setFieldErrors({});
    setSuccessMsg(null);
  }

  function formatFieldErrors(errors: Record<string, string>): string {
    return Object.values(errors).join(". ");
  }

  // ── Submit ──────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (isLogin) {
        const token = await authService.login({
          usernameOrEmail,
          password,
        });
        login(token);
        navigate("/problems");
      } else {
        await authService.register({
          username,
          firstName,
          lastName,
          email,
          password,
        });
        setSuccessMsg(
          lang === "RO"
            ? "Cont creat cu succes! Te poți autentifica."
            : "Account created successfully! You can now log in."
        );
        // Switch to login mode after successful registration
        setIsLogin(true);
        setUsernameOrEmail(username);
        setPassword("");
      }
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.status === 400 && (err.body as ValidationErrors)?.errors) {
          const validationErrors = (err.body as ValidationErrors).errors;
          setFieldErrors(validationErrors);
          setError(formatFieldErrors(validationErrors));
        } else {
          setError(err.message);
        }
      } else {
        setError(
          lang === "RO"
            ? "Eroare de conexiune. Verifică serverul."
            : "Connection error. Check if the server is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle login / register ─────────────────────────────────

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearMessages();
  };

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-md mx-auto bg-[#151221]/80 backdrop-blur-lg border-2 border-pink-500/30 rounded-2xl card-glow">
      <h1 className="text-3xl font-bold text-pink-200 mb-2">
        {isLogin ? t.loginTitle : t.registerTitle}
      </h1>
      <div className="page-line-horizontal" />

      {/* Success message */}
      {successMsg && (
        <div className="mt-4 px-4 py-2.5 rounded-xl border border-green-400/40 bg-green-500/10 text-sm text-green-300">
          {successMsg}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 px-4 py-2.5 rounded-xl border border-red-400/40 bg-red-500/10 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {/* ── Login fields ── */}
        {isLogin ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-pink-200 mb-1">
                {t.emailLabel}
              </label>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="ex: fiicoder"
                className="w-full rounded-xl border border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-pink-200 mb-1">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-pink-500/30 bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400"
              />
            </div>
          </>
        ) : (
          /* ── Register fields ── */
          <>
            <div>
              <label className="block text-sm font-semibold text-pink-200 mb-1">
                {lang === "RO" ? "Nume utilizator" : "Username"}
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: fiicoder"
                className={`w-full rounded-xl border bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                  fieldErrors.username ? "border-red-400/60" : "border-pink-500/30"
                }`}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-pink-200 mb-1">
                  {lang === "RO" ? "Prenume" : "First Name"}
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ion"
                  className={`w-full rounded-xl border bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                    fieldErrors.firstName ? "border-red-400/60" : "border-pink-500/30"
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-pink-200 mb-1">
                  {lang === "RO" ? "Nume" : "Last Name"}
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Popescu"
                  className={`w-full rounded-xl border bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                    fieldErrors.lastName ? "border-red-400/60" : "border-pink-500/30"
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-pink-200 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ion@fiicoder.ro"
                className={`w-full rounded-xl border bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                  fieldErrors.email ? "border-red-400/60" : "border-pink-500/30"
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-pink-200 mb-1">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-[#0f0c18] px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                  fieldErrors.password ? "border-red-400/60" : "border-pink-500/30"
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl border border-pink-400/50 bg-pink-500/20 px-4 py-2.5 text-sm font-bold text-pink-100 outline-none transition hover:border-pink-400 hover:bg-pink-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? (lang === "RO" ? "Se încarcă..." : "Loading...")
            : (isLogin ? t.loginBtn : t.registerBtn)}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-pink-200/70">
        {isLogin ? t.noAccount : t.hasAccount}{" "}
        <button
          type="button"
          onClick={toggleMode}
          className="font-semibold text-pink-300 underline underline-offset-4 hover:text-pink-100 transition-colors"
        >
          {isLogin 
            ? (lang === "RO" ? "Înregistrează-te" : "Sign Up") 
            : (lang === "RO" ? "Autentifică-te" : "Login")}
        </button>
      </div>

      {/* Divider */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-pink-500/20" />
        <span className="text-xs font-semibold uppercase tracking-widest text-pink-400/50">
          {lang === "RO" ? "sau" : "or"}
        </span>
        <div className="flex-1 h-px bg-pink-500/20" />
      </div>

      {/* Guest button */}
      <button
        type="button"
        onClick={() => navigate("/problems")}
        className="mt-5 w-full rounded-xl border border-pink-400/25 bg-transparent px-4 py-2.5 text-sm font-medium text-pink-300/80 outline-none transition hover:border-pink-400/50 hover:bg-pink-500/10 hover:text-pink-100 hover:-translate-y-0.5"
      >
        {lang === "RO" ? "Continuă ca vizitator →" : "Continue as Guest →"}
      </button>
    </div>
  );
}