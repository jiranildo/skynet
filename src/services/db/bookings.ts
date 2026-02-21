import { supabase } from './client';
import type { FlightBooking, HotelBooking, CarRental, TravelPackage } from './types';

// ==================== RESERVAS DE VOOS ====================

export const flightBookingService = {
    async getAll(): Promise<FlightBooking[]> {
        const { data, error } = await supabase
            .from('flight_bookings')
            .select('*')
            .order('departure_date', { ascending: false });

        if (error) throw error;
        return data as FlightBooking[];
    },

    async getById(id: string): Promise<FlightBooking> {
        const { data, error } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as FlightBooking;
    },

    async create(booking: Omit<FlightBooking, 'id' | 'created_at' | 'updated_at'>): Promise<FlightBooking> {
        const { data, error } = await supabase
            .from('flight_bookings')
            .insert(booking)
            .select()
            .single();

        if (error) throw error;
        return data as FlightBooking;
    },

    async update(id: string, updates: Partial<FlightBooking>): Promise<FlightBooking> {
        const { data, error } = await supabase
            .from('flight_bookings')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as FlightBooking;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('flight_bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ==================== RESERVAS DE HOTÉIS ====================

export const hotelBookingService = {
    async getAll(): Promise<HotelBooking[]> {
        const { data, error } = await supabase
            .from('hotel_bookings')
            .select('*')
            .order('check_in', { ascending: false });

        if (error) throw error;
        return data as HotelBooking[];
    },

    async getById(id: string): Promise<HotelBooking> {
        const { data, error } = await supabase
            .from('hotel_bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as HotelBooking;
    },

    async create(booking: Omit<HotelBooking, 'id' | 'created_at' | 'updated_at'>): Promise<HotelBooking> {
        const { data, error } = await supabase
            .from('hotel_bookings')
            .insert(booking)
            .select()
            .single();

        if (error) throw error;
        return data as HotelBooking;
    },

    async update(id: string, updates: Partial<HotelBooking>): Promise<HotelBooking> {
        const { data, error } = await supabase
            .from('hotel_bookings')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as HotelBooking;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('hotel_bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ==================== ALUGUEL DE CARROS ====================

export const carRentalService = {
    async getAll(): Promise<CarRental[]> {
        const { data, error } = await supabase
            .from('car_rentals')
            .select('*')
            .order('pickup_date', { ascending: false });

        if (error) throw error;
        return data as CarRental[];
    },

    async getById(id: string): Promise<CarRental> {
        const { data, error } = await supabase
            .from('car_rentals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as CarRental;
    },

    async create(rental: Omit<CarRental, 'id' | 'created_at' | 'updated_at'>): Promise<CarRental> {
        const { data, error } = await supabase
            .from('car_rentals')
            .insert(rental)
            .select()
            .single();

        if (error) throw error;
        return data as CarRental;
    },

    async update(id: string, updates: Partial<CarRental>): Promise<CarRental> {
        const { data, error } = await supabase
            .from('car_rentals')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as CarRental;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('car_rentals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};

// ==================== PACOTES DE VIAGEM ====================

export const travelPackageService = {
    async getAll(): Promise<TravelPackage[]> {
        const { data, error } = await supabase
            .from('travel_packages')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) throw error;
        return data as TravelPackage[];
    },

    async getById(id: string): Promise<TravelPackage> {
        const { data, error } = await supabase
            .from('travel_packages')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as TravelPackage;
    },

    async create(packageData: Omit<TravelPackage, 'id' | 'created_at' | 'updated_at'>): Promise<TravelPackage> {
        const { data, error } = await supabase
            .from('travel_packages')
            .insert(packageData)
            .select()
            .single();

        if (error) throw error;
        return data as TravelPackage;
    },

    async update(id: string, updates: Partial<TravelPackage>): Promise<TravelPackage> {
        const { data, error } = await supabase
            .from('travel_packages')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as TravelPackage;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('travel_packages')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
