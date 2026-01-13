import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, getUserDocuments, getUserTravelProfile, createNotification, getNotifications } from '../services/supabase';

export const useSystemNotifications = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const checkSystemNotifications = async () => {
            try {
                // 1. Fetch existing notifications to avoid duplicates
                const existingNotifs = await getNotifications(user.id);

                // 2. Check Documents (Passport)
                const documents = await getUserDocuments(user.id);
                // Correctly match lowercase enum type
                const passport = documents.find(d => d.type === 'passport');

                if (passport && passport.expiry_date) {
                    const expiryDate = new Date(passport.expiry_date);
                    const today = new Date();
                    const sixMonthsFromNow = new Date();
                    sixMonthsFromNow.setMonth(today.getMonth() + 6);

                    // Check if expired or expiring soon
                    if (expiryDate < today) {
                        const title = "Passaporte Vencido";
                        const hasNotif = existingNotifs.some(n => n.title === title && !n.is_read);

                        if (!hasNotif) {
                            await createNotification({
                                user_id: user.id,
                                type: 'alert',
                                title: title,
                                message: `Seu passaporte (${passport.number}) venceu em ${expiryDate.toLocaleDateString()}. Renove imediatamente!`,
                            });
                        }
                    } else if (expiryDate < sixMonthsFromNow) {
                        const title = "Passaporte Expurando";
                        const hasNotif = existingNotifs.some(n => n.title === title && !n.is_read); // Simple duplicate check

                        if (!hasNotif) {
                            await createNotification({
                                user_id: user.id,
                                type: 'warning',
                                title: title,
                                message: `Seu passaporte vence em menos de 6 meses (${expiryDate.toLocaleDateString()}). Alguns países podem negar entrada.`,
                            });
                        }
                    }
                }

                // 3. Check Upcoming Trips
                const { data: trips } = await supabase
                    .from('trips')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('start_date', new Date().toISOString().split('T')[0]); // Future trips

                if (trips) {
                    trips.forEach(async (trip) => {
                        const startDate = new Date(trip.start_date);
                        const today = new Date();
                        const diffTime = startDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays <= 7 && diffDays >= 0) {
                            const title = `Viagem Chegando: ${trip.destination}`;
                            const hasNotif = existingNotifs.some(n => n.title === title);

                            if (!hasNotif) {
                                await createNotification({
                                    user_id: user.id,
                                    type: 'trip',
                                    title: title,
                                    message: `Sua viagem para ${trip.destination} começa em ${diffDays} dias! Verifique seu roteiro e documentos.`,
                                    related_post_id: trip.id // Linking to trip ID for potential navigation
                                });
                            }
                        }

                        // 4. Check Pending Items (Reservations)
                        if (trip.itinerary && diffDays <= 14 && diffDays >= 0) {
                            const allActivities = Object.values(trip.itinerary as { [key: string]: any[] }).flat();
                            const pendingCount = allActivities.filter(a => a.status === 'pending').length;

                            if (pendingCount > 0) {
                                const title = `Pendências: ${trip.destination}`;
                                const hasNotif = existingNotifs.some(n => n.title === title && !n.is_read);

                                if (!hasNotif) {
                                    await createNotification({
                                        user_id: user.id,
                                        type: 'alert',
                                        title: title,
                                        message: `Você tem ${pendingCount} reservas ou itens pendentes para sua viagem de ${trip.destination}. Confirme-os antes de viajar!`,
                                        related_post_id: trip.id
                                    });
                                }
                            }
                        }
                    });
                }

            } catch (error) {
                console.error("Error checking system notifications:", error);
            }
        };

        // Run check on mount
        checkSystemNotifications();

    }, [user]);
};
