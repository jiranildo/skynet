import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export default function SignupPage() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const calculateStrength = (pwd: string) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score; // Max 5
    };

    const strength = calculateStrength(password);

    const getStrengthLabel = () => {
        if (strength <= 2) return 'Fraca';
        if (strength <= 3) return 'Média';
        return 'Forte';
    };

    const getStrengthColor = () => {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (email !== confirmEmail) {
            setError('Os e-mails não conferem.');
            setLoading(false);
            return;
        }

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: `${firstName} ${lastName}`.trim(),
                        first_name: firstName,
                        last_name: lastName,
                    },
                },
            });

            if (signUpError) {
                throw signUpError;
            }

            // Check if session was created (auto-confirm enabled) or if email confirmation is needed
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                navigate('/');
            } else {
                alert('Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar a conta.');
                navigate('/login');
            }

        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                        <i className="ri-user-add-fill text-4xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
                    <p className="text-white/80">Junte-se ao SARA Travel</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSignup} className="space-y-6">
                        {/* Name */}
                        {/* Name Fields */}
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome
                                </label>
                                <div className="relative">
                                    <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Nome"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sobrenome
                                </label>
                                <div className="relative">
                                    <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Sobrenome"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                E-mail
                            </label>
                            <div className="relative">
                                <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirme seu E-mail
                            </label>
                            <div className="relative">
                                <i className="ri-mail-check-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="email"
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                    placeholder="Confirme seu e-mail"
                                    required
                                    className={`w-full pl-12 pr-4 py-3 border ${confirmEmail && email !== confirmEmail ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-purple-500'} rounded-xl outline-none focus:ring-2 transition-all`}
                                />
                            </div>
                            {confirmEmail && email !== confirmEmail && (
                                <p className="text-xs text-red-500 mt-1 pl-1">Os e-mails não coincidem</p>
                            )}
                        </div>

                        {/* Password */}
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative mb-2">
                                <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>

                            {/* Strength Meter */}
                            {password && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Força da senha:</span>
                                        <span className={`font-medium ${strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {getStrengthLabel()}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                            style={{ width: `${(strength / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="ri-loader-4-line animate-spin"></i>
                                    Criando conta...
                                </span>
                            ) : (
                                'Cadastrar'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                            >
                                Faça login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
