# Actividad 1

## Evidencia
```
comercial> db.version()
8.0.6
comercial> db.adminCommand({ buildInfo: 1 }).modules
[]
comercial> db.serverCmdLineOpts().parsed
{
  config: 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.cfg',
  net: { bindIp: '127.0.0.1', port: 27017 },
  security: { authorization: 'enabled' },
  service: true,
  storage: { dbPath: 'C:\\Program Files\\MongoDB\\Server\\8.0\\data' },
  systemLog: {
    destination: 'file',
    logAppend: true,
    path: 'C:\\Program Files\\MongoDB\\Server\\8.0\\log\\mongod.log'
  }
}
comercial> db.serverCmdLineOpts().parsed.systemLog
{
  destination: 'file',
  logAppend: true,
  path: 'C:\\Program Files\\MongoDB\\Server\\8.0\\log\\mongod.log'
}
```

## Respuestas

1. **¿Qué edición estás usando? ¿Qué evidencia lo demuestra?**
MongoDB Community Edition 8.0.6. `db.adminCommand({buildInfo:1}).modules` devuelve `[]`; en Enterprise incluiría "enterprise". Además, `serverCmdLineOpts().parsed` no contiene ninguna opción `auditLog`.

2. **¿A dónde escribe tu servidor su bitácora? ¿Cómo lo sé?**
A un archivo: `C:\Program Files\MongoDB\Server\8.0\log\mongod.log`. Lo sé porque `db.serverCmdLineOpts().parsed.systemLog` muestra `destination: 'file'` y esa ruta en `path`.

3. **Según REF-U3-04, ¿qué cuatro categorías de eventos registraría la auditoría nativa?**
   - Cambios de esquema (DDL).
   - Eventos de conjuntos de réplicas y clústeres fragmentados.
   - Autenticación y autorización.
   - Operaciones CRUD (requiere `auditAuthorizationSuccess: true`).

4. **¿Qué tendría que evaluar una organización antes de licenciar Enterprise o migrar a Atlas solo para obtener auditoría?**
Costo de licencia o de un clúster Atlas M10 o superior; esfuerzo y riesgo de migración; impacto en desempeño de la auditoría; volumen, almacenamiento y retención de los registros; qué eventos se necesitan realmente y con qué filtros; integración con un SIEM; requisitos regulatorios; y si bastarían controles compensatorios.