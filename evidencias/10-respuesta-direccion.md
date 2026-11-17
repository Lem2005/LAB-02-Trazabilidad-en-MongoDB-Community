# Actividad 10

## 1. ¿Quién cambió el RFC de María García?

**Actividad 2**
**No hay evidencia con esta edición.**
el perfilador estaba en nivel 0, por lo que `system.profile` tenía 0 documentos. La bitácora de `mongod` registra conexiones y autenticaciones, pero no las operaciones de datos: el valor `GAMA780912XXX` no apareció en ninguna de sus líneas. Solo se puede afirmar que `app_ventas` se autenticó desde conexiones de `app-ventas-web` a las 19:30 (conn26, conn27 y conn28), lo cual no prueba que una de ellas haya ejecutado el cambio.

**Actividad 3**
La cuenta **`app_ventas@comercial`**, según el campo `user` del documento `update` de `system.profile` (`$set` de `rfc: "GAMA780912XYZ"` sobre `_id: 3`).
Limitación: es una cuenta de aplicación, no una persona. No permite saber qué usuario humano de la tienda en línea originó la acción.

## 2. ¿Cuándo y desde qué aplicación?

**Actividad 2:** 
**No hay evidencia con esta edición.** 
Sin documento en el perfilador no hay hora ni aplicación asociadas a la operación; solo hay eventos de conexión.

**Actividad 3:**

| Dato | Valor |
|---|---|
| Momento | 2026-11-17T03:01:41.078Z (UTC), equivale a 2026-11-16 20:01:41 hora local |
| Aplicación | `app-ventas-web` (campo `appName`) |
| Cliente | `127.0.0.1` |



## 3. ¿Qué valor tenía antes?

**No hay evidencia con esta edición.**
el documento del perfilador guarda el comando ejecutado (`$set` con el valor nuevo `GAMA780912XYZ`), no el estado anterior del documento. El valor original `GAMA780912GHI` se conoce solo porque se insertó en la preparación del laboratorio, no porque la trazabilidad lo muestre.

## 4. ¿Cambió alguien los privilegios de `app_ventas`?

**Sí cambiaron, pero no hay evidencia de quién ni de cuándo exactamente.**

- Qué cambió: las instantáneas muestran que `app_ventas` pasó de tener solo `readWrite` sobre `comercial` (instantánea de 03:38:43Z) a tener también `dbAdmin` (instantánea de 03:41:07Z).
- Quién: **No hay evidencia con esta edición.** El comando `grantRolesToUser` no quedó en `system.profile` (conteo 0, con nivel 2 activo) ni en la bitácora (0 líneas con "grantRoles"). El perfilador no está diseñado para registrar comandos de administración de usuarios y la bitácora de Community no registra el DDL ni los cambios de privilegios. El campo `tomada_por` de la instantánea indica quién tomó la foto (`admin`), no quién hizo el cambio.
- Cuándo: solo se sabe que ocurrió entre 20:38:43 y 20:41:07 hora local. Es la resolución del control compensatorio.

