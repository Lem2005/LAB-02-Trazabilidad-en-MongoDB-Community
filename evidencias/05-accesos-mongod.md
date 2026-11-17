# Actividad 5 — Accesos en la bitácora de mongod

## 1. Intentos fallidos generados (PowerShell)

```powershell
mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial" --quiet --eval 'db.clientes.countDocuments()'
mongosh "mongodb://usuario_inexistente:<REDACTED>@127.0.0.1:27017/comercial" --quiet --eval 'db.clientes.countDocuments()'
```

Salida :

```
MongoServerError: Authentication failed.
```

## 2. Accesos fallidos en la bitácora (Terminal A)

```js
bitacora().filter(e => e.c === "ACCESS" && e.msg === "Failed to authenticate").map(e => ({ t: e.t, id: e.id, ctx: e.ctx, user: e.attr?.user, client: e.attr?.client, error: e.attr?.error, result: e.attr?.result, app: e.attr?.doc?.application?.name }))
```

Salida:

```js
[
  {
    t: { '$date': '2026-11-16T19:25:34.736-07:00' },
    id: 5286307,
    ctx: 'conn8',
    user: 'admin',
    client: '127.0.0.1:64574',
    error: 'UserNotFound: Could not find user "admin" for db "admin"',
    result: 11,
    app: undefined
  },
  {
    t: { '$date': '2026-11-16T19:25:34.738-07:00' },
    id: 5286307,
    ctx: 'conn8',
    user: 'admin',
    client: '127.0.0.1:64574',
    error: 'UserNotFound: Could not find user "admin" for db "admin"',
    result: 11,
    app: undefined
  },
  {
    t: { '$date': '2026-11-16T19:27:34.004-07:00' },
    id: 5286307,
    ctx: 'conn15',
    user: 'admin',
    client: '127.0.0.1:57714',
    error: 'UserNotFound: Could not find user "admin" for db "admin"',
    result: 11,
    app: undefined
  },
  {
    t: { '$date': '2026-11-16T19:27:34.005-07:00' },
    id: 5286307,
    ctx: 'conn15',
    user: 'admin',
    client: '127.0.0.1:57714',
    error: 'UserNotFound: Could not find user "admin" for db "admin"',
    result: 11,
    app: undefined
  },
  {
    t: { '$date': '2026-11-16T20:21:41.184-07:00' },
    id: 5286307,
    ctx: 'conn31',
    user: 'app_ventas',
    client: '127.0.0.1:64319',
    error: 'AuthenticationFailed: SCRAM authentication failed, storedKey mismatch',
    result: 18,
    app: undefined
  },
  {
    t: { '$date': '2026-11-16T20:21:45.284-07:00' },
    id: 5286307,
    ctx: 'conn33',
    user: 'usuario_inexistente',
    client: '127.0.0.1:64325',
    error: 'UserNotFound: Could not find user "usuario_inexistente" for db "comercial"',
    result: 11,
    app: undefined
  },
  {
    t: { '$date': '2026-11-16T20:21:45.285-07:00' },
    id: 5286307,
    ctx: 'conn33',
    user: 'usuario_inexistente',
    client: '127.0.0.1:64325',
    error: 'UserNotFound: Could not find user "usuario_inexistente" for db "comercial"',
    result: 11,
    app: undefined
  }
]
```

## 3. Último acceso exitoso de la aplicación

```js
bitacora().filter(e => e.msg === "Successfully authenticated" && e.attr?.user === "app_ventas").slice(-1).map(e => ({ t: e.t, id: e.id, ctx: e.ctx, client: e.attr?.client, result: e.attr?.result, app: e.attr?.doc?.application?.name }))
```

Salida:

```js
[
  { t: { '$date': '2026-11-16T19:30:26.206-07:00' }, id: 5286306, ctx: 'conn28',
    client: '127.0.0.1:64064', result: 0, app: undefined }
]
```

## Respuestas

**1. ¿Qué campo distingue un acceso fallido de uno exitoso?**
El mensaje (`msg`): `Failed to authenticate` frente a `Successfully authenticated`. También cambian el `id` (5286307 frente a 5286306) y `attr.result`: `0` es éxito y un valor distinto de cero es fallo (18 y 11 en esta práctica). Los fallos además traen `attr.error` con el motivo.

**2. ¿Qué diferencia hay entre el error de contraseña incorrecta y el de usuario inexistente? ¿Por qué el cliente recibe el mismo mensaje en ambos casos?**
Contraseña incorrecta: `AuthenticationFailed: SCRAM authentication failed, storedKey mismatch` (`result: 18`). Usuario inexistente: `UserNotFound: Could not find user "usuario_inexistente" for db "comercial"` (`result: 11`). El cliente recibe en ambos casos `Authentication failed.` para evitar la enumeración de usuarios: si el mensaje fuera distinto, un atacante podría descubrir qué cuentas existen. El detalle queda solo en la bitácora del servidor.

**3. ¿Por qué el nombre de la aplicación del intento fallido es `mongosh 2.10.0` y no `app-ventas-web`?**
En mi ejecución no pude comprobarlo con ese campo: en MongoDB 8.0.6 los eventos de autenticación no incluyen `attr.doc.application.name`, y la consulta devolvió `app: undefined`.