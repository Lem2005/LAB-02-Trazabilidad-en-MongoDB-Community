# Actividad 1

## Evidencia
```
comercial> db.system.profile.countDocuments()
0
comercial> bitacora().filter(e => JSON.stringify(e).includes("GAMA780912XXX")).length
0

comercial> db.clientes.updateOne({ _id: 3 }, { $set: { rfc: "GAMA780912XXX" } })
{
  acknowledged: true,
  insertedId: null,
  matchedCount: 1,
  modifiedCount: 1,
  upsertedCount: 0
}

comercial> bitacora().filter(e => e.c === "ACCESS").map(e => ({ t: e.t, ctx: e.ctx, msg: e.msg, user: e.attr && e.attr.user }))
[
  {
    t: { '$date': '2026-11-16T19:22:38.322-07:00' },
    ctx: 'conn1',
    msg: 'note: no users configured in admin.system.users, allowing localhost access',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:22:38.424-07:00' },
    ctx: 'conn4',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:22:38.424-07:00' },
    ctx: 'conn2',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:22:38.424-07:00' },
    ctx: 'conn5',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:22:38.524-07:00' },
    ctx: 'conn5',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:23:46.106-07:00' },
    ctx: 'conn5',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:23:52.145-07:00' },
    ctx: 'conn2',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:23:56.383-07:00' },
    ctx: 'conn2',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:24:10.154-07:00' },
    ctx: 'conn2',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:24:40.066-07:00' },
    ctx: 'conn5',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:24:52.866-07:00' },
    ctx: 'conn5',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:25:34.735-07:00' },
    ctx: 'conn8',
    msg: 'Supported SASL mechanisms requested for unknown user',
    user: { user: 'admin', db: 'admin' }
  },
  {
    t: { '$date': '2026-11-16T19:25:34.735-07:00' },
    ctx: 'conn8',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:25:34.736-07:00' },
    ctx: 'conn8',
    msg: 'Failed to authenticate',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:25:34.738-07:00' },
    ctx: 'conn8',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:25:34.738-07:00' },
    ctx: 'conn8',
    msg: 'Failed to authenticate',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:25:59.838-07:00' },
    ctx: 'conn10',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:25:59.840-07:00' },
    ctx: 'conn10',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:25:59.841-07:00' },
    ctx: 'conn12',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:25:59.919-07:00' },
    ctx: 'conn12',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:26:15.350-07:00' },
    ctx: 'conn12',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:26:19.163-07:00' },
    ctx: 'conn12',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:26:54.302-07:00' },
    ctx: 'conn11',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:27:34.004-07:00' },
    ctx: 'conn15',
    msg: 'Supported SASL mechanisms requested for unknown user',
    user: { user: 'admin', db: 'admin' }
  },
  {
    t: { '$date': '2026-11-16T19:27:34.004-07:00' },
    ctx: 'conn15',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:27:34.004-07:00' },
    ctx: 'conn15',
    msg: 'Failed to authenticate',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:27:34.005-07:00' },
    ctx: 'conn15',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:27:34.005-07:00' },
    ctx: 'conn15',
    msg: 'Failed to authenticate',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:28:00.288-07:00' },
    ctx: 'conn17',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:28:00.299-07:00' },
    ctx: 'conn17',
    msg: 'Successfully authenticated',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:28:11.048-07:00' },
    ctx: 'conn19',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:28:11.048-07:00' },
    ctx: 'conn19',
    msg: 'Successfully authenticated',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:28:38.736-07:00' },
    ctx: 'conn21',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:28:38.744-07:00' },
    ctx: 'conn21',
    msg: 'Successfully authenticated',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:28:38.758-07:00' },
    ctx: 'conn22',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:28:38.758-07:00' },
    ctx: 'conn23',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:28:38.759-07:00' },
    ctx: 'conn22',
    msg: 'Successfully authenticated',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:28:38.760-07:00' },
    ctx: 'conn23',
    msg: 'Successfully authenticated',
    user: 'admin'
  },
  {
    t: { '$date': '2026-11-16T19:30:26.184-07:00' },
    ctx: 'conn26',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:30:26.193-07:00' },
    ctx: 'conn26',
    msg: 'Successfully authenticated',
    user: 'app_ventas'
  },
  {
    t: { '$date': '2026-11-16T19:30:26.203-07:00' },
    ctx: 'conn26',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:30:26.204-07:00' },
    ctx: 'conn26',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:30:26.205-07:00' },
    ctx: 'conn27',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:30:26.205-07:00' },
    ctx: 'conn28',
    msg: 'Auth metrics report',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:30:26.206-07:00' },
    ctx: 'conn27',
    msg: 'Successfully authenticated',
    user: 'app_ventas'
  },
  {
    t: { '$date': '2026-11-16T19:30:26.206-07:00' },
    ctx: 'conn28',
    msg: 'Successfully authenticated',
    user: 'app_ventas'
  },
  {
    t: { '$date': '2026-11-16T19:30:26.207-07:00' },
    ctx: 'conn28',
    msg: 'Checking authorization failed',
    user: undefined
  },
  {
    t: { '$date': '2026-11-16T19:30:26.296-07:00' },
    ctx: 'conn28',
    msg: 'Checking authorization failed',
    user: undefined
  }
]
comercial> bitacora().filter(e => e.ctx === "conn29").map(e => ({ t: e.t, c: e.c, msg: e.msg, user: e.attr && e.attr.user }))
[
  {
    t: { '$date': '2026-11-16T19:30:36.701-07:00' },
    c: 'NETWORK',
    msg: 'client metadata',
    user: undefined
  }
]
```

## Respuestas

1. **¿Puedes demostrar qué cambió? ¿Y quién se conectó a esa hora?**
No puedo demostrar qué cambió: `system.profile` tiene 0 documentos y el valor nuevo `GAMA780912XXX` no aparece en ninguna línea de la bitácora. Sí puedo demostrar que desde la aplicación `app-ventas-web` hubo conexiones a esa hora (conn25 a conn29, a las 19:30 hora local), pero eso no prueba cuál de ellas ejecutó el cambio ni qué hizo.

2. **¿Por qué mongosh abre varias conexiones? ¿Cuál se autentica?**
mongosh abre varias conexiones al servidor para una sola sesión: en mi caso conn25 a conn29. conn25 solo registró `client metadata` y no se autenticó. conn26, conn27 y conn28 muestran `Successfully authenticated` como `app_ventas` en 19:30:26. Por tanto, en mi versión se autentica más de una conexión, no solo una. Los eventos de la bitácora no indican cuál ejecutó el `updateOne:` registran la conexión y la autenticación, no las operaciones.