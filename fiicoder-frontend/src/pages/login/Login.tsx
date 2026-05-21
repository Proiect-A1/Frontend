import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage, translations } from '../../language/Language';
import { useAuth } from '../../contexts/AuthContext';
import { authService, AuthError } from './services/authService';
import type { ValidationErrors } from './services/authService';
import { containerVariants, itemVariants, hoverTransition } from '../../utils/motionConfig';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const USERNAME_KEY = 'fiicoder_username';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const { lang } = useLanguage();
    const t = translations[lang];
    const { login } = useAuth();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('banned') === 'true') {
            const reason = searchParams.get('reason');
            const msg = lang === 'RO'
                ? `Contul tău a fost suspendat.${reason ? ` Motiv: ${reason}` : ''} Contactează un administrator.`
                : `Your account has been suspended.${reason ? ` Reason: ${reason}` : ''} Contact an administrator.`;
            setError(msg);
        }
    }, []);

    // Form state
    const [loginEmail, setLoginEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Register-only fields
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Helpers

    function clearMessages() {
        setError(null);
        setFieldErrors({});
        setSuccessMsg(null);
    }

    function formatFieldErrors(errors: Record<string, string>): string {
        return Object.values(errors).join('. ');
    }

    function deriveUsername(emailValue: string): string {
        return emailValue.trim().split('@')[0].trim();
    }

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            if (isLogin) {
                const token = await authService.login({
                    email: loginEmail,
                    password,
                });
                const displayUsername = deriveUsername(loginEmail);
                if (displayUsername) {
                    login(token, displayUsername);
                } else {
                    login(token);
                }
                toast.success(lang === 'RO' ? 'Autentificare reușită.' : 'Login successful.');
                // clear any persisted non-sensitive info after successful login
                setLoginEmail('');
                setUsername('');
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                navigate('/problems');
            } else {
                if (password !== confirmPassword) {
                    setFieldErrors({ confirmPassword: 'Parolele nu coincid.' });
                    setError(lang === 'RO' ? 'Parolele nu coincid.' : 'Passwords do not match.');
                    return;
                }

                await authService.register({
                    username,
                    firstName,
                    lastName,
                    email,
                    password,
                });
                localStorage.setItem(USERNAME_KEY, username);
                toast.success(
                    lang === 'RO'
                        ? 'Cont creat cu succes! Te poți autentifica.'
                        : 'Account created successfully! You can now log in.',
                );
                setSuccessMsg(
                    lang === 'RO'
                        ? 'Cont creat cu succes! Te poți autentifica.'
                        : 'Account created successfully! You can now log in.',
                );
                // Switch to login mode after successful registration
                setIsLogin(true);

                // clear any persisted non-sensitive info after successful registration
                setLoginEmail('');
                setUsername('');
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            if (err instanceof AuthError) {
                if (err.status === 403) {
                    const msg = lang === 'RO'
                        ? 'Contul tău a fost suspendat. Contactează un administrator.'
                        : 'Your account has been suspended. Contact an administrator.';
                    setError(msg);
                    toast.error(msg);
                } else if (err.status === 400 && (err.body as ValidationErrors)?.errors) {
                    const validationErrors = (err.body as ValidationErrors).errors;
                    setFieldErrors(validationErrors);
                    setError(formatFieldErrors(validationErrors));
                    toast.error(formatFieldErrors(validationErrors));
                } else {
                    setError(err.message);
                    toast.error(err.message);
                }
            } else {
                const message =
                    lang === 'RO'
                        ? 'Eroare de conexiune. Verifică serverul.'
                        : 'Connection error. Check if the server is running.';
                setError(message);
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle login/register

    const toggleMode = () => {
        // Keep login and register fields separate. Only clear sensitive data.
        clearMessages();
        setPassword('');
        setConfirmPassword('');
        setIsLogin((prev) => !prev);
    };

    return (
        <motion.div
            className="p-8 w-full max-w-150 mx-auto bg-(--surface-card) backdrop-blur-sm border-2 border-(--accent) rounded-3xl"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
        >
            {/* titlul */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-(--text-h) mb-2">
                    {isLogin ? t.loginTitle : t.registerTitle}
                </h1>
                <div className="page-line-horizontal" />
            </motion.div>

            {/* Mesaje de succes / eroare */}
            {successMsg && (
                <motion.div
                    variants={itemVariants}
                    className="mt-4 px-4 py-2.5 rounded-2xl border border-green-400/40 bg-green-500/10 text-sm text-green-300"
                >
                    {successMsg}
                </motion.div>
            )}
            {error && (
                <motion.div
                    variants={itemVariants}
                    className="mt-4 px-4 py-2.5 rounded-2xl border border-red-400/40 bg-red-500/10 text-sm text-red-300"
                >
                    {error}
                </motion.div>
            )}

            {/* formular */}
            <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-4"
            >
                {/* fielduri login */}
                {isLogin ? (
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-(--text) mb-1">
                                {t.emailLabel}
                            </label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="ex: nume@email.com"
                                className="w-full rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent) focus:border-(--accent)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-(--text) mb-1">
                                {t.passwordLabel}
                            </label>
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-2xl border border-(--accent)/30 bg-(--surface-input) px-3 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent) focus:border-(--accent)"
                            />
                        </div>
                    </>
                ) : (
                    /* fielduri register */
                    <>
                        <div>
                            <label className="block text-sm font-semibold text-(--text) mb-1">
                                {lang === 'RO' ? 'Nume utilizator' : 'Username'}
                            </label>
                            <input
                                type="text"
                                required
                                minLength={3}
                                maxLength={30}
                                autoComplete="off"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ex: fiicoder"
                                className={`w-full rounded-2xl border bg-(--surface-input) px-3 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent) focus:border-(--accent) ${
                                    fieldErrors.username
                                        ? 'border-red-400/60'
                                        : 'border-(--accent)/30'
                                }`}
                            />
                            {fieldErrors.username && (
                                <p className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-(--text) mb-1">
                                    {t.nameLabel}
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={50}
                                    autoComplete="given-name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder={t.namePlaceholder}
                                    className={`w-full rounded-2xl border bg-(--surface-input) px-3 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent) focus:border-(--accent) ${
                                        fieldErrors.firstName
                                            ? 'border-red-400/60'
                                            : 'border-(--accent)/30'
                                    }`}
                                />
                                {fieldErrors.firstName && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {fieldErrors.firstName}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-(--text) mb-1">
                                    {t.surnameLabel}
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={50}
                                    autoComplete="family-name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder={t.surnamePlaceholder}
                                    className={`w-full rounded-2xl border bg-(--surface-input) px-3 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent) focus:border-(--accent) ${
                                        fieldErrors.lastName
                                            ? 'border-red-400/60'
                                            : 'border-(--accent)/30'
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
                            <label className="block text-sm font-semibold text-(--text) mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t.emailPlaceholder}
                                className={`w-full rounded-2xl border bg-(--surface-input) px-3 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent) focus:border-(--accent) ${
                                    fieldErrors.email ? 'border-red-400/60' : 'border-(--accent)/30'
                                }`}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-(--text) mb-1">
                                {t.passwordLabel}
                            </label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full rounded-2xl border bg-(--surface-input) px-3 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent) focus:border-(--accent) ${
                                    fieldErrors.password
                                        ? 'border-red-400/60'
                                        : 'border-(--accent)/30'
                                }`}
                            />
                            {fieldErrors.password && (
                                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-(--text) mb-1">
                                {lang === 'RO' ? 'Confirmă parola' : 'Confirm password'}
                            </label>
                            <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full rounded-2xl border bg-(--surface-input) px-3 py-2 text-sm text-(--text-h) outline-none transition hover:border-(--accent) focus:border-(--accent) ${
                                    fieldErrors.confirmPassword
                                        ? 'border-red-400/60'
                                        : 'border-(--accent)/30'
                                }`}
                            />
                            {fieldErrors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-400">
                                    {fieldErrors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full rounded-2xl border border-(--accent)/50 bg-(--accent)/20 px-4 py-2.5 text-sm font-bold text-(--text-h) outline-none transition hover:border-(--accent) hover:bg-(--accent)/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading
                        ? lang === 'RO'
                            ? 'Se încarcă...'
                            : 'Loading...'
                        : isLogin
                          ? t.loginBtn
                          : t.registerBtn}
                </button>
            </motion.form>

            {/* 3. Textul "Ai deja un cont?" */}
            <motion.div
                variants={itemVariants}
                className="mt-6 text-center text-sm text-(--text-muted)"
            >
                {isLogin ? t.noAccount : t.hasAccount}{' '}
                <button
                    type="button"
                    onClick={toggleMode}
                    className="font-semibold text-(--accent) underline underline-offset-4 hover:text-(--text-h) transition-colors"
                >
                    {isLogin
                        ? lang === 'RO'
                            ? 'Înregistrează-te'
                            : 'Sign Up'
                        : lang === 'RO'
                          ? 'Autentifică-te'
                          : 'Login'}
                </button>
            </motion.div>

            {/* 4. Divizorul "sau" */}
            <motion.div variants={itemVariants} className="mt-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-(--accent)/20" />
                <span className="text-xs font-semibold uppercase tracking-widest text-(--text-muted)">
                    {lang === 'RO' ? 'sau' : 'or'}
                </span>
                <div className="flex-1 h-px bg-(--accent)/20" />
            </motion.div>

            {/* 5. Butonul Guest */}
            <motion.button
                variants={itemVariants}
                whileHover={{ y: -3, transition: { hoverTransition } }}
                type="button"
                onClick={() => navigate('/problems')}
                className="mt-5 w-full rounded-2xl border border-(--accent)/25 bg-transparent px-4 py-2.5 text-sm font-medium text-(--text-muted) outline-none transition-colors hover:border-(--accent)/50 hover:bg-(--accent)/10 hover:text-(--text-h)"
            >
                {t.continueAsGuest}
            </motion.button>
        </motion.div>
    );
}
