import db from "@/config/database.js";
import RoleRepository from "@/modules/roles/repositories/role.repository.js";
import RoleService from "@/modules/roles/services/role.service.js";

async function runMigration() {
  try {
    console.log("Iniciando migração de permissões...");

    const test = await db.query("SELECT NOW() as now");
    console.log("Conexão com banco OK", test.rows[0]);

    const repository = new RoleRepository();
    const service = new RoleService(repository);

    const result = await service.updateAllRolesWithNewPermissions();

    console.log(`Migração concluída: ${result.updated} de ${result.total} roles atualizadas.`);

    process.exit(0);
  } catch (error) {
    console.log("Erro na migração de permissões:", error);
    process.exit(1);
  }
}

runMigration();