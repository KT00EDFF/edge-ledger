# Security Considerations - Edge Ledger

This document outlines the security measures implemented in the Edge Ledger application and best practices for maintaining security.

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Docker Security](#docker-security)
3. [Input Validation](#input-validation)
4. [API Security](#api-security)
5. [Database Security](#database-security)
6. [Dependency Security](#dependency-security)
7. [Best Practices](#best-practices)

---

## Environment Variables

### Critical Security Rules

✅ **DO:**
- Store all secrets in `.env.local` (gitignored)
- Use `.env.example` as a template only
- Validate environment variables at startup (`lib/env.ts`)
- Use different credentials for development and production
- Rotate API keys regularly

❌ **DON'T:**
- Never commit `.env.local` or any file with real secrets
- Never hardcode API keys in source code
- Never expose secrets in client-side code
- Never share `.env.local` in chat, email, or screenshots

### Environment Variable Management

```typescript
// lib/env.ts validates all environment variables
// Throws error if critical variables are missing
// Warns if optional variables are missing
```

### Sensitive Variables

| Variable | Sensitivity | Required |
|----------|-------------|----------|
| `DATABASE_URL` | High | Yes |
| `OPENAI_API_KEY` | High | No (mock fallback) |
| `ODDS_API_KEY` | High | No (mock fallback) |
| `POSTGRES_PASSWORD` | High | Yes (Docker) |

---

## Docker Security

### Container Security Measures

✅ **Implemented:**
- Non-root user execution (user `nextjs`, uid 1001)
- Multi-stage builds to minimize image size
- No secrets in Docker images
- Isolated network for containers
- Read-only file system where possible

### Docker Compose Security

```yaml
# Services run in isolated network
networks:
  app-network:
    driver: bridge

# Environment variables from .env.local
env_file:
  - .env.local

# Database not exposed externally in production
```

### Production Hardening

For production deployment, consider:

```yaml
# docker-compose.prod.yml
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx

  db:
    # Don't expose PostgreSQL port externally
    ports: []  # Remove port mapping
```

---

## Input Validation

### Zod Schema Validation

All user inputs are validated using Zod schemas before processing:

```typescript
// lib/validation.ts

// Matchup validation
export const matchupSchema = z.object({
  sport: z.string().min(1),
  homeTeam: z.string().min(1).max(100),
  awayTeam: z.string().min(1).max(100),
  gameDate: z.string().datetime(),
})

// Sanitization
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Prevent HTML injection
    .slice(0, 1000) // Limit length
}
```

### Validation Points

✅ **Validated:**
- All API route inputs
- Form submissions
- URL parameters
- Database queries (via Prisma)

### XSS Prevention

- HTML special characters removed from user input
- React's built-in XSS protection
- Content Security Policy headers (add in production)

---

## API Security

### Rate Limiting

**Recommended for production:**

```typescript
// middleware.ts (create this)
import { Ratelimit } from '@upstash/ratelimit'

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'

  // Rate limit: 10 requests per 10 seconds
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
}
```

### API Key Protection

✅ **Implemented:**
- API keys never sent to client
- Server-side API calls only
- Environment variable isolation

### Error Handling

All API routes use safe error handling:

```typescript
try {
  // API logic
} catch (error) {
  console.error('Error:', error)
  // Generic error message (don't expose internals)
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  )
}
```

---

## Database Security

### Prisma ORM Security

✅ **Benefits:**
- SQL injection prevention (parameterized queries)
- Type-safe queries
- No raw SQL (unless explicitly needed)

### Connection Security

```env
# Use SSL in production
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Access Control

- Database credentials in environment variables only
- Separate database users for different environments
- Principle of least privilege

### Backup Strategy

**Recommended:**
```bash
# Regular backups
docker-compose exec db pg_dump -U postgres edge_ledger > backup.sql

# Encrypted backups for production
pg_dump | gpg --encrypt --recipient your@email.com > backup.sql.gpg
```

---

## Dependency Security

### Security Scanning

Run regular security audits:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically when possible
npm audit fix

# Update dependencies
npm update
```

### Trusted Dependencies

All dependencies are from verified sources:
- Official Next.js packages
- Anthropic-maintained packages (Prisma, etc.)
- Well-established libraries (React Query, Zod)

### Minimal Dependencies

Only essential packages included to reduce attack surface.

---

## Best Practices

### Development

1. **Never commit secrets**
   ```bash
   # Check before committing
   git diff --staged

   # Use git hooks to prevent accidents
   # (consider using tools like git-secrets)
   ```

2. **Use different credentials per environment**
   - Development: `.env.local`
   - Production: Environment variables in hosting platform
   - Testing: `.env.test`

3. **Regular updates**
   ```bash
   # Update dependencies weekly
   npm update
   npm audit fix
   ```

### Production Deployment

1. **Environment Configuration**
   - Set all environment variables in hosting platform
   - Never commit production `.env` files
   - Use secrets management (AWS Secrets Manager, etc.)

2. **HTTPS Only**
   - Enforce HTTPS in production
   - Set secure cookie flags
   - Use HSTS headers

3. **Monitoring**
   - Log suspicious activity
   - Monitor API usage
   - Set up alerts for errors

4. **Regular Backups**
   - Daily database backups
   - Encrypted backup storage
   - Test restore procedures

### Code Review Checklist

Before merging code:
- [ ] No hardcoded secrets or API keys
- [ ] All user inputs validated
- [ ] Error messages don't expose internals
- [ ] SQL queries use Prisma (no raw SQL)
- [ ] Environment variables properly accessed
- [ ] No console.log with sensitive data

---

## Security Headers

### Recommended Next.js Configuration

Add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## Incident Response

### If Secrets Are Compromised

1. **Immediately rotate all credentials**
   - Generate new API keys
   - Change database passwords
   - Update environment variables

2. **Audit access logs**
   - Check for unauthorized API usage
   - Review database access logs
   - Monitor for unusual activity

3. **Notify stakeholders**
   - Inform users if data was accessed
   - Document the incident
   - Implement additional safeguards

---

## Security Contacts

### Reporting Vulnerabilities

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: [your-security-email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

### Responsible Disclosure

We commit to:
- Acknowledging reports within 48 hours
- Providing status updates
- Crediting reporters (if desired)
- Fixing critical issues within 7 days

---

## Compliance

### Data Privacy

- User data stored securely in PostgreSQL
- No third-party analytics without consent
- GDPR-compliant data handling

### API Usage

- OpenAI API: Subject to OpenAI's terms
- The Odds API: Subject to The Odds API terms
- Review third-party ToS regularly

---

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] `.env.local` in `.gitignore`
- [ ] Input validation on all forms
- [ ] Error handling doesn't expose internals
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Database backups configured
- [ ] Dependency audit passed

### Post-Deployment

- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Schedule regular security audits
- [ ] Document incident response plan

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)
- [Prisma Security](https://www.prisma.io/docs/concepts/more/security)

---

*Last updated: January 2026*
*Review this document quarterly and after any security incidents*
