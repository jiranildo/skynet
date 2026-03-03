import { supabase } from './client';

export interface SupplierDashboardData {
    totalServices: number;
    servicesSold: number;
    servicesUtilized: number;
    totalRevenue: number;
    supplierGrowth: any[];
    statusDistribution: any[];
    servicesByLocation: any[];
    topServices: any[];
    recentActivity: any[];
}

export const getSupplierAnalyticsDashboard = async (supplierId: string, days: number = 30): Promise<SupplierDashboardData | null> => {
    try {
        const { data, error } = await supabase.rpc('get_supplier_dashboard_analytics', {
            p_supplier_id: supplierId,
            p_days: days
        });

        if (error) throw error;
        return data as SupplierDashboardData;
    } catch (error) {
        console.error('Error fetching supplier dashboard analytics:', error);
        return null;
    }
};
