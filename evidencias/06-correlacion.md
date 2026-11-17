# Actividad 6

## 1. Cambios de configuración del perfilador

```js
bitacora().filter(e => e.msg === "Profiler settings changed").map(e => ({ t: e.t, ctx: e.ctx, msg: e.msg, attr: e.attr }))
```

Salida:

```js
[
  {
    t: { '$date': '2026-11-16T19:58:44.835-07:00' },
    ctx: 'conn22',
    msg: 'Profiler settings changed',
    attr: {
      from: { level: 0, slowms: 100, sampleRate: 1 },
      to: { level: 2, slowms: 100, sampleRate: 1 },
      db: 'comercial'
    }
  },
  {
    t: { '$date': '2026-11-16T20:13:20.026-07:00' },
    ctx: 'conn22',
    msg: 'Profiler settings changed',
    attr: {
      from: { level: 2, slowms: 100, sampleRate: 1 },
      to: { level: 0, slowms: 100, sampleRate: 1 },
      db: 'comercial'
    }
  },
  {
    t: { '$date': '2026-11-16T20:13:20.036-07:00' },
    ctx: 'conn22',
    msg: 'Profiler settings changed',
    attr: {
      from: { level: 0, slowms: 100, sampleRate: 1 },
      to: {
        level: 1,
        slowms: 100,
        sampleRate: 1,
        filter: { op: { '$in': [ 'insert', 'remove', 'update' ] } }
      },
      db: 'comercial'
    }
  }
]
```

## 2. Autenticación de la misma conexión

```js
bitacora().filter(e => e.ctx === "conn22" && e.msg === "Successfully authenticated").map(e => ({ t: e.t, ctx: e.ctx, user: e.attr?.user, db: e.attr?.db, client: e.attr?.client }))
```

Salida:

```js
[
  {
    t: { '$date': '2026-11-16T19:28:38.759-07:00' },
    ctx: 'conn22',
    user: 'admin',
    db: 'admin',
    client: '127.0.0.1:65446'
  }
]
```

## Respuestas

**1. ¿Qué usuario cambió la configuración del perfilador? ¿Qué dos eventos lo demuestran?**
El usuario `admin`. Lo demuestran: los eventos `Profiler settings changed` en `conn22` y el evento `Successfully authenticated` de `admin` en esa misma `conn22`, ocurrido antes de los cambios.

**2. ¿Qué condición debe cumplirse para que esta correlación sea válida?**
Que el servidor no se haya reiniciado entre ambos eventos, porque los números de conexión vuelven a empezar y se reutilizan, y un mismo `connN` podría pertenecer a otra sesión. También que el evento de autenticación siga disponible en el archivo de bitácora y que esa conexión no se haya reautenticado con otro usuario.

**3. ¿Por qué es relevante que quede registrado un cambio de configuración del propio mecanismo de registro?**
Porque quien apaga o filtra el perfilador puede ocultar su actividad posterior. Saber quién lo cambió, cuándo y de qué nivel a cuál permite detectar manipulación de la evidencia. Aquí se ve que a las 20:13:20 el perfilado pasó de registrar todo a registrar solo modificaciones.
