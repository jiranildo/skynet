alter table messages 
add column if not exists reply_to_id uuid references messages(id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'messages_reply_to_id_fkey') then
    alter table messages add constraint messages_reply_to_id_fkey foreign key (reply_to_id) references messages(id);
  end if;
end $$;
