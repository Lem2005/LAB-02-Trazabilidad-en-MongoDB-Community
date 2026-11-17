# Actividad 4

## 1. Aplicar el filtro Terminal A, sesión DBA


```js
db.setProfilingLevel(0)
db.system.profile.drop()
db.setProfilingLevel(1, { filter: { op: { $in: ["insert", "update", "remove"] } } })
db.getProfilingStatus()
```

Salida:

```js
{
  was: 1,
  slowms: 100,
  sampleRate: 1,
  filter: { op: { '$in': [ 'insert', 'remove', 'update' ] } },
  note: 'When a filter expression is set, slowms and sampleRate are not used for profiling and slow-query log lines.',
  ok: 1
}
```

## 2. Operaciones de la aplicación Terminal B

Sesión: `mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial?appName=app-ventas-web"`

```js
db.clientes.find({ _id: 1 }).toArray(); db.clientes.updateOne({ _id: 1 }, { $set: { telefono: "6670000000" } })
```

Salida:

```js
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}
```

## 3. Consulta a `system.profile` Terminal A

```js
db.system.profile.find({}, { op: 1, ns: 1, user: 1, appName: 1, "command.q": 1, "command.u": 1, ts: 1 })
```

Salida:

```js
[
  {
    op: 'update',
    ns: 'comercial.clientes',
    command: { q: { _id: 1 }, u: { '$set': { telefono: '6670000000' } } },
    ts: ISODate('2026-11-17T03:13:40.168Z'),
    appName: 'app-ventas-web',
    user: 'app_ventas@comercial'
  }
]
```

Solo aparece la operación `update` La consulta `find` no se registró.

## Respuestas

**1. ¿Qué perdiste de evidencia al aplicar el filtro? ¿Qué ganaste?**
Perdí: el registro de las lecturas (como el `find`) y de cualquier operación fuera de insert, update y remove. Ya no puedo saber quién consultó datos sensibles. Tampoco se registran comandos administrativos que no encajen en ese filtro.
Gané: menos volumen y menos impacto en el desempeño. Además, como `system.profile` es una colección limitada de 1 MB, la evidencia de las modificaciones se conserva más tiempo antes de ser sobrescrita.

**2. ¿Qué filtro usarías si solo interesaran operaciones sobre la colección `clientes`?**

```js
db.setProfilingLevel(1, { filter: { ns: "comercial.clientes" } })
```

