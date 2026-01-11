# Security Implementation - OWASP Top 10

## Resumen de Protecciones

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPAS DE SEGURIDAD                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Cliente]                                                              │
│      │                                                                  │
│      ▼                                                                  │
│  ┌─────────────────┐                                                    │
│  │     NGINX       │  Rate Limiting, SSL/TLS, Headers                   │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │    NEXT.JS      │  CSP, XSS Protection, CSRF Tokens                  │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │    NESTJS       │  JWT Auth, Validation, Rate Limit, Guards          │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │    PRISMA       │  Prepared Statements (SQL Injection Prevention)    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐                                                    │
│  │   POSTGRESQL    │  Encrypted at rest, Limited access                 │
│  └─────────────────┘                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## OWASP Top 10 - Implementación

### 1. A01:2021 – Broken Access Control

```typescript
// =============================================
// GUARDS - Control de acceso basado en roles
// =============================================

// common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}

// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Uso en controller
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ProductsController {
  @Get()
  findAll() { ... }
}
```

---

### 2. A02:2021 – Cryptographic Failures

```typescript
// =============================================
// PASSWORD HASHING - bcrypt
// =============================================

// auth/auth.service.ts
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Alto costo computacional

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async validatePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// =============================================
// JWT TOKENS - Firmados y con expiración
// =============================================

// Configuración de tokens
const accessTokenConfig = {
  secret: process.env.JWT_SECRET, // Mínimo 256 bits
  expiresIn: '15m', // Corta duración
};

const refreshTokenConfig = {
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: '7d',
};

// Generar tokens
generateTokens(userId: string) {
  const payload = { sub: userId };

  return {
    accessToken: this.jwtService.sign(payload, accessTokenConfig),
    refreshToken: this.jwtService.sign(payload, refreshTokenConfig),
  };
}

// =============================================
// VARIABLES SENSIBLES - Nunca en código
// =============================================

// ❌ NUNCA hacer esto
const secret = 'mi-secreto-hardcoded';

// ✅ SIEMPRE usar variables de entorno
const secret = process.env.JWT_SECRET;

// Validar que existan al iniciar
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}
```

---

### 3. A03:2021 – Injection

```typescript
// =============================================
// SQL INJECTION - Prevenido por Prisma
// =============================================

// ❌ VULNERABLE (si usaras raw SQL)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ SEGURO - Prisma usa prepared statements
const user = await prisma.user.findUnique({
  where: { email }, // Automáticamente sanitizado
});

// ✅ SEGURO - Raw queries con parámetros
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// =============================================
// NOSQL INJECTION - Validación estricta
// =============================================

// Validar con Zod que los IDs sean válidos
const idSchema = z.string().cuid(); // Solo acepta CUIDs válidos

// =============================================
// COMMAND INJECTION - Evitar exec
// =============================================

// ❌ NUNCA
exec(`convert ${userInput} output.png`);

// ✅ Usar librerías específicas
import sharp from 'sharp';
await sharp(buffer).resize(800).toFile('output.png');
```

---

### 4. A04:2021 – Insecure Design

```typescript
// =============================================
// VALIDACIÓN EN TODAS LAS CAPAS
// =============================================

// 1. Frontend - React Hook Form + Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// 2. Backend - Pipe de validación
@Post()
create(@Body(new ZodValidationPipe(createUserSchema)) data: CreateUserDto) {
  // Los datos ya están validados
}

// 3. Database - Constraints en Prisma
model User {
  email String @unique // Unicidad a nivel de DB
}

// =============================================
// PRINCIPIO DE MÍNIMO PRIVILEGIO
// =============================================

// Usuario de DB con permisos limitados
// postgresql.conf
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES TO catalogo_app;
-- Sin permisos de DROP, CREATE, ALTER

// =============================================
// SEPARACIÓN DE ENTORNOS
// =============================================

// Diferentes credenciales por entorno
.env.development
.env.staging
.env.production

// Nunca compartir secrets entre entornos
```

---

### 5. A05:2021 – Security Misconfiguration

```typescript
// =============================================
// HELMET - Headers de seguridad
// =============================================

// main.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.API_URL],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));

// =============================================
// CORS - Configuración estricta
// =============================================

app.enableCors({
  origin: process.env.FRONTEND_URL, // Solo el frontend permitido
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// =============================================
// OCULTAR INFORMACIÓN SENSIBLE
// =============================================

// Deshabilitar header X-Powered-By
app.disable('x-powered-by');

// No exponer stack traces en producción
if (process.env.NODE_ENV === 'production') {
  app.useGlobalFilters(new ProductionExceptionFilter());
}

// =============================================
// SWAGGER SOLO EN DESARROLLO
// =============================================

if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
```

---

### 6. A06:2021 – Vulnerable Components

```bash
# =============================================
# AUDITORÍA DE DEPENDENCIAS
# =============================================

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix

# Actualizar dependencias
npm update

# Herramientas recomendadas
npx snyk test      # Snyk security
npx npm-check -u   # Actualización interactiva

# =============================================
# DEPENDABOT - Actualizaciones automáticas
# =============================================

# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

### 7. A07:2021 – Authentication Failures

```typescript
// =============================================
// RATE LIMITING EN LOGIN
// =============================================

// auth/auth.controller.ts
@Post('login')
@Throttle(5, 60) // 5 intentos por minuto
@Public()
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

// =============================================
// BLOQUEO DE CUENTA DESPUÉS DE INTENTOS FALLIDOS
// =============================================

// auth/auth.service.ts
async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  // Verificar si está bloqueado
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    throw new TooManyRequestsException(
      'Cuenta bloqueada. Intenta en 15 minutos.'
    );
  }

  const isValid = await this.validatePassword(dto.password, user?.password);

  if (!isValid) {
    // Incrementar intentos fallidos
    await this.incrementFailedAttempts(user?.id);
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // Resetear intentos fallidos
  await this.resetFailedAttempts(user.id);

  return this.generateTokens(user);
}

// =============================================
// REFRESH TOKEN ROTATION
// =============================================

async refresh(refreshToken: string) {
  const payload = this.jwtService.verify(refreshToken);
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
  });

  // Verificar que el refresh token coincida
  if (user.refreshToken !== refreshToken) {
    // Posible robo de token - invalidar todos
    await this.invalidateAllTokens(user.id);
    throw new UnauthorizedException('Token inválido');
  }

  // Generar nuevos tokens (rotación)
  const tokens = this.generateTokens(user);

  // Guardar nuevo refresh token
  await this.prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
}

// =============================================
// PASSWORD REQUIREMENTS
// =============================================

const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');
```

---

### 8. A08:2021 – Software and Data Integrity

```typescript
// =============================================
// VERIFICAR INTEGRIDAD DE DEPENDENCIAS
// =============================================

// package-lock.json - Siempre commitear
// Garantiza versiones exactas

// npm ci - Usar en CI/CD (más estricto que npm install)

// =============================================
// SUBRESOURCE INTEGRITY (SRI)
// =============================================

// Para scripts externos (si se usan)
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY..."
  crossorigin="anonymous"
></script>

// =============================================
// VALIDAR UPLOADS
// =============================================

// images/images.service.ts
async uploadImage(file: Express.Multer.File) {
  // Verificar tipo MIME real (no solo extensión)
  const fileType = await fileTypeFromBuffer(file.buffer);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!fileType || !allowedTypes.includes(fileType.mime)) {
    throw new BadRequestException('Tipo de archivo no permitido');
  }

  // Verificar tamaño
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new BadRequestException('Archivo muy grande (máx 2MB)');
  }

  // Subir a Cloudinary (que también valida)
  return this.cloudinary.upload(file);
}
```

---

### 9. A09:2021 – Security Logging and Monitoring

```typescript
// =============================================
// LOGGING DE SEGURIDAD
// =============================================

// common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, user } = request;
    const userAgent = request.get('user-agent') || '';

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;

        this.logger.log(
          `${method} ${url} ${statusCode} ${Date.now() - now}ms - ${ip} - ${user?.id || 'anonymous'} - ${userAgent}`
        );
      }),
      catchError((error) => {
        // Log de errores de seguridad
        if (error.status === 401 || error.status === 403) {
          this.logger.warn(
            `SECURITY: ${method} ${url} ${error.status} - ${ip} - ${user?.id || 'anonymous'}`
          );
        }
        throw error;
      }),
    );
  }
}

// =============================================
// EVENTOS DE SEGURIDAD
// =============================================

// Eventos a registrar:
// - Login exitoso/fallido
// - Cambio de contraseña
// - Múltiples intentos fallidos
// - Acceso a recursos protegidos
// - Modificaciones de datos sensibles

@OnEvent('auth.login.failed')
async handleLoginFailed(payload: { email: string; ip: string }) {
  this.logger.warn(`Login fallido: ${payload.email} desde ${payload.ip}`);

  // Alertar si hay muchos intentos
  const attempts = await this.getRecentAttempts(payload.ip);
  if (attempts > 10) {
    await this.alertService.sendSecurityAlert({
      type: 'BRUTE_FORCE_ATTEMPT',
      ip: payload.ip,
      attempts,
    });
  }
}
```

---

### 10. A10:2021 – Server-Side Request Forgery (SSRF)

```typescript
// =============================================
// VALIDAR URLs EXTERNAS
// =============================================

// Si se permite input de URLs (ej: importar imagen desde URL)

import { URL } from 'url';

function validateExternalUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Solo permitir HTTPS
    if (url.protocol !== 'https:') {
      return false;
    }

    // Bloquear IPs privadas
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^0\./,
      /^169\.254\./, // Link-local
    ];

    const hostname = url.hostname;
    if (blockedPatterns.some((pattern) => pattern.test(hostname))) {
      return false;
    }

    // Lista blanca de dominios permitidos
    const allowedDomains = ['cloudinary.com', 'res.cloudinary.com'];
    if (!allowedDomains.some((domain) => hostname.endsWith(domain))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
```

---

## Checklist de Seguridad

```
PRE-DEPLOY CHECKLIST
────────────────────────────────────────────────

□ Variables de entorno seguras (no hardcoded)
□ JWT_SECRET con al menos 256 bits de entropía
□ Passwords hasheados con bcrypt (12+ rounds)
□ HTTPS habilitado en producción
□ CORS configurado solo para dominios permitidos
□ Rate limiting en endpoints sensibles
□ Validación de input en frontend Y backend
□ Headers de seguridad (Helmet)
□ Dependencias actualizadas (npm audit)
□ Swagger deshabilitado en producción
□ Logs de seguridad configurados
□ Backups de base de datos encriptados
□ Secretos rotados periódicamente
□ Acceso a DB solo desde backend (no público)
□ Redis protegido con contraseña
```
