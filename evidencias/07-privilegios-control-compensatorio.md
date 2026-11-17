# Actividad 7

## 1. Instantánea 1

```js
db.getSiblingDB("auditoria").instantaneas_privilegios.insertOne({ momento: new Date(), tomada_por: db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers, usuarios: db.getUsers().users.map(u => ({ user: u.user, db: u.db, roles: u.roles })) })
```

Salida:

```js
{ acknowledged: true, insertedId: ObjectId('6afbcc4380503614a4abc114') }
```

## 2. Cambio de privilegios con el perfilador en nivel 2

```js
db.setProfilingLevel(2)
db.grantRolesToUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
```

Salida:

```js
{ was: 1, slowms: 100, sampleRate: 1, filter: { op: { '$in': [ 'insert', 'remove', 'update' ] } }, note: '...', ok: 1 }
{ ok: 1 }
```

## 3. Búsqueda de evidencia del cambio

```js
db.system.profile.countDocuments({ "command.grantRolesToUser": { $exists: true } })
bitacora().filter(e => JSON.stringify(e).includes("grantRoles")).length
```

Salida:

```
0
0
```

## 4. Revocación y segunda vuelta para la instantánea 2

```js
db.grantRolesToUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
db.getSiblingDB("auditoria").instantaneas_privilegios.insertOne({ momento: new Date(), tomada_por: db.runCommand({ connectionStatus: 1 }).authInfo.authenticatedUsers, usuarios: db.getUsers().users.map(u => ({ user: u.user, db: u.db, roles: u.roles })) })
```

Salida:

```js
{ ok: 1 }
{ acknowledged: true, insertedId: ObjectId('6afbccd380503614a4abc115') }
```

## 5. Comparación de instantáneas

```js
db.getSiblingDB("auditoria").instantaneas_privilegios.find({}, { _id: 0 }).sort({ momento: 1 })
```

Salida:

```js
[
  {
    momento: ISODate('2026-11-17T03:38:43.209Z'),
    tomada_por: [ { user: 'admin', db: 'admin' } ],
    usuarios: [
      { user: 'app_ventas', db: 'comercial', roles: [ { role: 'readWrite', db: 'comercial' } ] }
    ]
  },
  {
    momento: ISODate('2026-11-17T03:41:07.516Z'),
    tomada_por: [ { user: 'admin', db: 'admin' } ],
    usuarios: [
      {
        user: 'app_ventas', db: 'comercial',
        roles: [ { role: 'dbAdmin', db: 'comercial' }, { role: 'readWrite', db: 'comercial' } ]
      }
    ]
  }
]
```

| Pregunta | ¿La instantánea responde? |
|---|---|
| ¿Cambiaron los privilegios de app_ventas? | Sí |
| ¿Qué rol se agregó? | (`dbAdmin` sobre `comercial`) |
| ¿Quién lo agregó? | No |
| ¿Cuándo exactamente? | No, solo que ocurrió entre 03:38:43Z y 03:41:07Z |


## 6. Restauración

```js
db.revokeRolesFromUser("app_ventas", [{ role: "dbAdmin", db: "comercial" }])
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } })
```

Salida: `{ ok: 1 }` y el estado del perfilador con el filtro restablecido.

## Respuestas

**1. ¿Por qué un cambio de privilegios es uno de los eventos auditables más importantes?**
Porque los privilegios determinan quién puede leer, modificar o administrar todo lo demás. Una escalada no autorizada es una vía típica de abuso o ataque y suele ser requisito de cumplimiento.

**2. ¿Con qué frecuencia tomarías instantáneas? ¿Qué factores influyen?**
Depende de la frecuencia con que se otorgan privilegios, la criticidad de los datos, la ventana de detección aceptable, los requisitos regulatorios y el costo y volumen de almacenamiento. Para sistemas críticos, cada hora o diaria, y además después de cada ventana de cambios.

**3. ¿Quién debería poder escribir en `auditoria.instantaneas_privilegios`?**
Solo una cuenta dedicada de auditoría o seguridad, o un proceso programado con permiso de solo inserción, y no los DBA cuyos cambios se vigilan (separación de funciones). Los auditores, solo lectura. Limitación: un `root` aún podría alterarla, por eso se exporta con hash.

**4. Comunicación a Dirección (tres líneas):**
> En MongoDB Community no es posible saber quién otorgó un privilegio ni la hora exacta.
> Esta medida es un control compensatorio y no equivale a una auditoría nativa.
> Para obtener autor y momento se requiere MongoDB Enterprise o Atlas, o aceptar formalmente el riesgo.