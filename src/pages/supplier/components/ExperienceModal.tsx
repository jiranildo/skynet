import React, { useState } from 'react';
import { supabase } from '../../../services/supabase';
import { createExperience, updateExperience, uploadExperienceFile } from '../../../services/db/experiences';
import { Experience } from '../../../services/db/types';

interface ExperienceModalProps {
    experience: Experience | null;
    onClose: () => void;
    onSuccess: () => void;
    supplierId: string;
}

export default function ExperienceModal({ experience, onClose, onSuccess, supplierId }: ExperienceModalProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(experience?.title || '');
    const [description, setDescription] = useState(experience?.description || '');
    const [category, setCategory] = useState<Experience['category']>(experience?.category || 'Passeio');
    const [price, setPrice] = useState(experience?.price?.toString() || '0');
    const [currency, setCurrency] = useState<Experience['currency']>(experience?.currency || 'TM');
    const [experienceLocation, setExperienceLocation] = useState(experience?.location || '');
    const [coverImage, setCoverImage] = useState(experience?.cover_image || '');
    const [mediaGallery, setMediaGallery] = useState<string[]>(experience?.media_gallery || []);
    const [videoUrls, setVideoUrls] = useState<string[]>(experience?.video_urls || []);
    const [filesUrls, setFilesUrls] = useState<string[]>(experience?.files_urls || []);
    const [mapUrl, setMapUrl] = useState(experience?.map_data?.embed_url || '');
    const [validityStartDate, setValidityStartDate] = useState(experience?.validity_start_date || '');
    const [validityEndDate, setValidityEndDate] = useState(experience?.validity_end_date || '');
    const [contactEmail, setContactEmail] = useState(experience?.contact_email || '');
    const [contactPhone, setContactPhone] = useState(experience?.contact_phone || '');
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const handleAddMedia = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(prev => [...prev, '']);
    };

    const handleUpdateMedia = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        setter(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const handleRemoveMedia = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>> | ((url: string) => void), fieldId: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldId);
        try {
            const publicUrl = await uploadExperienceFile(file);
            if (publicUrl) {
                if (typeof setter === 'function') {
                    setter(publicUrl);
                }
            } else {
                alert('Erro ao fazer upload do arquivo.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro inesperado no upload.');
        } finally {
            setUploadingField(null);
        }
    };

    const handleMediaFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, fieldId: string) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingField(fieldId);
        try {
            const publicUrl = await uploadExperienceFile(file);
            if (publicUrl) {
                setter(prev => {
                    const next = [...prev];
                    next[index] = publicUrl;
                    return next;
                });
            } else {
                alert('Erro ao fazer upload do arquivo.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erro inesperado no upload.');
        } finally {
            setUploadingField(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            title,
            description,
            category,
            price: parseFloat(price) || 0,
            currency,
            location: experienceLocation,
            cover_image: coverImage || `https://readdy.ai/api/search-image?query=${encodeURIComponent(category + ' ' + title)}&width=800&height=500`,
            media_gallery: mediaGallery.filter(url => url.trim() !== ''),
            video_urls: videoUrls.filter(url => url.trim() !== ''),
            files_urls: filesUrls.filter(url => url.trim() !== ''),
            map_data: { embed_url: mapUrl },
            validity_start_date: validityStartDate || null,
            validity_end_date: validityEndDate || null,
            contact_email: contactEmail || null,
            contact_phone: contactPhone || null
        };

        let result;
        if (experience) {
            result = await updateExperience(experience.id, data);
        } else {
            result = await createExperience({ ...data, supplier_id: supplierId });
        }

        if (result) {
            onSuccess();
        } else {
            alert('Erro ao salvar experiência.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900 border-l-4 border-purple-500 pl-3">
                        {experience ? 'Editar Serviço / Experiência' : 'Novo Serviço / Experiência'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <i className="ri-close-line text-xl text-gray-500"></i>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="experience-form" onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Título do Serviço</label>
                                <input
                                    required
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                    placeholder="Ex: Passeio de Lancha em Búzios"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Categoria</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                >
                                    <option value="Passeio">Passeio</option>
                                    <option value="Hospedagem">Hospedagem</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Restaurante">Restaurante</option>
                                    <option value="Pacote">Pacote Completo</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Localização</label>
                                <input
                                    type="text"
                                    value={experienceLocation}
                                    onChange={(e) => setExperienceLocation(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                    placeholder="Ex: Rio de Janeiro"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Preço</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all font-mono"
                                />
                                <p className="text-xs text-gray-500">Deixe 0 para oferecer Gratuitamente</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Moeda</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                >
                                    <option value="TM">Travel Money (TM)</option>
                                    <option value="BRL">Real (R$)</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-2">Período de Validade</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Data Inicial</label>
                                        <input
                                            type="date"
                                            value={validityStartDate}
                                            onChange={(e) => setValidityStartDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Data Final</label>
                                        <input
                                            type="date"
                                            value={validityEndDate}
                                            onChange={(e) => setValidityEndDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all text-gray-700"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Até quando esta oferta é válida (opcional)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 mt-2">Informações de Contato</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email de Contato</label>
                                        <input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                            placeholder="Ex: contato@empresa.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Telefone / WhatsApp</label>
                                        <input
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                            placeholder="Ex: +55 11 99999-9999"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Descrição Detalhada</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                                    placeholder="Descreva o que está incluso, horários, regras..."
                                ></textarea>
                            </div>

                            <div className="space-y-4 md:col-span-2 p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                                    <i className="ri-image-line"></i> Galeria de Imagens
                                </h3>
                                <div className="space-y-3">
                                    {mediaGallery.map((url, index) => (
                                        <div key={index} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-purple-100">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={url}
                                                    onChange={(e) => handleUpdateMedia(setMediaGallery, index, e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                                                    placeholder="URL da imagem ou faça upload ao lado"
                                                />
                                                <label className={`w-10 h-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-xl cursor-pointer hover:bg-purple-200 transition-colors ${uploadingField === `gallery-${index}` ? 'animate-pulse' : ''}`}>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleMediaFileUpload(e, setMediaGallery, index, `gallery-${index}`)}
                                                    />
                                                    <i className={uploadingField === `gallery-${index}` ? "ri-loader-4-line animate-spin" : "ri-upload-2-line"}></i>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedia(setMediaGallery, index)}
                                                    className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            </div>
                                            {url && (
                                                <div className="h-20 w-32 rounded-lg overflow-hidden border border-gray-100">
                                                    <img src={url} alt="Gallery item" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleAddMedia(setMediaGallery)}
                                        className="w-full py-2 border-2 border-dashed border-purple-200 text-purple-600 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-all"
                                    >
                                        + Adicionar Imagem
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                                <div className="space-y-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                    <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                        <i className="ri-video-line"></i> Vídeos
                                    </h3>
                                    <div className="space-y-3">
                                        {videoUrls.map((url, index) => (
                                            <div key={index} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-blue-100">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={url}
                                                        onChange={(e) => handleUpdateMedia(setVideoUrls, index, e.target.value)}
                                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                                        placeholder="URL do vídeo ou upload"
                                                    />
                                                    <label className={`w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-200 transition-colors ${uploadingField === `video-${index}` ? 'animate-pulse' : ''}`}>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="video/*"
                                                            onChange={(e) => handleMediaFileUpload(e, setVideoUrls, index, `video-${index}`)}
                                                        />
                                                        <i className={uploadingField === `video-${index}` ? "ri-loader-4-line animate-spin" : "ri-upload-2-line"}></i>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMedia(setVideoUrls, index)}
                                                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => handleAddMedia(setVideoUrls)}
                                            className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-all"
                                        >
                                            + Adicionar Vídeo
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 p-6 bg-gray-100 rounded-2xl border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <i className="ri-file-line"></i> Documentos / Arquivos
                                    </h3>
                                    <div className="space-y-3">
                                        {filesUrls.map((url, index) => (
                                            <div key={index} className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-200">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={url}
                                                        onChange={(e) => handleUpdateMedia(setFilesUrls, index, e.target.value)}
                                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-500 transition-all text-sm"
                                                        placeholder="URL ou upload de arquivo"
                                                    />
                                                    <label className={`w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded-xl cursor-pointer hover:bg-gray-300 transition-colors ${uploadingField === `file-${index}` ? 'animate-pulse' : ''}`}>
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => handleMediaFileUpload(e, setFilesUrls, index, `file-${index}`)}
                                                        />
                                                        <i className={uploadingField === `file-${index}` ? "ri-loader-4-line animate-spin" : "ri-upload-2-line"}></i>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMedia(setFilesUrls, index)}
                                                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <i className="ri-delete-bin-line"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => handleAddMedia(setFilesUrls)}
                                            className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                                        >
                                            + Adicionar Arquivo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <i className="ri-map-2-line text-purple-600"></i> Localização no Mapa (Google Maps Embed URL)
                                </label>
                                <input
                                    type="text"
                                    value={mapUrl}
                                    onChange={(e) => setMapUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                    placeholder="Cole aqui o link do 'Incorporar um mapa' do Google Maps"
                                />
                                <p className="text-xs text-gray-500 italic">Dica: No Google Maps, clique em Compartilhar {'>'} Incorporar um mapa e copie o link dentro do src="..."</p>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700">Imagem de Capa</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={coverImage}
                                        onChange={(e) => setCoverImage(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                                        placeholder="URL da imagem de capa ou upload ao lado"
                                    />
                                    <label className={`w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-xl cursor-pointer hover:bg-purple-200 transition-colors ${uploadingField === 'cover' ? 'animate-pulse' : ''}`}>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, setCoverImage, 'cover')}
                                        />
                                        <i className={uploadingField === 'cover' ? "ri-loader-4-line animate-spin" : "ri-upload-2-line text-xl"}></i>
                                    </label>
                                </div>
                                {coverImage && (
                                    <div className="mt-2 h-32 w-full rounded-xl overflow-hidden border border-gray-100">
                                        <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div >

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="experience-form"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <i className="ri-loader-4-line animate-spin"></i>}
                        {experience ? 'Salvar Alterações' : 'Criar Experiência'}
                    </button>
                </div>
            </div >
        </div >
    );
}
