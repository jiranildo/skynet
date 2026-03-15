import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, getUserDocuments, getUserTravelProfile, createNotification, getNotifications } from '../services/supabase';

export const useSystemNotifications = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const checkSystemNotifications = async () => {
            try {
                // 1. Obter configs do user validando trip_reminders_short
                const { data: userData } = await supabase.from('users').select('notification_channels').eq('id', user.id).single();
                const allowsReminders = userData?.notification_channels?.trip_reminders_short !== false;
                const reminderTimes = userData?.notification_channels?.trip_reminder_times || ['5 minutos', '1 hora', '2 horas', '4 horas', '8 horas', '1 dia', '3 dias', '5 dias'];

                // 2. Fetch existing notifications to avoid duplicates
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

                // 3. Check Trips and Itinerary Reminders
                const { data: trips } = await supabase
                    .from('trips')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('end_date', new Date().toISOString().split('T')[0]); // Future or current trips

                if (trips) {
                    const now = new Date();

                    trips.forEach(async (trip) => {
                        // A: Global Trip warnings (7 days)
                        const startDate = new Date(trip.start_date);
                        const diffTimeGlobal = startDate.getTime() - now.getTime();
                        const diffDaysGlobal = Math.ceil(diffTimeGlobal / (1000 * 60 * 60 * 24));

                        if (diffDaysGlobal <= 7 && diffDaysGlobal >= 0) {
                            const title = `Viagem Chegando: ${trip.destination}`;
                            const hasNotif = existingNotifs.some(n => n.title === title);

                            if (!hasNotif) {
                                await createNotification({
                                    user_id: user.id,
                                    type: 'trip',
                                    title: title,
                                    message: `Sua viagem para ${trip.destination} começa em ${diffDaysGlobal} dias! Verifique seu roteiro e documentos.`,
                                    related_trip_id: trip.id
                                });
                            }
                        }

                        // B: Check Items Pending
                        if (trip.itinerary && diffDaysGlobal <= 14 && diffDaysGlobal >= 0) {
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
                                        related_trip_id: trip.id
                                    });
                                }
                            }
                        }

                        // C: Itinerary Time Reminders (Dynamic Cron Simulator)
                        if (trip.itinerary) {
                            Object.keys(trip.itinerary).forEach((dayKey) => {
                                const dayIndex = parseInt(dayKey, 10);
                                if (isNaN(dayIndex)) return;

                                const activities = trip.itinerary[dayKey] as any[];
                                if (!Array.isArray(activities)) return;

                                // Base date for this specific day
                                const activityDate = new Date(trip.start_date);
                                activityDate.setDate(activityDate.getDate() + dayIndex);

                                activities.forEach(async (activity) => {
                                    if (!activity.time) return;

                                    const timeParts = activity.time.split(':');
                                    if (timeParts.length !== 2) return;

                                    const eventDateTime = new Date(activityDate);
                                    eventDateTime.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);

                                    const diffMs = eventDateTime.getTime() - now.getTime();
                                    const diffMins = Math.floor(diffMs / 60000);

                                    if (diffMins < 0 || diffMins > 7200) return; // Ignore past or > 5 days

                                    // Determine the appropriate mark
                                    let markLabel = '';
                                    if (diffMins <= 5 && diffMins > 0) markLabel = '5 minutos';
                                    else if (diffMins <= 60 && diffMins > 5) markLabel = '1 hora';
                                    else if (diffMins <= 120 && diffMins > 60) markLabel = '2 horas';
                                    else if (diffMins <= 240 && diffMins > 120) markLabel = '4 horas';
                                    else if (diffMins <= 480 && diffMins > 240) markLabel = '8 horas';
                                    else if (diffMins <= 1440 && diffMins > 480) markLabel = '1 dia';
                                    else if (diffMins <= 4320 && diffMins > 1440) markLabel = '3 dias';
                                    else if (diffMins <= 7200 && diffMins > 4320) markLabel = '5 dias';
                                    else return;

                                    const titlePrefix = `Lembrete (${markLabel})`;
                                    const notifTitle = `${titlePrefix}: ${activity.title || 'Atividade'}`;

                                    // Check if we already notified for this specific mark
                                    const hasNotif = existingNotifs.some(n => n.title === notifTitle);

                                    if (!hasNotif) {
                                        // Customize message based on activity type
                                        let message = `Falta(m) ${markLabel} para o seu compromisso.`;
                                        type ActivityType = 'flight' | 'hotel' | 'tour' | 'car' | 'restaurant' | string;
                                        const type = activity.type as ActivityType;

                                        if (type === 'flight') message = `Falta(m) ${markLabel} para o seu Voo (${activity.title}). Não esqueça o Check-in e passaporte!`;
                                        if (type === 'hotel') message = `Falta(m) ${markLabel} para o Check-in no seu Hotel (${activity.title}).`;
                                        if (type === 'tour') message = `Falta(m) ${markLabel} para o Passeio (${activity.title}). Chegue no local com antecedência.`;
                                        if (type === 'car') message = `Falta(m) ${markLabel} para a retirada do veículo.`;
                                        if (type === 'restaurant') message = `Falta(m) ${markLabel} para sua reserva no ${activity.title}.`;

                                        if (allowsReminders && reminderTimes.includes(markLabel)) {
                                            await createNotification({
                                                user_id: user.id,
                                                type: 'trip',
                                                title: notifTitle,
                                                message: message,
                                                related_trip_id: trip.id
                                            });
                                        }
                                    }
                                });
                            });
                        }
                    });
                }

            } catch (error) {
                console.error("Error checking system notifications:", error);
            }
        };

        // Run check on mount
        checkSystemNotifications();

        // Run interval every minute to process dynamic itineraries correctly
        const interval = setInterval(() => {
            checkSystemNotifications();
        }, 60000);

        return () => clearInterval(interval);

    }, [user]);
};
