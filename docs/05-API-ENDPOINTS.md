# API Endpoints - Documentación Completa

## Base URL
```
Development: http://localhost:3001/api/v1
Production:  https://api.tudominio.com/api/v1
```

## Convenciones

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer <token>  (rutas protegidas)
```

### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Mensaje descriptivo",
    "details": [
      { "field": "name", "message": "El nombre es requerido" }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔐 AUTH - Autenticación

### POST /auth/login
Iniciar sesión
```
Acceso: Público
Rate Limit: 5 intentos por minuto
```

**Request:**
```json
{
  "email": "admin@catalogo.com",
  "password": "contraseña123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123...",
      "email": "admin@catalogo.com",
      "name": "Administrador",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Errores:**
- `401` - Credenciales inválidas
- `429` - Demasiados intentos

---

### POST /auth/refresh
Renovar access token
```
Acceso: Público (requiere refresh token)
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### POST /auth/logout
Cerrar sesión (invalida refresh token)
```
Acceso: Protegido (Admin)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada correctamente"
  }
}
```

---

### GET /auth/me
Obtener usuario actual
```
Acceso: Protegido (Admin)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "email": "admin@catalogo.com",
    "name": "Administrador",
    "role": "ADMIN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## ⚙️ SETTINGS - Configuración del Negocio

### GET /settings
Obtener configuración
```
Acceso: Público (para catálogo) / Protegido (para admin)
Cache: 1 hora
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "main",
    "businessName": "Mi Tienda",
    "logo": "https://cloudinary.com/logo.jpg",
    "logoPublicId": "catalogo/logos/abc123",
    "whatsapp": "+51987654321",
    "currency": "S/",
    "description": "La mejor tienda de ropa",
    "address": "Av. Principal 123",
    "schedule": "Lunes a Sábado 10am - 8pm",
    "cartEnabled": true,
    "welcomeMessage": "¡Hola! Gracias por tu interés",
    "seoTitle": "Mi Tienda - Los mejores productos",
    "seoDescription": "Encuentra los mejores productos en nuestra tienda online",
    "seoKeywords": "tienda,productos,online",
    "ogImage": "https://cloudinary.com/og-image.jpg",
    "ogImagePublicId": "catalogo/og/main",
    "googleAnalyticsId": "G-XXXXXXXXXX",
    "googleTagManagerId": "GTM-XXXXXXX",
    "facebookPixelId": "123456789",
    "tiktokPixelId": null,
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### PATCH /settings
Actualizar configuración
```
Acceso: Protegido (Admin)
Invalida: Cache de settings
```

**Request:**
```json
{
  "businessName": "Mi Tienda Actualizada",
  "whatsapp": "+51987654321",
  "currency": "S/",
  "description": "Nueva descripción",
  "address": "Nueva dirección",
  "schedule": "Lunes a Domingo 9am - 9pm",
  "cartEnabled": true,
  "welcomeMessage": "¡Bienvenido!",
  "seoTitle": "Mi Tienda - Título SEO actualizado",
  "seoDescription": "Descripción SEO actualizada",
  "seoKeywords": "palabras,clave,seo",
  "googleAnalyticsId": "G-NEWID12345",
  "googleTagManagerId": "GTM-NEWID",
  "facebookPixelId": "987654321",
  "tiktokPixelId": "TIKTOK123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "main",
    "businessName": "Mi Tienda Actualizada",
    ...
  }
}
```

---

### POST /settings/logo
Subir/actualizar logo
```
Acceso: Protegido (Admin)
Content-Type: multipart/form-data
Max Size: 2MB
Formatos: jpg, png, webp
```

**Request (FormData):**
```
logo: [archivo de imagen]
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "logo": "https://cloudinary.com/new-logo.jpg",
    "logoPublicId": "catalogo/logos/abc123"
  }
}
```

---

### POST /settings/og-image
Subir/actualizar imagen Open Graph
```
Acceso: Protegido (Admin)
Content-Type: multipart/form-data
Max Size: 2MB
Formatos: jpg, png, webp
Tamaño recomendado: 1200x630px
```

**Request (FormData):**
```
ogImage: [archivo de imagen]
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "ogImage": "https://cloudinary.com/og-image.jpg",
    "ogImagePublicId": "catalogo/og/main"
  }
}
```

---

## 📁 CATEGORIES - Categorías

### GET /categories
Listar categorías
```
Acceso: Protegido (Admin)
Cache: No (admin siempre ve datos frescos)
```

**Query Params:**
```
?includeInactive=true   (incluir inactivas)
?includeProducts=true   (incluir conteo de productos)
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "name": "Blusas",
      "slug": "blusas",
      "image": "https://cloudinary.com/blusas.jpg",
      "order": 1,
      "isActive": true,
      "_count": {
        "products": 15
      }
    },
    {
      "id": "clx456...",
      "name": "Pantalones",
      "slug": "pantalones",
      "image": null,
      "order": 2,
      "isActive": true,
      "_count": {
        "products": 8
      }
    }
  ]
}
```

---

### GET /categories/:id
Obtener categoría por ID
```
Acceso: Protegido (Admin)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "name": "Blusas",
    "slug": "blusas",
    "image": "https://cloudinary.com/blusas.jpg",
    "imagePublicId": "catalogo/categories/abc",
    "order": 1,
    "isActive": true,
    "seoTitle": "Blusas - Las mejores blusas",
    "seoDescription": "Encuentra las mejores blusas en nuestra tienda",
    "seoKeywords": "blusas,ropa,mujer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z"
  }
}
```

---

### POST /categories
Crear categoría
```
Acceso: Protegido (Admin)
Invalida: Cache de categorías
```

**Request:**
```json
{
  "name": "Vestidos",
  "isActive": true,
  "seoTitle": "Vestidos elegantes",
  "seoDescription": "Los mejores vestidos para toda ocasión",
  "seoKeywords": "vestidos,elegante,fiesta"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "clx789...",
    "name": "Vestidos",
    "slug": "vestidos",
    "image": null,
    "order": 3,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### PATCH /categories/:id
Actualizar categoría
```
Acceso: Protegido (Admin)
Invalida: Cache de categorías, productos de la categoría
```

**Request:**
```json
{
  "name": "Vestidos de Fiesta",
  "isActive": false,
  "seoTitle": "Vestidos de Fiesta",
  "seoDescription": "Vestidos elegantes para fiestas",
  "seoKeywords": "vestidos,fiesta,elegante"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "clx789...",
    "name": "Vestidos de Fiesta",
    "slug": "vestidos-de-fiesta",
    ...
  }
}
```

---

### DELETE /categories/:id
Eliminar categoría
```
Acceso: Protegido (Admin)
Invalida: Cache de categorías
Nota: Falla si tiene productos asociados
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Categoría eliminada correctamente"
  }
}
```

**Error 400:**
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "No se puede eliminar la categoría porque tiene 5 productos asociados"
  }
}
```

---

### POST /categories/:id/image
Subir imagen de categoría
```
Acceso: Protegido (Admin)
Content-Type: multipart/form-data
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "image": "https://cloudinary.com/category.jpg",
    "imagePublicId": "catalogo/categories/xyz"
  }
}
```

---

### PATCH /categories/reorder
Reordenar categorías
```
Acceso: Protegido (Admin)
Invalida: Cache de categorías
```

**Request:**
```json
{
  "order": [
    { "id": "clx123...", "order": 1 },
    { "id": "clx456...", "order": 2 },
    { "id": "clx789...", "order": 3 }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "message": "Orden actualizado correctamente"
  }
}
```

---

## 📦 PRODUCTS - Productos

### GET /products
Listar productos (admin)
```
Acceso: Protegido (Admin)
```

**Query Params:**
```
?page=1
&limit=20
&categoryId=clx123...
&search=polo
&isActive=true
&isFeatured=true
&sortBy=createdAt
&sortOrder=desc
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prod123...",
        "name": "Polo Manga Corta",
        "slug": "polo-manga-corta",
        "price": 45.00,
        "salePrice": 39.00,
        "isActive": true,
        "isFeatured": true,
        "category": {
          "id": "clx123...",
          "name": "Polos"
        },
        "images": [
          { "url": "https://...", "order": 0 }
        ],
        "_count": {
          "variantGroups": 2
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### GET /products/:id
Obtener producto completo
```
Acceso: Protegido (Admin)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "prod123...",
    "categoryId": "clx123...",
    "name": "Polo Manga Corta",
    "slug": "polo-manga-corta",
    "description": "Polo de algodón 100%",
    "price": 45.00,
    "salePrice": 39.00,
    "showPrice": true,
    "stock": 50,
    "showStock": true,
    "stockMessage": null,
    "isActive": true,
    "isFeatured": true,
    "order": 1,
    "seoTitle": "Polo Manga Corta - Algodón Premium",
    "seoDescription": "Polo de algodón 100% de alta calidad",
    "seoKeywords": "polo,manga corta,algodón",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z",
    "category": {
      "id": "clx123...",
      "name": "Polos",
      "slug": "polos"
    },
    "images": [
      {
        "id": "img1...",
        "url": "https://cloudinary.com/polo1.jpg",
        "publicId": "catalogo/products/polo1",
        "order": 0
      },
      {
        "id": "img2...",
        "url": "https://cloudinary.com/polo2.jpg",
        "publicId": "catalogo/products/polo2",
        "order": 1
      }
    ],
    "variantGroups": [
      {
        "id": "vg1...",
        "name": "Talla",
        "isRequired": true,
        "displayType": "BUTTONS",
        "order": 0,
        "options": [
          { "id": "vo1...", "name": "S", "additionalPrice": 0, "isActive": true, "order": 0 },
          { "id": "vo2...", "name": "M", "additionalPrice": 0, "isActive": true, "order": 1 },
          { "id": "vo3...", "name": "L", "additionalPrice": 0, "isActive": true, "order": 2 },
          { "id": "vo4...", "name": "XL", "additionalPrice": 5.00, "isActive": true, "order": 3 }
        ]
      },
      {
        "id": "vg2...",
        "name": "Color",
        "isRequired": true,
        "displayType": "IMAGES",
        "order": 1,
        "options": [
          { "id": "vo5...", "name": "Negro", "image": "https://...", "additionalPrice": 0, "isActive": true, "order": 0 },
          { "id": "vo6...", "name": "Blanco", "image": "https://...", "additionalPrice": 0, "isActive": true, "order": 1 }
        ]
      }
    ]
  }
}
```

---

### POST /products
Crear producto
```
Acceso: Protegido (Admin)
Invalida: Cache de productos, categoría
```

**Request:**
```json
{
  "categoryId": "clx123...",
  "name": "Nuevo Polo",
  "description": "Descripción del polo",
  "price": 45.00,
  "salePrice": null,
  "showPrice": true,
  "stock": 50,
  "showStock": false,
  "isActive": true,
  "isFeatured": false,
  "seoTitle": "Nuevo Polo Premium",
  "seoDescription": "Polo de alta calidad",
  "seoKeywords": "polo,nuevo,premium"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "prod456...",
    "name": "Nuevo Polo",
    "slug": "nuevo-polo",
    ...
  }
}
```

---

### PATCH /products/:id
Actualizar producto
```
Acceso: Protegido (Admin)
Invalida: Cache del producto, lista de productos, categoría
```

**Request:**
```json
{
  "name": "Polo Actualizado",
  "price": 50.00,
  "isFeatured": true,
  "seoTitle": "Polo Actualizado - Oferta",
  "seoDescription": "El mejor polo ahora en oferta"
}
```

---

### DELETE /products/:id
Eliminar producto
```
Acceso: Protegido (Admin)
Invalida: Cache relacionados
Nota: Elimina imágenes de Cloudinary
```

---

### POST /products/:id/duplicate
Duplicar producto
```
Acceso: Protegido (Admin)
Nota: Copia todo excepto imágenes
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "prod789...",
    "name": "Polo Actualizado (copia)",
    "slug": "polo-actualizado-copia",
    ...
  }
}
```

---

### POST /products/:id/images
Subir imágenes del producto
```
Acceso: Protegido (Admin)
Content-Type: multipart/form-data
Max: 4 imágenes
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "images": [
      { "id": "img...", "url": "https://...", "order": 0 },
      { "id": "img...", "url": "https://...", "order": 1 }
    ]
  }
}
```

---

### DELETE /products/:id/images/:imageId
Eliminar imagen del producto
```
Acceso: Protegido (Admin)
```

---

### PATCH /products/:id/images/reorder
Reordenar imágenes
```
Acceso: Protegido (Admin)
```

**Request:**
```json
{
  "order": [
    { "id": "img2...", "order": 0 },
    { "id": "img1...", "order": 1 }
  ]
}
```

---

## 🎨 VARIANTS - Variantes

### POST /products/:productId/variant-groups
Crear grupo de variantes
```
Acceso: Protegido (Admin)
```

**Request:**
```json
{
  "name": "Talla",
  "isRequired": true,
  "displayType": "BUTTONS"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "vg123...",
    "productId": "prod123...",
    "name": "Talla",
    "isRequired": true,
    "displayType": "BUTTONS",
    "order": 0,
    "options": []
  }
}
```

---

### PATCH /variant-groups/:id
Actualizar grupo de variantes
```
Acceso: Protegido (Admin)
```

**Request:**
```json
{
  "name": "Tamaño",
  "displayType": "DROPDOWN"
}
```

---

### DELETE /variant-groups/:id
Eliminar grupo de variantes
```
Acceso: Protegido (Admin)
Nota: Elimina todas las opciones asociadas
```

---

### POST /variant-groups/:groupId/options
Crear opción de variante
```
Acceso: Protegido (Admin)
```

**Request:**
```json
{
  "name": "S",
  "additionalPrice": 0,
  "isActive": true
}
```

---

### PATCH /variant-options/:id
Actualizar opción
```
Acceso: Protegido (Admin)
```

---

### DELETE /variant-options/:id
Eliminar opción
```
Acceso: Protegido (Admin)
```

---

### POST /variant-options/:id/image
Subir imagen de opción
```
Acceso: Protegido (Admin)
Content-Type: multipart/form-data
```

---

## 🌐 CATALOG - API Pública

### GET /catalog
Obtener catálogo público
```
Acceso: Público
Cache: 5 minutos
```

**Query Params:**
```
?categorySlug=polos
&featured=true
&search=manga
&page=1
&limit=20
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "businessName": "Mi Tienda",
      "logo": "https://...",
      "currency": "S/",
      "cartEnabled": true
    },
    "categories": [
      { "id": "...", "name": "Polos", "slug": "polos", "image": "..." }
    ],
    "products": {
      "items": [
        {
          "id": "...",
          "name": "Polo Básico",
          "slug": "polo-basico",
          "price": 45.00,
          "salePrice": 39.00,
          "showPrice": true,
          "isFeatured": true,
          "image": "https://..."
        }
      ],
      "pagination": { ... }
    },
    "featured": [ ... ]
  }
}
```

---

### GET /catalog/products/:slug
Obtener producto público
```
Acceso: Público
Cache: 10 minutos
Side Effect: Registra visita (async via queue)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "...",
      "name": "Polo Manga Corta",
      "slug": "polo-manga-corta",
      "description": "...",
      "price": 45.00,
      "salePrice": 39.00,
      "showPrice": true,
      "stock": 50,
      "showStock": true,
      "images": [ ... ],
      "variantGroups": [ ... ],
      "category": { "name": "Polos", "slug": "polos" }
    },
    "related": [ ... ]
  }
}
```

---

### GET /catalog/categories/:slug
Obtener productos por categoría
```
Acceso: Público
Cache: 5 minutos
```

---

### GET /catalog/search
Buscar productos
```
Acceso: Público
Cache: 1 minuto (por query)
```

**Query Params:**
```
?q=polo azul
&page=1
&limit=20
```

---

### POST /catalog/track
Registrar evento (visita, clic)
```
Acceso: Público
Rate Limit: 60/min por IP
```

**Request:**
```json
{
  "type": "PRODUCT_VIEW",
  "productId": "prod123..."
}
```

```json
{
  "type": "WHATSAPP_CLICK",
  "productId": "prod123..."
}
```

---

## 📊 STATS - Estadísticas

### GET /stats/dashboard
Obtener estadísticas del dashboard
```
Acceso: Protegido (Admin)
Cache: 1 minuto
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalViews": 15420,
      "todayViews": 234,
      "totalWhatsAppClicks": 892,
      "todayWhatsAppClicks": 45,
      "conversionRate": 5.78
    },
    "topProducts": [
      { "id": "...", "name": "Polo Básico", "views": 1520, "clicks": 89 }
    ],
    "topCategories": [
      { "id": "...", "name": "Polos", "views": 4500 }
    ],
    "recentActivity": [
      { "type": "PRODUCT_VIEW", "productName": "...", "timestamp": "..." }
    ]
  }
}
```

---

### GET /stats/products/:id
Estadísticas de un producto
```
Acceso: Protegido (Admin)
```

**Query Params:**
```
?startDate=2024-01-01
&endDate=2024-01-31
```

---

## 🎯 TRACKING PIXELS - Píxeles de Ads Adicionales

### GET /tracking-pixels
Listar píxeles de tracking
```
Acceso: Protegido (Admin)
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "px123...",
      "name": "Google Ads Remarketing",
      "type": "GOOGLE_ADS",
      "pixelId": "AW-123456789",
      "isActive": true,
      "config": { "conversionLabel": "abc123" },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

### POST /tracking-pixels
Crear píxel de tracking
```
Acceso: Protegido (Admin)
```

**Request:**
```json
{
  "name": "Pinterest Tag",
  "type": "PINTEREST",
  "pixelId": "2612345678901",
  "isActive": true,
  "config": null
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "px456...",
    "name": "Pinterest Tag",
    "type": "PINTEREST",
    "pixelId": "2612345678901",
    "isActive": true,
    "config": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Valores de `type`:**
- `GOOGLE_ADS` - Google Ads
- `FACEBOOK` - Facebook/Meta Pixel adicional
- `TIKTOK` - TikTok Pixel adicional
- `SNAPCHAT` - Snapchat Pixel
- `PINTEREST` - Pinterest Tag
- `TWITTER` - Twitter Pixel
- `LINKEDIN` - LinkedIn Insight Tag
- `CUSTOM` - Script personalizado

---

### PATCH /tracking-pixels/:id
Actualizar píxel
```
Acceso: Protegido (Admin)
```

**Request:**
```json
{
  "name": "Pinterest Tag - Principal",
  "isActive": false
}
```

---

### DELETE /tracking-pixels/:id
Eliminar píxel
```
Acceso: Protegido (Admin)
```

---

## 📥 IMPORT - Importación

### POST /import/excel
Importar productos desde Excel
```
Acceso: Protegido (Admin)
Content-Type: multipart/form-data
Proceso: Async (via queue)
```

**Request (FormData):**
```
file: [archivo.xlsx]
```

**Response 202:**
```json
{
  "success": true,
  "data": {
    "jobId": "job123...",
    "message": "Importación iniciada. Se procesarán 50 productos.",
    "statusUrl": "/import/status/job123..."
  }
}
```

---

### GET /import/status/:jobId
Estado de importación
```
Acceso: Protegido (Admin)
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "jobId": "job123...",
    "status": "processing",
    "progress": 45,
    "total": 50,
    "processed": 22,
    "errors": [
      { "row": 15, "message": "Categoría no encontrada: Zapatos" }
    ]
  }
}
```

---

### GET /import/template
Descargar plantilla Excel
```
Acceso: Protegido (Admin)
Response: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

---

## 📤 EXPORT - Exportacion

### GET /export/products
Exportar productos a Excel
```
Acceso: Protegido (Admin)
Response: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

**Query Params:**
```
?categoryId=clx123...   (filtrar por categoria)
&isActive=true          (solo activos)
&format=xlsx            (xlsx o csv)
```

**Response:** Archivo Excel/CSV con los productos

**Columnas del Excel:**
| Columna | Descripcion |
|---------|-------------|
| ID | ID del producto |
| Nombre | Nombre del producto |
| Slug | URL amigable |
| Categoria | Nombre de la categoria |
| Descripcion | Descripcion del producto |
| Precio | Precio base |
| Precio Oferta | Precio en oferta (si aplica) |
| Stock | Cantidad en stock |
| Activo | Si/No |
| Destacado | Si/No |
| SEO Titulo | Titulo SEO |
| SEO Descripcion | Descripcion SEO |
| SEO Keywords | Palabras clave |
| Imagen Principal | URL de la primera imagen |
| Variantes | Grupos y opciones en formato texto |

---

### GET /export/categories
Exportar categorias a Excel
```
Acceso: Protegido (Admin)
Response: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

**Query Params:**
```
?isActive=true    (solo activas)
&format=xlsx      (xlsx o csv)
```

---

### GET /export/template
Descargar plantilla vacia para importar
```
Acceso: Protegido (Admin)
Response: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

**Response:** Archivo Excel con headers y ejemplo de datos

---

### GET /export/stats
Exportar estadisticas a Excel
```
Acceso: Protegido (Admin)
Response: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

**Query Params:**
```
?startDate=2024-01-01
&endDate=2024-01-31
&type=all              (all, views, clicks, conversions)
```

---

## ❤️ HEALTH - Health Checks

### GET /health
Estado del servidor
```
Acceso: Público
```

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "cloudinary": "ok"
  }
}
```

---

## Resumen de Rutas

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| **AUTH** |
| POST | /auth/login | Público | Login |
| POST | /auth/refresh | Público | Refresh token |
| POST | /auth/logout | Admin | Logout |
| GET | /auth/me | Admin | Usuario actual |
| **SETTINGS** |
| GET | /settings | Público | Obtener config |
| PATCH | /settings | Admin | Actualizar config |
| POST | /settings/logo | Admin | Subir logo |
| POST | /settings/og-image | Admin | Subir OG image |
| **CATEGORIES** |
| GET | /categories | Admin | Listar |
| GET | /categories/:id | Admin | Obtener una |
| POST | /categories | Admin | Crear |
| PATCH | /categories/:id | Admin | Actualizar |
| DELETE | /categories/:id | Admin | Eliminar |
| POST | /categories/:id/image | Admin | Subir imagen |
| PATCH | /categories/reorder | Admin | Reordenar |
| **PRODUCTS** |
| GET | /products | Admin | Listar |
| GET | /products/:id | Admin | Obtener uno |
| POST | /products | Admin | Crear |
| PATCH | /products/:id | Admin | Actualizar |
| DELETE | /products/:id | Admin | Eliminar |
| POST | /products/:id/duplicate | Admin | Duplicar |
| POST | /products/:id/images | Admin | Subir imágenes |
| DELETE | /products/:id/images/:imageId | Admin | Eliminar imagen |
| PATCH | /products/:id/images/reorder | Admin | Reordenar imágenes |
| **VARIANTS** |
| POST | /products/:id/variant-groups | Admin | Crear grupo |
| PATCH | /variant-groups/:id | Admin | Actualizar grupo |
| DELETE | /variant-groups/:id | Admin | Eliminar grupo |
| POST | /variant-groups/:id/options | Admin | Crear opción |
| PATCH | /variant-options/:id | Admin | Actualizar opción |
| DELETE | /variant-options/:id | Admin | Eliminar opción |
| POST | /variant-options/:id/image | Admin | Subir imagen opción |
| **CATALOG (Público)** |
| GET | /catalog | Público | Catálogo completo |
| GET | /catalog/products/:slug | Público | Producto público |
| GET | /catalog/categories/:slug | Público | Por categoría |
| GET | /catalog/search | Público | Buscar |
| POST | /catalog/track | Público | Registrar evento |
| **STATS** |
| GET | /stats/dashboard | Admin | Dashboard |
| GET | /stats/products/:id | Admin | Stats producto |
| **TRACKING PIXELS** | | | |
| GET | /tracking-pixels | Admin | Listar píxeles |
| POST | /tracking-pixels | Admin | Crear píxel |
| PATCH | /tracking-pixels/:id | Admin | Actualizar píxel |
| DELETE | /tracking-pixels/:id | Admin | Eliminar píxel |
| **IMPORT** |
| POST | /import/excel | Admin | Importar productos |
| GET | /import/status/:jobId | Admin | Estado importacion |
| GET | /import/template | Admin | Descargar plantilla |
| **EXPORT** |
| GET | /export/products | Admin | Exportar productos |
| GET | /export/categories | Admin | Exportar categorias |
| GET | /export/template | Admin | Plantilla vacia |
| GET | /export/stats | Admin | Exportar estadisticas |
| **HEALTH** |
| GET | /health | Publico | Health check |
