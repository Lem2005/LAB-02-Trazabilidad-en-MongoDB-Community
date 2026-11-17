# LAB-02 — Trazabilidad en MongoDB Community

**Materia:** Gestión de Seguridad y Desempeño de Bases de Datos
**Unidad:** III
**Grupo:** 4-4
**Autor:** Luis Enrique Millan Inzunza
**Fecha de ejecución:** 2026-11-16

## Despliegue

| Dato | Valor |
|---|---|
| Motor | MongoDB Community Edition |
| Versión del servidor | 8.0.6 (`db.version()`) |
| Versión de mongosh | 2.8.3 |
| Forma de despliegue | Instalación nativa (instalador MSI) |
| Sistema operativo | Windows |
| Servicio | `MongoDB` (reinicio con `Restart-Service MongoDB` en PowerShell como administrador) |
| Archivo de configuración | `C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg` |
| Archivo de bitácora | `C:\Program Files\MongoDB\Server\8.0\log\mongod.log` |
| Directorio de datos | `C:\Program Files\MongoDB\Server\8.0\data` |
| Dirección y puerto | `127.0.0.1:27017` |

**Edición:** Community. Se verificó con `db.adminCommand({ buildInfo: 1 }).modules`, que devolvió `[]`. En Enterprise incluiría `"enterprise"`.

**Configuración modificada.** Se descomentó la sección `security` de `mongod.cfg` y se dejó:

```yaml
security:
  authorization: enabled
```

No se configuró `operationProfiling`, por lo que el perfilador se activó solo con `db.setProfilingLevel()` (temporal, no persiste tras reiniciar).

## Nota sobre la versión

La guía del laboratorio está escrita para MongoDB 7. Se ejecutó en 8.0.6. Los resultados fueron equivalentes, con una diferencia relevante: en esta versión los eventos de autenticación de la bitácora no incluyeron `attr.doc.application.name`.

## Contenido

```
LAB-02/
├── README.md
├── informe.md
├── evidencias/
│   ├── 01-edicion-y-limitacion.md
│   ├── 02-incidente-sin-perfilado.md
│   ├── 03-perfilador.md
│   ├── 04-filtro.md
│   ├── 05-accesos-mongod.md
│   ├── 06-correlacion.md
│   ├── 07-privilegios-control-compensatorio.md
│   ├── 08-conservacion.md
│   ├── 09-comparacion.md
│   ├── 10-respuesta-direccion.md
│   ├── system-profile.json
│   ├── bitacora-mongod.log
│   ├── mongod-archivo-completo.log
│   └── hashes.sha256
└── scripts/
    └── comandos-mongosh.js
```

## Resumen de resultados

- MongoDB Community **no tiene auditoría nativa**; lo demuestra `modules: []` y la ausencia de `auditLog` en `serverCmdLineOpts()`.
- El perfilador registra quién (`user`), desde dónde (`client`, `appName`) y cuándo (`ts`), pero no guarda el valor anterior.
- La bitácora de `mongod` registra accesos exitosos y fallidos, y los cambios de configuración del perfilador (el autor se obtiene correlacionando `ctx`).
- Los cambios de privilegios no dejaron rastro; solo se detectaron con instantáneas, un control compensatorio que **no** equivale a auditoría.
- La evidencia exportada tiene hash SHA-256 en `evidencias/hashes.sha256`.


