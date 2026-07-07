# LucaP Web E2E Tests

End-to-end browser tests for the LucaP web application using Playwright.

## Overview

Tests complete user journeys through the web application:

- Authentication (login, logout, session, protected routes)
- Navigation and page rendering
- Company dashboard
- Invoices and customer management
- Accountant review portal
- Admin portal
- Staff dashboard

## Setup

### Prerequisites

- Web application running (port 3000)
- Database seeded with test users (`bun run db:seed`)
- Chrome/Chromium installed

### Installation

```bash
cd apps/web-e2e
bun install

# Install Playwright browsers
bunx playwright install chromium
```

### Environment

Copy `.env.example` to `.env` (defaults work for local development):
```bash
cp .env.example .env
```

## Running Tests

```bash
# Run all tests (headless)
bun test:e2e

# Run with UI mode (interactive)
bun test:ui

# Run in headed mode (see browser)
bun test:headed

# Debug specific test
bun test:debug

# View test report
bun test:report

# Generate test code
bun test:codegen
```

## Test Architecture

### Page Object Model

Tests use the Page Object Model (POM) pattern:

- **LoginPage**: Login form interactions
- **DashboardPage**: Dashboard navigation and content
- **InvoicesPage**: Invoice list and creation

### Authentication Optimization

Tests use Playwright's `storageState` to pre-authenticate sessions:

1. `global-setup.ts` authenticates all 5 seeded users once
2. Each user's session is cached in `.auth/` directory
3. Test projects reference the cached state to skip login

### Seeded Test Users

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@lucap.com | Admin@1234 | ADMIN |
| Staff | staff@lucap.com | Staff@1234 | Staff |
| Regular User | user@lucap.com | User@1234 | Customer |
| Super Accountant | superaccountant@lucap.com | SuperAcc@1234 | Super Accountant |
| Accountant Staff | accountantstaff@lucap.com | AccStaff@1234 | Accountant Staff |

## Test Files

| File | Tests |
|------|-------|
| `flows/auth.spec.ts` | Login, logout, session, invalid credentials, protected routes |
| `flows/navigation.spec.ts` | Page rendering, sidebar navigation |
| `flows/company-dashboard.spec.ts` | Dashboard layout and components |
| `flows/invoice-flow.spec.ts` | Invoice list page |
| `flows/customer-flow.spec.ts` | Customer management page |
| `flows/accountant-portal.spec.ts` | Accountant review sections |
| `flows/admin-portal.spec.ts` | Admin dashboard and management |
| `flows/staff-dashboard.spec.ts` | Staff dashboard access |
