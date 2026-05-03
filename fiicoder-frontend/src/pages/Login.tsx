import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage, translations } from "../language/Language";
import { useAuth } from "../services/AuthContext";
import { authService, AuthError } from "../services/authService";
import type { ValidationErrors } from "../services/authService";
import { containerVariants, itemVariants, hoverTransition } from "../utils/motionConfig";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const USERNAME_KEY = 'fiicoder_username';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const { lang } = useLanguage();
  const t = translations[lang];
  const { login } = useAuth();

  // Form state
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

  useEffect(() => {
  setUsernameOrEmail(localStorage.getItem("login_usernameOrEmail") || "");
  setPassword(localStorage.getItem("login_password") || "");

  setUsername(localStorage.getItem("register_username") || "");
  setFirstName(localStorage.getItem("register_firstName") || "");
  setLastName(localStorage.getItem("register_lastName") || "");
  setEmail(localStorage.getItem("register_email") || "");
}, []);

  // Helpers

  function clearMessages() {
    setError(null);
    setFieldErrors({});
    setSuccessMsg(null);
  }

  useEffect(() => {
  localStorage.setItem("login_usernameOrEmail", usernameOrEmail);
}, [usernameOrEmail]);

useEffect(() => {
  localStorage.setItem("login_password", password);
}, [password]);

useEffect(() => {
  localStorage.setItem("register_username", username);
}, [username]);

useEffect(() => {
  localStorage.setItem("register_firstName", firstName);
}, [firstName]);

useEffect(() => {
  localStorage.setItem("register_lastName", lastName);
}, [lastName]);

useEffect(() => {
  localStorage.setItem("register_email", email);
}, [email]);

  function formatFieldErrors(errors: Record<string, string>): string {
    return Object.values(errors).join(". ");
  }

  function deriveUsername(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.includes("@")) {
      return trimmed.split("@")[0].trim();
    }
    return trimmed;
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (isLogin) {
        const token = await authService.login({
          email: usernameOrEmail,
          password,
        });
        const displayUsername = deriveUsername(usernameOrEmail);
        if (displayUsername) {
          login(token, displayUsername);
        } else {
          login(token);
        }
        navigate("/problems");
      } else {
        await authService.register({
          username,
          firstName,
          lastName,
          email,
          password,
        });
        localStorage.setItem(USERNAME_KEY, username);
        setSuccessMsg(
          lang === "RO"
            ? "Cont creat cu succes! Te poți autentifica."
            : "Account created successfully! You can now log in.",
        );
        // Switch to login mode after successful registration
        setIsLogin(true);
        setUsernameOrEmail(email);
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
            : "Connection error. Check if the server is running.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle login/register

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearMessages();

    // clear form fields when switching modes (foolproof :))
    setUsernameOrEmail("");
    setPassword("");
    setUsername("");
    setFirstName("");
    setLastName("");
    setEmail("");
  };

  return (
    <motion.div
      className="p-8 w-full max-w-150 mx-auto theme-surface-card backdrop-blur-sm border-2 border-(--accent) rounded-2xl"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      {/* titlul */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-pink-200 mb-2">
          {isLogin ? t.loginTitle : t.registerTitle}
        </h1>
        <div className="page-line-horizontal" />
      </motion.div>

      {/* Mesaje de succes / eroare */}
      {successMsg && (
        <motion.div variants={itemVariants} className="mt-4 px-4 py-2.5 rounded-xl border border-green-400/40 bg-green-500/10 text-sm text-green-300">
          {successMsg}
        </motion.div>
      )}
      {error && (
        <motion.div variants={itemVariants} className="mt-4 px-4 py-2.5 rounded-xl border border-red-400/40 bg-red-500/10 text-sm text-red-300">
          {error}
        </motion.div>
      )}

      {/* formular */}
      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {/* fielduri login */}
        {isLogin ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-pink-200 mb-1">
                {t.emailLabel}
              </label>
              <input
                type="email"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="ex: nume@email.com"
                className="w-full rounded-xl border border-pink-500/30 theme-surface-input px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400"
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
                className="w-full rounded-xl border border-pink-500/30 theme-surface-input px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400"
              />
            </div>
          </>
        ) : (
          /* fielduri register */
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
                className={`w-full rounded-xl border theme-surface-input px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                  fieldErrors.username
                    ? "border-red-400/60"
                    : "border-pink-500/30"
                }`}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.username}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-pink-200 mb-1">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className={`w-full rounded-xl border theme-surface-input px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                    fieldErrors.firstName
                      ? "border-red-400/60"
                      : "border-pink-500/30"
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-pink-200 mb-1">
                  {t.surnameLabel}
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t.surnamePlaceholder}
                  className={`w-full rounded-xl border theme-surface-input px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                    fieldErrors.lastName
                      ? "border-red-400/60"
                      : "border-pink-500/30"
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.lastName}
                  </p>
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
                placeholder={t.emailPlaceholder}
                className={`w-full rounded-xl border theme-surface-input px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
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
                className={`w-full rounded-xl border theme-surface-input px-3 py-2 text-sm text-pink-100 outline-none transition hover:border-pink-400 focus:border-pink-400 ${
                  fieldErrors.password
                    ? "border-red-400/60"
                    : "border-pink-500/30"
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.password}
                </p>
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
            ? lang === "RO"
              ? "Se încarcă..."
              : "Loading..."
            : isLogin
              ? t.loginBtn
              : t.registerBtn}
        </button>
      </motion.form>

      {/* 3. Textul "Ai deja un cont?" */}
      <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-pink-200/70">
        {isLogin ? t.noAccount : t.hasAccount}{" "}
        <button
          type="button"
          onClick={toggleMode}
          className="font-semibold text-pink-300 underline underline-offset-4 hover:text-pink-100 transition-colors"
        >
          {isLogin
            ? lang === "RO"
              ? "Înregistrează-te"
              : "Sign Up"
            : lang === "RO"
              ? "Autentifică-te"
              : "Login"}
        </button>
      </motion.div>

      {/* 4. Divizorul "sau" */}
      <motion.div variants={itemVariants} className="mt-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-pink-500/20" />
        <span className="text-xs font-semibold uppercase tracking-widest text-pink-400/50">
          {lang === "RO" ? "sau" : "or"}
        </span>
        <div className="flex-1 h-px bg-pink-500/20" />
      </motion.div>

      {/* 5. Butonul Guest */}
      <motion.button
        variants={itemVariants}
        whileHover={{ y: -3, transition: { hoverTransition } }}
        type="button"
        onClick={() => navigate("/problems")}
        className="mt-5 w-full rounded-xl border border-pink-400/25 bg-transparent px-4 py-2.5 text-sm font-medium text-pink-300/80 outline-none transition-colors hover:border-pink-400/50 hover:bg-pink-500/10 hover:text-pink-100"
      >
        {t.continueAsGuest}
      </motion.button>
    </motion.div>
  );
}
