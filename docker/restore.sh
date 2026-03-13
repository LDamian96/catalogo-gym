#!/bin/bash
# ============================================================
# Database Restore Script
# Restaura una base de datos desde un archivo de backup.
#
# Uso: ./docker/restore.sh <archivo_backup>
# Ejemplo: ./docker/restore.sh backups/backup_20260310_020000.sql.gz
# ============================================================

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Uso: $0 <archivo_backup>"
    echo "Ejemplo: $0 backups/backup_20260310_020000.sql.gz"
    echo ""
    echo "Backups disponibles:"
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
    ls -lh "$PROJECT_DIR/backups"/backup_*.sql.gz 2>/dev/null || echo "  (ninguno)"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Archivo no encontrado: $BACKUP_FILE"
    exit 1
fi

echo "============================================"
echo "RESTAURACION DE BASE DE DATOS"
echo "============================================"
echo "Archivo: $BACKUP_FILE"
echo ""
echo "ADVERTENCIA: Esto reemplazara TODOS los datos actuales."
read -p "Continuar? (si/no): " CONFIRM

if [ "$CONFIRM" != "si" ]; then
    echo "Restauracion cancelada."
    exit 0
fi

echo ""
echo "[$(date)] Iniciando restauracion..."

# Descomprimir y restaurar dentro del contenedor
if gunzip -c "$BACKUP_FILE" | docker exec -i cat_db psql -U "$DB_USER" -d "$DB_NAME" --single-transaction --set ON_ERROR_STOP=on; then
    echo "[$(date)] Restauracion exitosa desde: $BACKUP_FILE"
else
    echo "[$(date)] ERROR: Fallo la restauracion"
    exit 1
fi

echo "============================================"
echo "[$(date)] Restauracion completada"
echo "============================================"
