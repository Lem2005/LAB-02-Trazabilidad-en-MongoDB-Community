// =====================================================================
// LAB-02 — Trazabilidad en MongoDB Community
// Registro de comandos ejecutados en mongosh
// =====================================================================

// ---------------------------------------------------------------------
// PREPARACIÓN
// ---------------------------------------------------------------------
use admin
db.createUser({ user: "admin", pwd: "<REDACTED>", roles: ["root"] })
db.auth("admin", "<REDACTED>")

use comercial
db.createUser({
  user: "app_ventas",
  pwd: "<REDACTED>",
  roles: [{ role: "readWrite", db: "comercial" }]
})

db.clientes.insertMany([
  { _id: 1, nombre: "Ana López", correo: "ana.lopez@example.test", telefono: "6671234567", rfc: "LOAA850315ABC", edad: 41, ciudad: "Culiacán", codigo_postal: "80000" },
  { _id: 2, nombre: "Carlos Pérez", correo: "carlos.perez@example.test", telefono: "6672345678", rfc: "PECA900720DEF", edad: 35, ciudad: "Culiacán", codigo_postal: "80100" },
  { _id: 3, nombre: "María García", correo: "maria.garcia@example.test", telefono: "6673456789", rfc: "GAMA780912GHI", edad: 47, ciudad: "Mazatlán", codigo_postal: "82000" },
  { _id: 4, nombre: "Luis Torres", correo: "luis.torres@example.test", telefono: "6674567890", rfc: "TOLU920201JKL", edad: 34, ciudad: "Los Mochis", codigo_postal: "81200" },
  { _id: 5, nombre: "Laura Sánchez", correo: "laura.sanchez@example.test", telefono: "6675678901", rfc: "SALA880525MNO", edad: 38, ciudad: "Culiacán", codigo_postal: "80200" }
])
db.clientes.countDocuments()

// ---------------------------------------------------------------------
// FUNCIÓN AUXILIAR (sesión DBA)
// mongosh "mongodb://admin:<REDACTED>@127.0.0.1:27017/comercial?authSource=admin"
// ---------------------------------------------------------------------
function bitacora() {
  return db.adminCommand({ getLog: "global" }).log.map(l => JSON.parse(l))
}

// ---------------------------------------------------------------------
// ACTIVIDAD 1 — Edición y limitación
// ---------------------------------------------------------------------
db.version()
db.adminCommand({ buildInfo: 1 }).modules
db.serverCmdLineOpts().parsed
db.serverCmdLineOpts().parsed.systemLog

// ---------------------------------------------------------------------
// ACTIVIDAD 2 — Incidente sin perfilado
// ---------------------------------------------------------------------
db.getProfilingStatus()

// Sesión de la aplicación (Terminal B):
// mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial?appName=app-ventas-web"
db.clientes.updateOne({ _id: 3 }, { $set: { rfc: "GAMA780912XXX" } })

// Búsqueda de evidencia (Terminal A):
db.system.profile.countDocuments()
bitacora().filter(e => JSON.stringify(e).includes("GAMA780912XXX")).length
bitacora().filter(e => JSON.stringify(e).includes("app-ventas-web")).map(e => ({ t: e.t, c: e.c, ctx: e.ctx, msg: e.msg }))
bitacora().filter(e => e.c === "ACCESS").map(e => ({ t: e.t, ctx: e.ctx, msg: e.msg, user: e.attr && e.attr.user }))

// ---------------------------------------------------------------------
// ACTIVIDAD 3 — Perfilador nivel 2
// ---------------------------------------------------------------------
db.setProfilingLevel(2)
db.getProfilingStatus()

// Terminal B (aplicación):
db.clientes.find({ ciudad: "Culiacán" }, { nombre: 1, ciudad: 1 }).toArray(); db.clientes.updateOne({ _id: 3 }, { $set: { rfc: "GAMA780912XYZ" } }); db.clientes.deleteOne({ _id: 2 });

// Terminal A:
db.system.profile.find(
  { ns: "comercial.clientes" },
  { op: 1, ns: 1, command: 1, user: 1, client: 1, appName: 1, ts: 1, millis: 1, nreturned: 1, docsExamined: 1, nModified: 1, ndeleted: 1 }
).sort({ ts: 1 })

require('fs').writeFileSync('evidencias/system-profile-act3.json', EJSON.stringify(db.system.profile.find({ ns: "comercial.clientes" }).toArray(), null, 2))
// ---------------------------------------------------------------------
// ACTIVIDAD 4 — Filtro de perfilado
// ---------------------------------------------------------------------
db.setProfilingLevel(0)
db.system.profile.drop()
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } })
db.getProfilingStatus()

// Terminal B:
db.clientes.find({ _id: 1 }).toArray(); db.clientes.updateOne({ _id: 1 }, { $set: { telefono: "6670000000" } })

// Terminal A:
db.system.profile.find({}, { op: 1, ns: 1, user: 1, appName: 1, "command.q": 1, "command.u": 1, ts: 1 })

// ---------------------------------------------------------------------
// ACTIVIDAD 5 — Accesos en la bitácora
// Intentos fallidos (se ejecutaron desde PowerShell, no desde mongosh):
//   mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial" --quiet --eval 'db.clientes.countDocuments()'
//   mongosh "mongodb://usuario_inexistente:<REDACTED>@127.0.0.1:27017/comercial" --quiet --eval 'db.clientes.countDocuments()'
// ---------------------------------------------------------------------
bitacora().filter(e => e.msg === "Failed to authenticate").slice(-1)
bitacora().filter(e => e.msg === "Successfully authenticated" && e.attr.user === "app_ventas").slice(-1)
bitacora().filter(e => e.c === "ACCESS" && e.msg === "Failed to authenticate").map(e => ({ t: e.t, id: e.id, ctx: e.ctx, user: e.attr?.user, client: e.attr?.client, error: e.attr?.error, result: e.attr?.result, app: e.attr?.doc?.application?.name }))
bitacora().filter(e => e.msg === "Successfully authenticated" && e.attr?.user === "app_ventas").slice(-1).map(e => ({ t: e.t, id: e.id, ctx: e.ctx, client: e.attr?.client, result: e.attr?.result, app: e.attr?.doc?.application?.name }))

// ---------------------------------------------------------------------
// ACTIVIDAD 6 — Correlación por ctx
// ---------------------------------------------------------------------
bitacora().filter(e => e.msg === "Profiler settings changed").map(e => ({ t: e.t, ctx: e.ctx, msg: e.msg, attr: e.attr }))
bitacora().filter(e => e.ctx === "conn22" && e.msg === "Successfully authenticated").map(e => ({ t: e.t, ctx: e.ctx, user: e.attr?.user, db: e.attr?.db, client: e.attr?.client }))

// ---------------------------------------------------------------------
// ACTIVIDAD 7 — Privilegios y control compensatorio
// ---------------------------------------------------------------------
// Instantánea 1
db.getSiblingDB("auditoria").instantaneas_privilegios.insertOne({ momento: new Date(), tomada_por: db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers, usuarios: db.getUsers().users.map(u => ({ user: u.user, db: u.db, roles: u.roles })) })

db.setProfilingLevel(2)
db.grantRolesToUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])

db.system.profile.countDocuments({ "command.grantRolesToUser": { $exists: true } })
bitacora().filter(e => JSON.stringify(e).includes("grantRoles")).length

// Primer intento de restauración (la instantánea 2 aún no se había tomado)
db.revokeRolesFromUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } })

// Segunda vuelta: se vuelve a otorgar el rol y se toma la instantánea 2
db.grantRolesToUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
db.getSiblingDB("auditoria").instantaneas_privilegios.insertOne({ momento: new Date(), tomada_por: db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers, usuarios: db.getUsers().users.map(u => ({ user: u.user, db: u.db, roles: u.roles })) })

// Comparación de instantáneas
db.getSiblingDB("auditoria").instantaneas_privilegios.find({}, { _id: 0 }).sort({ momento: 1 })

// Restauración final
db.revokeRolesFromUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } })

// ---------------------------------------------------------------------
// ACTIVIDAD 8 — Conservación
// ---------------------------------------------------------------------
bitacora().length   // resultado: 331 (antes del reinicio)
require('fs').writeFileSync('evidencias/system-profile.json', EJSON.stringify(db.system.profile.find({}, { op: 1, ns: 1, user: 1, client: 1, appName: 1, ts: 1, "command.q": 1, "command.u": 1 }).toArray(), null, 2))
require('fs').writeFileSync('evidencias/bitacora-mongod.log', db.adminCommand({ getLog: "global" }).log.join("\n"))
db.system.profile.countDocuments()   // resultado: 2

// Comandos de PowerShell usados en esta actividad:
//   Copy-Item "C:\Program Files\MongoDB\Server\8.0\log\mongod.log" evidencias\mongod-archivo-completo.log
//   Get-FileHash evidencias\system-profile.json, evidencias\bitacora-mongod.log, evidencias\mongod-archivo-completo.log -Algorithm SHA256 | Format-List > evidencias\hashes.sha256
//   Restart-Service MongoDB

// Tras el reinicio (nueva sesión DBA):
db.getProfilingStatus()              // resultado: { was: 0, ... }
db.system.profile.countDocuments()   // resultado: 2
function bitacora() { return db.adminCommand({ getLog: "global" }).log.map(l => JSON.parse(l)) }
bitacora().length                    // resultado: 81