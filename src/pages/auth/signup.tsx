import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export default function SignupPage() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');

    // Avatar State
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isAiAvatar, setIsAiAvatar] = useState(false);

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

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setIsAiAvatar(false);
        }
    };

    const generateAiAvatar = () => {
        // Use DiceBear for nice avatars
        const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        const randomSeed = Math.random().toString(36).substring(7);
        const url = `https://api.dicebear.com/9.x/${randomStyle}/svg?seed=${randomSeed}`;

        setAvatarPreview(url);
        setAvatarFile(null); // Clear file if switching to AI
        setIsAiAvatar(true);
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
            let avatarUrl = null;

            // 1. Upload Avatar if file selected
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `avatar_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `public/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) {
                    console.error('Avatar upload error:', uploadError);
                    // Continue without avatar or show warning?
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from('avatars')
                        .getPublicUrl(filePath);
                    avatarUrl = publicUrlData.publicUrl;
                }
            } else if (isAiAvatar && avatarPreview) {
                // For AI avatar, it's a URL. We can save it directly appropriately.
                // Or user might want to download and upload it? For now, save URL.
                avatarUrl = avatarPreview;
            }

            // 2. Sign Up
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName.trim(),
                        username: username.trim(),
                        avatar_url: avatarUrl
                        // Removed individual first/last name as user requested combining
                    },
                },
            });

            if (signUpError) {
                throw signUpError;
            }

            // Check if session was created
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

                    <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
                    <p className="text-white/80">Junte-se ao SARA Travel</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSignup} className="space-y-6">

                        {/* Avatar Preview & Selection */}
                        <div className="flex flex-col items-center gap-4 mb-2">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner bg-gray-50 flex items-center justify-center">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <i className="ri-user-smile-line text-4xl text-gray-300"></i>
                                )}
                            </div>

                            <div className="flex justify-center gap-4">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors">
                                    <i className="ri-upload-cloud-line text-lg"></i>
                                    Upload Foto
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                                <button
                                    type="button"
                                    onClick={generateAiAvatar}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all"
                                >
                                    <i className="ri-magic-line text-lg"></i>
                                    Criar com IA
                                </button>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome Completo
                            </label>
                            <div className="relative">
                                <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome completo"
                                    required
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome de Usuário (@usuario)
                            </label>
                            <div className="relative">
                                <i className="ri-at-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                    placeholder="usuario"
                                    required
                                    minLength={3}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                        </div>

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
