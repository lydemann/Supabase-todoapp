createSnapshotOfProd();

async function createSnapshotOfProd() {
  // eslint-disable-next-line
  const { execSync } = require('child_process');

  console.log('========== Create Snapshot ==========');

  const name = new Date().toISOString();
  execSync(
    `PGPASSWORD=$TODOAPP_DB_POSTGRES_PASSWORD pg_dump -h $TODOAPP_DB_POSTGRES_HOST -p 5432 -U postgres -f apps/web/supabase/snapshots/prod-${name}.sql`
  );
}
