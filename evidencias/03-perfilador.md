# Actividad 3


## 1. Activación del nivel 2 Terminal A, sesión DBA

Comandos:

```js
db.setProfilingLevel(2)
db.getProfilingStatus()
```

Salida:

```
comercial> db.setProfilingLevel(2)
| db.getProfilingStatus()
{ was: 2, slowms: 100, sampleRate: 1, ok: 1 }
```

`setProfilingLevel` devuelve en `was` el nivel anterior al cambio, por eso la segunda llamada es la que muestra el nivel vigente.

## 2. Operaciones ejecutadas por la aplicación (Terminal B)

Sesión: `mongosh "mongodb://app_ventas:<REDACTED>@127.0.0.1:27017/comercial?appName=app-ventas-web"`

```js
db.clientes.find({ ciudad: "Culiacán" }, { nombre: 1, ciudad: 1 }).toArray();
db.clientes.updateOne({ _id: 3 }, { $set: { rfc: "GAMA780912XYZ" } });
db.clientes.deleteOne({ _id: 2 });
```

## 3. Consulta a `system.profile` Terminal A

```js
db.system.profile.find(
  { ns: "comercial.clientes" },
  { op: 1, ns: 1, command: 1, user: 1, client: 1, appName: 1, ts: 1, millis: 1, nreturned: 1, docsExamined: 1, nModified: 1, ndeleted: 1 }
).sort({ ts: 1 })
```

Salida:

```js
[
  {
    op: 'query',
    ns: 'comercial.clientes',
    command: {
      find: 'clientes',
      filter: { ciudad: 'Culiacán' },
      projection: { nombre: 1, ciudad: 1 },
      lsid: { id: UUID('4cb552eb-cf1c-49d3-9dc0-892d364fe944') },
      '$db': 'comercial'
    },
    docsExamined: 5,
    nreturned: 3,
    millis: 0,
    ts: ISODate('2026-11-17T03:01:41.076Z'),
    client: '127.0.0.1',
    appName: 'app-ventas-web',
    user: 'app_ventas@comercial'
  },
  {
    op: 'update',
    ns: 'comercial.clientes',
    command: {
      q: { _id: 3 },
      u: { '$set': { rfc: 'GAMA780912XYZ' } },
      multi: false,
      upsert: false
    },
    docsExamined: 1,
    nModified: 1,
    millis: 0,
    ts: ISODate('2026-11-17T03:01:41.078Z'),
    client: '127.0.0.1',
    appName: 'app-ventas-web',
    user: 'app_ventas@comercial'
  },
  {
    op: 'remove',
    ns: 'comercial.clientes',
    command: { q: { _id: 2 }, limit: 1 },
    docsExamined: 1,
    ndeleted: 1,
    millis: 0,
    ts: ISODate('2026-11-17T03:01:41.080Z'),
    client: '127.0.0.1',
    appName: 'app-ventas-web',
    user: 'app_ventas@comercial'
  }
]
```

## 9.1 Interpretar los documentos

| # | op | Usuario | Cliente | Aplicación | Momento (UTC) | Qué hizo | Documentos afectados |
|---|----|---------|---------|------------|---------------|----------|----------------------|
| 1 | query | app_ventas@comercial | 127.0.0.1 | app-ventas-web | 2026-11-17T03:01:41.076Z | `find` con filtro `ciudad: "Culiacán"` y proyección de `nombre` y `ciudad` | 5 examinados, 3 devueltos |
| 2 | update | app_ventas@comercial | 127.0.0.1 | app-ventas-web | 2026-11-17T03:01:41.078Z | `$set` de `rfc: "GAMA780912XYZ"` en `_id: 3` | 1 examinado, 1 modificado |
| 3 | remove | app_ventas@comercial | 127.0.0.1 | app-ventas-web | 2026-11-17T03:01:41.080Z | Eliminó el documento `_id: 2` | 1 examinado, 1 eliminado |

## Respuestas

**1. ¿Puedes saber cuál era el RFC antes del cambio con la información de `system.profile`?**
No. El documento del perfilador guarda el comando ejecutado (`$set` con el valor nuevo `GAMA780912XYZ`), pero no la imagen previa del documento. Solo se sabe que se modificó 1 documento (`nModified: 1`).

**2. ¿Puedes saber qué datos tenía el documento eliminado?**
No. El registro `remove` solo conserva el filtro `{ _id: 2 }` y `ndeleted: 1`. No guarda el contenido del documento borrado.

**3. A diferencia de `log_statement = 'mod'` en PostgreSQL, el nivel 2 sí registró la consulta. ¿Qué ventaja y qué riesgo tiene eso?**
*Ventaja:* da visibilidad de las lecturas (quién consultó qué y cuándo), útil para detectar accesos a datos sensibles.
*Riesgos:* (a) costo de desempeño y de disco, sobre todo en nivel 2; (b) `system.profile` es una colección limitada de 1 MB, así que se llena rápido y sobrescribe evidencia antigua sin aviso; (c) los filtros y valores de las operaciones, que pueden contener datos personales, se copian a otra colección con acceso y retención distintos.

**4. ¿Por qué el campo `user` incluye `@comercial`?**
En MongoDB un usuario se identifica por nombre más la base de datos donde se definió. `app_ventas@comercial` se autenticó contra la base `comercial`; un usuario con el mismo nombre en otra base sería una cuenta distinta.
