# FIAX

Frontend operativo para administracion y previsualizacion de CFDI 4.0.

## Ejecutar

```powershell
bun run serve.ts
```

La app queda disponible en `http://localhost:8888/`.

## Probar

```powershell
bun test
```

La suite cubre:

- bloqueo de path traversal del servidor Bun;
- normalizacion del modelo CFDI usado por formulario, validacion y PDF;
- persistencia demo por DAL;
- rechazo explicito de timbrado si no existe backend fiscal configurado.

## Configuracion productiva

Los CDN externos se mantienen en `index.html`. La configuracion runtime vive en `js/fiax_config.js`:

- `pocketbase_url`: URL de PocketBase. Si queda vacio, usa `http://127.0.0.1:8090`.
- `fiscal_backend_url`: endpoint backend para `stamp`, `send` y `cancel`.
- `allow_admin_wipe`: debe permanecer `false` salvo en mantenimiento controlado.

Sin `fiscal_backend_url`, FIAX permite capturar, guardar y validar localmente, pero no simula timbrado, envio ni cancelacion fiscal.

## Sincronizar UI comun

`copy.py` es dry-run por defecto:

```powershell
python copy.py
python copy.py --apply
```

Usa `--replace` solo si quieres reemplazar directorios sincronizados completos.
