-- Drop the existing functions to avoid signature conflicts if we change them
DROP FUNCTION IF EXISTS public.get_admin_analytics(integer);
DROP FUNCTION IF EXISTS public.get_admin_analytics(text, uuid, integer);

-- Create the updated function with 100% real data
CREATE OR REPLACE FUNCTION public.get_admin_analytics(p_role text, p_entity_id uuid DEFAULT NULL::uuid, p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_total_users int;
  v_active_users int;
  v_total_posts int;
  v_total_trips int;
  v_total_revenue numeric;
  
  v_users_growth json;
  v_tm_velocity json;
  v_category_distribution json;
  v_recent_activity json;
  v_result json;
BEGIN
  -- Basic Stats (Role based) with 100% Real Data
  IF p_role = 'super_admin' THEN
    SELECT COUNT(*) INTO v_total_users FROM public.users;
    SELECT COUNT(*) INTO v_active_users FROM public.users WHERE updated_at > now() - interval '24 hours';
    SELECT COALESCE(SUM(posts_count), 0) INTO v_total_posts FROM public.users;
    SELECT COUNT(*) INTO v_total_trips FROM public.trips;
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue FROM public.travel_money_transaction WHERE type = 'earn';
  ELSE
    SELECT COUNT(*) INTO v_total_users FROM public.users WHERE entity_id = p_entity_id;
    SELECT COUNT(*) INTO v_active_users FROM public.users WHERE entity_id = p_entity_id AND updated_at > now() - interval '24 hours';
    SELECT COALESCE(SUM(posts_count), 0) INTO v_total_posts FROM public.users WHERE entity_id = p_entity_id;
    SELECT COUNT(*) INTO v_total_trips FROM public.trips WHERE user_id IN (SELECT id FROM public.users WHERE entity_id = p_entity_id);
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue FROM public.travel_money_transaction 
    WHERE type = 'earn' AND user_id IN (SELECT id FROM public.users WHERE entity_id = p_entity_id);
  END IF;

  -- User Growth
  SELECT json_agg(row_to_json(g)) INTO v_users_growth
  FROM (
      SELECT 
          to_char(created_at, 'DD/MM') as name,
          count(*) over (order by created_at) as users
      FROM public.users
      WHERE created_at >= (now() - (p_days || ' days')::interval)
      AND (p_role = 'super_admin' OR entity_id = p_entity_id)
      ORDER BY created_at ASC
  ) g;

  -- TM Velocity
  SELECT json_agg(row_to_json(v)) INTO v_tm_velocity
  FROM (
      SELECT 
          to_char(created_at, 'DD/MM') as name,
          COALESCE(SUM(amount) FILTER (WHERE type = 'earn'), 0) as earn,
          COALESCE(SUM(amount) FILTER (WHERE type = 'spend'), 0) as spend
      FROM public.travel_money_transaction
      WHERE created_at >= (now() - (p_days || ' days')::interval)
      AND (p_role = 'super_admin' OR user_id IN (SELECT id FROM public.users WHERE entity_id = p_entity_id))
      GROUP BY to_char(created_at, 'DD/MM'), DATE(created_at)
      ORDER BY DATE(created_at) ASC
  ) v;

  -- Category Distribution
  SELECT json_agg(row_to_json(c)) INTO v_category_distribution
  FROM (
      SELECT category as name, COUNT(*) as value
      FROM (
          SELECT category FROM public.experiences WHERE (p_role = 'super_admin' OR supplier_id = p_entity_id)
          UNION ALL
          SELECT 'Roteiro' as category FROM public.trips WHERE (p_role = 'super_admin' OR user_id IN (SELECT id FROM public.users WHERE entity_id = p_entity_id))
      ) all_items
      GROUP BY category
  ) c;

  -- Recent Activity (Simulated from actual tables for the dashboard feed)
  -- 1. New Users
  -- 2. New Trips/Experiences
  -- 3. TM Transactions
  SELECT json_agg(row_to_json(a)) INTO v_recent_activity
  FROM (
      SELECT * FROM (
          SELECT 
              'Usuário Entrou' as action,
              'Novo viajante na plataforma' as details,
              'ri-user-add-line' as icon,
              'bg-blue-50 text-blue-500' as color,
              created_at
          FROM public.users
          WHERE (p_role = 'super_admin' OR entity_id = p_entity_id)
          
          UNION ALL
          
          SELECT 
              'Novo Roteiro' as action,
              title as details,
              'ri-map-pin-line' as icon,
              'bg-green-50 text-green-500' as color,
              created_at
          FROM public.trips
          WHERE (p_role = 'super_admin' OR user_id IN (SELECT id FROM public.users WHERE entity_id = p_entity_id))
          
          UNION ALL
          
          SELECT 
              'Transação TM' as action,
              amount || ' TM ' || type as details,
              'ri-money-dollar-circle-line' as icon,
              CASE WHEN type = 'earn' THEN 'bg-yellow-50 text-yellow-500' ELSE 'bg-red-50 text-red-500' END as color,
              created_at
          FROM public.travel_money_transaction
          WHERE (p_role = 'super_admin' OR user_id IN (SELECT id FROM public.users WHERE entity_id = p_entity_id))
      ) combined_activity
      ORDER BY created_at DESC
      LIMIT 10
  ) a;

  v_result := json_build_object(
      'totalUsers', v_total_users,
      'activeUsers', v_active_users,
      'totalPosts', v_total_posts,
      'totalTrips', v_total_trips,
      'totalMarketplaceItems', COALESCE((SELECT SUM(value::int) FROM json_array_elements_text(v_category_distribution) as o(value) CROSS JOIN LATERAL json_extract_path_text(o.value::json, 'value')), 0),
      'totalRevenue', v_total_revenue,
      'usersGrowth', COALESCE(v_users_growth, '[]'::json),
      'tmVelocity', COALESCE(v_tm_velocity, '[]'::json),
      'categoryDistribution', COALESCE(v_category_distribution, '[]'::json),
      'recentActivity', COALESCE(v_recent_activity, '[]'::json)
  );
  
  RETURN v_result;
END;
$function$
