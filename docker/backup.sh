#!/bin/bash
# ============================================================
# Database Backup Script
# Ejecuta pg_dump dentro del contenedor cat_db y guarda
# backups comprimidos con gzip. Mantiene los ultimos 7 dias.
#
# Uso: ./docker/backup.sh
# Cron (diario a las 2am):
#   0 2 * * * /ruta/al/proyecto/docker/backup.sh >> /ruta/al/proyecto/backups/backup.log 2>&1
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"
KEEP_DAYS=7

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "============================================"
echo "[$(date)] Iniciando backup de base de datos..."
echo "============================================"

# Ejecutar pg_dump dentro del contenedor y comprimir
if docker exec cat_db pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$BACKUP_DIR/$BACKUP_FILE"; then
    FILE_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup exitoso: $BACKUP_FILE ($FILE_SIZE)"
else
    echo "[$(date)] ERROR: Fallo al crear backup"
    # Eliminar archivo vacio/corrupto si existe
    rm -f "$BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

# Eliminar backups mas antiguos de KEEP_DAYS dias
echo "[$(date)] Limpiando backups antiguos (mas de $KEEP_DAYS dias)..."
DELETED=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$KEEP_DAYS -print -delete | wc -l)
echo "[$(date)] Backups eliminados: $DELETED"

# Mostrar backups actuales
echo "[$(date)] Backups disponibles:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "  (ninguno)"
echo "============================================"
echo "[$(date)] Backup completado"
echo "============================================"
