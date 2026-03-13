# Automatizaciones n8n para Catalogo SaaS

## Workflows incluidos

### 01 - Chatbot WhatsApp
Recibe mensajes de clientes por WhatsApp (via Evolution API), consulta el catalogo de productos y responde con recomendaciones usando IA (Claude/OpenAI). Incluye precios, descripciones y links directos a productos.

### 02 - Registro de productos por WhatsApp
Permite a un administrador crear productos enviando una imagen + texto por WhatsApp. La IA extrae nombre, precio, categoria y descripcion del texto, y sube el producto al catalogo automaticamente.

### 03 - Importacion masiva desde Excel/Google Sheets
Recibe un archivo Excel, CSV o Google Sheet y crea productos masivamente. La IA normaliza y limpia los datos antes de enviarlos al API.

### 04 - Generador automatico de SEO
Ejecuta diariamente (o bajo demanda) y detecta productos sin SEO. Genera sugerencias de titulo, descripcion y keywords usando IA, y las envia al admin por WhatsApp para su aprobacion antes de aplicarlas.

### 05 - Alertas de stock bajo
Revisa cada 6 horas si hay productos con stock bajo (< 5 unidades) y envia alertas al admin por WhatsApp.

---

## Configuracion de n8n (Self-hosted con Docker)

### Requisitos previos
- Docker y Docker Compose instalados
- El backend del catalogo corriendo en la red `cat_network`
- Cuenta de Evolution API para WhatsApp Business
- API key de OpenAI o Anthropic (Claude)

### Instalacion

1. Copiar el archivo `docker-compose.n8n.yml` al directorio del proyecto
2. Configurar las variables de entorno (ver seccion de variables)
3. Levantar el servicio:

```bash
cd n8n
docker compose -f docker-compose.n8n.yml up -d
```

4. Acceder a n8n en `http://localhost:5678`
5. Crear usuario administrador en el primer acceso

### Importar workflows

1. Abrir n8n en el navegador (`http://localhost:5678`)
2. Ir a **Settings > Community Nodes** e instalar:
   - `@n8n/n8n-nodes-langchain` (si no viene preinstalado)
3. Para cada workflow:
   - Click en **Add Workflow** (o `Ctrl+O`)
   - Click en los 3 puntos `...` > **Import from file**
   - Seleccionar el archivo JSON de la carpeta `workflows/`
   - Configurar las credenciales requeridas (ver abajo)
   - Activar el workflow

---

## Credenciales requeridas

### 1. Catalog API (HTTP Header Auth)
- **Tipo:** Header Auth
- **Name:** `Authorization`
- **Value:** `Bearer <JWT_TOKEN>`
- El token se obtiene haciendo POST a `/api/v1/auth/login` con email y password de admin
- Los workflows 01-chatbot y 05-stock-alerts usan el endpoint publico `/api/v1/catalog` y no requieren autenticacion

### 2. Evolution API (WhatsApp)
- **Base URL:** URL de tu instancia de Evolution API (ej: `https://evo.tudominio.com`)
- **API Key:** La API key de tu instancia de Evolution API
- **Instance Name:** Nombre de la instancia de WhatsApp configurada
- Documentacion: https://doc.evolution-api.com

### 3. OpenAI / Anthropic API
- **Tipo:** API Key
- **OpenAI:** Obtener en https://platform.openai.com/api-keys
- **Anthropic (Claude):** Obtener en https://console.anthropic.com
- Se usa en los nodos de IA para generar respuestas y procesar texto

### 4. Google Sheets (opcional, para workflow 03 y 04)
- **Tipo:** OAuth2
- Configurar en Google Cloud Console
- Necesario solo si usas Google Sheets como fuente de datos

---

## Variables de entorno

Crear un archivo `.env` en la carpeta `n8n/` con las siguientes variables:

```env
# n8n
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=tu_password_seguro
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
WEBHOOK_URL=https://tu-dominio.com/n8n/

# Timezone
GENERIC_TIMEZONE=America/Lima
TZ=America/Lima

# Base de datos para n8n (SQLite por defecto, o PostgreSQL)
# DB_TYPE=postgresdb
# DB_POSTGRESDB_HOST=db
# DB_POSTGRESDB_PORT=5432
# DB_POSTGRESDB_DATABASE=n8n
# DB_POSTGRESDB_USER=catalogo
# DB_POSTGRESDB_PASSWORD=catalogo123

# Catalogo API
CATALOG_API_URL=http://cat_backend:3000/api/v1
CATALOG_ADMIN_EMAIL=admin@catalogo.com
CATALOG_ADMIN_PASSWORD=tu_password

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://evo.tudominio.com
EVOLUTION_API_KEY=tu_api_key
EVOLUTION_INSTANCE=catalogo-whatsapp

# Numero de admin para recibir alertas (con codigo de pais)
ADMIN_PHONE=51999999999

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# Anthropic (alternativa)
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

---

## Notas importantes

- Los workflows usan **Evolution API** como puente para WhatsApp Business. Asegurate de tener una instancia activa y conectada.
- El webhook de Evolution API debe apuntar a la URL de n8n: `https://tu-dominio.com/webhook/whatsapp-chatbot` (o la ruta correspondiente).
- Para produccion, configura HTTPS con un reverse proxy (Nginx/Caddy) frente a n8n.
- Los workflows de SEO NO auto-publican cambios. Siempre pasan por aprobacion del admin.
- Todos los nodos de IA tienen configurado un system prompt en espanol orientado al mercado peruano/latinoamericano.
