import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Handle remember me (example implementation)
            if (rememberMe) {
                localStorage.setItem('sara_remember_email', email);
            } else {
                localStorage.removeItem('sara_remember_email');
            }

            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError('❌ Credenciais inválidas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAccess = (role: string) => {
        // Prefill for demo purposes if needed
        const demos: Record<string, string> = {
            'Admin Global': 'admin@demo.com',
            'Admin Empresa': 'empresa@demo.com',
            'Operador': 'operador@demo.com',
            'Outra Empresa': 'outra@demo.com'
        };
        setEmail(demos[role] || '');
        setPassword('demo123456');
    };

    return (
        <div className="min-h-screen bg-[#030612] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Auras de cores baseadas no logo */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#2563eb]/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#9333ea]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#f97316]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-[#06b6d4]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-6xl relative z-10 flex flex-col md:flex-row bg-[#0a0f1e]/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_0_50px_rgba(37,99,235,0.1)] overflow-hidden min-h-[650px]">

                {/* Painel Esquerdo - Branding */}
                <div className="md:w-1/2 p-12 md:p-16 text-white flex flex-col justify-between relative group">
                    <div className="relative z-10">
                        <div className="mb-12 transition-transform duration-700 group-hover:scale-105">
                            <img src="/logo.png" alt="SARA Travel" className="w-full max-w-[320px] h-auto object-contain drop-shadow-[0_0_20px_rgba(37,99,235,0.3)]" />
                        </div>

                        <div className="space-y-8 max-w-md">
                            <p className="text-gray-300 text-sm leading-relaxed font-light">
                                Acreditamos que viajar é muito mais do que sair de um lugar para outro — é viver histórias, criar conexões e transformar momentos em memórias. Nossa plataforma une inteligência, conveniência e experiências exclusivas para acompanhar o viajante antes, durante e depois do embarque. E, para as agências, cria uma relação mais próxima, contínua e valiosa com cada cliente.
                            </p>

                            <div className="pt-8 border-t border-white/5 relative">
                                {/* Linha de cor baseada no logo */}
                                <div className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-[#2563eb] to-[#f97316]"></div>
                                <p className="text-gray-500 text-[10px] font-semibold tracking-widest uppercase">
                                    SARA - Sistema de Assistência Racional Avançado
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Painel Direito - Formulário */}
                <div className="md:w-1/2 p-8 md:p-20 flex flex-col justify-center relative bg-[#070b14]/40">
                    <div className="max-w-md mx-auto w-full text-white relative z-10">
                        <div className="mb-12">
                            <h2 className="text-4xl font-bold mb-3 tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                                Seja Bem-vindo.
                            </h2>
                            <p className="text-gray-400 text-lg">Acesse o portal para começar sua próxima jornada.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8">
                            {/* Email */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-400 ml-1">
                                    Endereço de Email
                                </label>
                                <div className="relative group/input">
                                    <i className="ri-mail-fill absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-[#2563eb] transition-colors text-xl"></i>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                        className="w-full pl-14 pr-6 py-4 bg-[#111827] text-white rounded-2xl border border-white/5 outline-none focus:border-[#2563eb]/50 focus:ring-4 focus:ring-[#2563eb]/10 transition-all placeholder:text-gray-600 text-lg"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-400 ml-1">
                                    Senha de Acesso
                                </label>
                                <div className="relative group/input">
                                    <i className="ri-lock-2-fill absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-[#9333ea] transition-colors text-xl"></i>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-14 pr-6 py-4 bg-[#111827] text-white rounded-2xl border border-white/5 outline-none focus:border-[#9333ea]/50 focus:ring-4 focus:ring-[#9333ea]/10 transition-all placeholder:text-gray-600 text-lg"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-3 cursor-pointer group/check">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-5 h-5 rounded-md bg-[#111827] border-white/10 text-[#2563eb] focus:ring-offset-0 focus:ring-[#2563eb]/20 cursor-pointer transition-all"
                                        />
                                    </div>
                                    <span className="text-gray-400 font-medium group-hover/check:text-white transition-colors">Lembrar acesso</span>
                                </label>
                                <button type="button" className="text-gray-400 hover:text-[#f97316] transition-colors font-medium">
                                    Esqueceu a senha?
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                                    <p className="text-sm text-red-400 text-center font-medium leading-relaxed">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-[#2563eb] via-[#9333ea] to-[#f97316] hover:brightness-110 text-white rounded-2xl font-bold shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(147,51,234,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group text-lg"
                            >
                                {loading ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin text-2xl"></i>
                                        Preparando embarque...
                                    </>
                                ) : (
                                    <>
                                        Acessar Portal
                                        <i className="ri-plane-fill text-2xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer Link */}
                        <div className="mt-16 text-center">
                            <p className="text-gray-500 font-medium">
                                Novo por aqui?{' '}
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="text-white hover:text-[#06b6d4] transition-colors font-bold ml-1 relative group/link"
                                >
                                    Cadastre-se
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#06b6d4] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorações flutuantes (estrelas) */}
            <div className="absolute top-10 right-20 text-[#f97316]/20 animate-bounce" style={{ animationDuration: '3s' }}>
                <i className="ri-sparkling-2-line text-4xl"></i>
            </div>
            <div className="absolute bottom-20 left-10 text-[#06b6d4]/20 animate-bounce" style={{ animationDuration: '4s' }}>
                <i className="ri-shining-2-line text-3xl"></i>
            </div>
        </div>
    );
}

