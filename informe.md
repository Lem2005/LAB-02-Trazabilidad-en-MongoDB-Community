# LAB-02 — Trazabilidad en MongoDB Community

**Materia:** Gestión de Seguridad y Desempeño de Bases de Datos, Unidad III
**Entorno:** MongoDB 8.0.6 Community Edition, mongosh 2.8.3, Windows instalación nativa
**Fecha de ejecución:** 2026-11-16

---

## Despliegue, edición y limitación

**Despliegue.** Instalación nativa en Windows, servicio `MongoDB`. Archivo de configuración: `C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg`. Se habilitó `security.authorization: enabled` y se reinició con `Restart-Service MongoDB` desde PowerShell como administrador. Los usuarios `admin` (root) y `app_ventas` (readWrite en `comercial`) se crearon con la excepción de localhost, y se cargaron 5 clientes en `comercial.clientes`.

**Qué no existe en Community.** La auditoría nativa (`auditLog`, `--auditDestination`) es exclusiva de MongoDB Enterprise y de Atlas M10 o superior (REF-U3-04).

**Cómo se verificó (hechos verificados):**
- `db.version()` devolvió `8.0.6`.
- `db.adminCommand({ buildInfo: 1 }).modules` devolvió `[]`. En Enterprise incluiría `"enterprise"`.
- `db.serverCmdLineOpts().parsed` no contiene ninguna sección `auditLog`. Solo muestra `net`, `security`, `storage`, `systemLog` y la ruta del archivo de configuración.

## Perfilador

**Configuración.** Se activó con `db.setProfilingLevel()` en la base `comercial`, de forma temporal, ya que no se configuró `operationProfiling` en `mongod.cfg`.

**Hechos verificados:**
- Con el perfilador apagado (`was: 0`), el cambio de RFC de María García no dejó ningún documento en `system.profile`.
- Con nivel 2 quedaron registradas tres operaciones de `app_ventas@comercial`: `query`, `update` y `remove`. Cada una trae `user`, `client` (127.0.0.1), `appName` (`app-ventas-web`), `ts`, `op`, `ns` y `command`.
- El perfilador **no** guarda el valor anterior de un documento modificado ni el contenido de uno eliminado.
- Con el filtro `{ op: { $in: ["insert","update","remove"] } }` se registró solo el `update`. La consulta `find` ya no apareció. Se ganó menos volumen, pero se perdió la visibilidad de las lecturas.

**Costo.** La guía documenta que el perfilador puede degradar el rendimiento, sobre todo en nivel 2, y que ocupa espacio (REF-U3-05). Las operaciones de la práctica tardaron `millis: 0`, por lo que **no se midió** el impacto real. Es una limitación de este informe.

## Bitácora de mongod

**Dónde se escribe (hecho verificado).** En un archivo: `C:\Program Files\MongoDB\Server\8.0\log\mongod.log`. Lo indica `db.serverCmdLineOpts().parsed.systemLog` (`destination: 'file'`).

**Accesos (hechos verificados):**
- Los accesos fallidos aparecen como `Failed to authenticate` (id 5286307) y los exitosos como `Successfully authenticated` (id 5286306). El campo `attr.result` es `0` en éxito y distinto de cero en fallo.
- Contraseña incorrecta de `app_ventas`: `AuthenticationFailed ... storedKey mismatch` (`result: 18`).
- Usuario inexistente: `UserNotFound` (`result: 11`). Generó **dos líneas** para un solo intento, así que se cuentan intentos, no líneas.
- El cliente recibe el mismo mensaje en ambos casos (`Authentication failed`), lo que evita la enumeración de usuarios. El detalle queda solo en la bitácora.
- En MongoDB 8.0.6 los eventos de autenticación **no incluyeron** `attr.doc.application.name`, por lo que no fue posible comprobar el nombre de la aplicación en esos eventos, a diferencia de lo que supone la guía.
- Una sola sesión de `mongosh` abrió varias conexiones (conn25 a conn29). Tres de ellas (conn26, conn27, conn28) se autenticaron como `app_ventas`. La bitácora no indica cuál ejecutó la operación.

**Cambios de configuración y correlación (hecho verificado).** El evento `Profiler settings changed` no incluye usuario, pero sí `ctx`. Los tres cambios del perfilador ocurrieron en `conn22`. Esa misma conexión se autenticó como `admin` a las 19:28:38.759. Por tanto, el autor de los cambios fue la cuenta `admin`. La correlación solo es válida si el servidor no se reinició entre ambos eventos, porque los números de conexión se reinician.

## Privilegios

**Evidencia directa: ninguna (hecho verificado).** Tras ejecutar `grantRolesToUser("app_ventas", dbAdmin)` con el perfilador en nivel 2, se obtuvo `0` documentos en `system.profile` con `command.grantRolesToUser` y `0` líneas con "grantRoles" en la bitácora.

**Control compensatorio.** Se tomaron instantáneas de los privilegios en `auditoria.instantaneas_privilegios`:
- 2026-11-17T03:38:43Z: `app_ventas` solo con `readWrite`.
- 2026-11-17T03:41:07Z: `app_ventas` con `dbAdmin` y `readWrite`.

**Qué responde y qué no:**

| Pregunta | ¿Responde? |
|---|---|
| ¿Cambiaron los privilegios? | Sí |
| ¿Qué rol se agregó? | Sí (`dbAdmin`) |
| ¿Quién lo agregó? | No |
| ¿Cuándo exactamente? | No, solo entre las dos instantáneas |

**Límite.** `tomada_por` indica quién tomó la instantánea, no quién cambió el privilegio. El control **detecta** el cambio, pero no lo **atribuye**. No equivale a auditoría nativa.

**Incidencia de ejecución.** En el primer intento se revocó el rol antes de tomar la segunda instantánea, por lo que hubo que otorgarlo de nuevo. Esa segunda vuelta se hizo con el perfilador en nivel 1 con filtro, así que los dos conteos en 0 corresponden a la primera vuelta (nivel 2 activo).

## Conservación

**Riesgos observados (hechos verificados):**
- Al reiniciar el servicio, el perfilador volvió a `was: 0` porque no estaba configurado en `mongod.cfg`.
- Los documentos de `system.profile` sobrevivieron (2 antes y 2 después).
- La memoria de `getLog` se vació: 331 eventos antes del reinicio y 81 después.

**Riesgos documentados, no medidos:** `system.profile` es una colección limitada (1 MB por defecto) que sobrescribe lo más antiguo, y `getLog` conserva solo los 1024 eventos más recientes (REF-U3-05, REF-U3-20). No se llenó la colección en la práctica.

**Exportación.** Antes del reinicio se exportaron `system-profile.json` (599 bytes), `bitacora-mongod.log` (125,940 bytes, eventos de `getLog`) y `mongod-archivo-completo.log` (copia del archivo de bitácora). Los hashes SHA-256 están en `evidencias/hashes.sha256`. Los archivos no se modificaron después de calcular los hashes.



## Recomendación

**Para una organización que necesite auditar cambios de privilegios en MongoDB:** usar MongoDB Enterprise o Atlas M10 o superior para habilitar la auditoría nativa, que según REF-U3-04 cubre eventos de autenticación y autorización y cambios de esquema, y enviar sus eventos a un archivo o a un SIEM. Mientras se decide, mantener las instantáneas periódicas como medida transitoria y documentarlas como control compensatorio.

**Hechos verificados que sustentan la recomendación:**
- En Community, `grantRolesToUser` no dejó rastro en el perfilador ni en la bitácora.
- Las instantáneas detectan el cambio, pero no dan autor ni hora exacta.
- La evidencia del perfilador y de `getLog` es volátil.

**Supuestos (no verificados en esta práctica):**
- Que la auditoría nativa registraría el otorgamiento de roles con usuario y hora. Es lo que describe la documentación, pero no se practicó.
- Que el costo de licenciamiento o de un clúster M10+ se justifica frente al riesgo. Requiere un análisis económico y regulatorio propio de la organización.
- Que el impacto de rendimiento del perfilador en producción sea relevante. No se midió.

**Medidas mínimas si se acepta el riesgo:**
- Instantáneas con frecuencia definida según la criticidad.
- Escritura en la colección de instantáneas solo para una cuenta dedicada, distinta de los DBA vigilados.
- Exportación periódica de la bitácora con hash.
- Configuración persistente de `systemLog` en archivo.
- Aprobación formal del riesgo residual (no se puede atribuir ni fechar con precisión un cambio de privilegios).
