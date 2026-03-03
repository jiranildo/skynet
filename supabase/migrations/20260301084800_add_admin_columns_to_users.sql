BEGIN;

-- Adicionar colunas na tabela users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS force_password_reset boolean DEFAULT false;

-- Garantir que entity_id aponta para a tabela entities (Apenas por segurança, deve já existir)
-- Se já existir, isso não fará nada de errado.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'users_entity_id_fkey'
        AND table_name = 'users'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entities(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMIT;
