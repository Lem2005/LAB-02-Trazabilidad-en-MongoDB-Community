# Actividad 8


## 1. Estado antes del reinicio

```js
bitacora().length
db.system.profile.countDocuments()
```

Salida: `331` y `2`.

## 2. Exportación

```js
require('fs').writeFileSync('evidencias/system-profile.json', EJSON.stringify(db.system.profile.find({}, { op: 1, ns: 1, user: 1, client: 1, appName: 1, ts: 1, "command.q": 1, "command.u": 1 }).toArray(), null, 2))
require('fs').writeFileSync('evidencias/bitacora-mongod.log', db.adminCommand({ getLog: "global" }).log.join("\n"))
```

Archivos generados:

Name                              Length
----                              ------
system-profile.json                  599
bitacora-mongod.log               125940
mongod-archivo-completo.log    246567864   

- `evidencias/system-profile.json`
- `evidencias/bitacora-mongod.log` 
- `evidencias/mongod-archivo-completo.log` 

## 3. Hashes SHA-256

```powershell
Get-FileHash evidencias\system-profile.json, evidencias\bitacora-mongod.log, evidencias\mongod-archivo-completo.log -Algorithm SHA256 | Format-List > evidencias\hashes.sha256
```

system-profile.json            833EDA96CD018AF5B8283CEEB4B175A7028979688460C64D93CC9D1C76E331D9
bitacora-mongod.log            0DAEBD842FB9E86A77C517A061992EE72BEF46AFD8CE4F722A31BE69D92C4FDA
mongod-archivo-completo.log    74A8CD3F4F0F06A1687278C3D87412FDB93A872C67F08D150CC01C5C92B088E1

## 4. Reinicio del servicio

```powershell
Restart-Service MongoDB
```

## 5. Estado después del reinicio

```js
db.getProfilingStatus()
db.system.profile.countDocuments()
bitacora().length
```

Salida:

```js
{ was: 0, slowms: 100, sampleRate: 1, ok: 1 }
2
81
```

| Comprobación | Antes | Después |
|---|---|---|
| Nivel del perfilador | filtro activo (nivel 1) | 0 |
| Documentos en `system.profile` | 2 | 2 |
| Eventos en `getLog` | 331 | 81 |

## Respuestas

**1. Tres formas en que la evidencia puede perderse sin que nadie la borre deliberadamente.**
`system.profile` es una colección limitada de 1 MB: al llenarse, sobrescribe los documentos más antiguos.  Al reiniciar el servidor, el perfilador vuelve a nivel 0 se deja de registrar y la memoria de `getLog` se vacía, como se observó: 331 eventos antes y 81 después.  `getLog` solo conserva los 1024 eventos más recientes, así que la actividad nueva desplaza a la anterior.

**2. ¿Por qué el tamaño de 1 MB de `system.profile` es un problema de conservación y no solo de espacio?**
Porque con 1 MB, y más aún en nivel 2, la evidencia de un incidente puede sobrescribirse en minutos u horas, en silencio y sin ninguna ventana de retención garantizada. 

**3. ¿Por qué `getLog` sirve para interpretar pero no para conservar?**
Porque solo guarda los 1024 eventos más recientes, en memoria, sin mecanismo de integridad, y se vacía al reiniciar.
