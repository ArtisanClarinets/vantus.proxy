# API Documentation

## Overview
Vantus Proxy Control Plane provides a set of internal APIs for configuration management and external APIs for observability.

## Authentication
Most endpoints require session authentication (cookie-based). Internal system APIs require `Authorization: Bearer <token>`.

## Endpoints

### 1. Configuration Rendering
**POST** `/api/config-renderer/render`
- **Description:** Renders Nginx configuration for a tenant.
- **Auth:** Session required.
- **Body:** `{ "tenantId": "string" }`
- **Response:** `{ "files": [...], "hash": "string" }`

### 2. Configuration Deployment
**POST** `/api/config-renderer/deploy`
- **Description:** Deploys rendered configuration to the Nginx hosts.
- **Auth:** Session required (Owner/Admin).
- **Body:** `{ "files": [...], "hash": "string" }`
- **Response:** `{ "status": "deployed" }`

### 3. Metrics Ingestion
**POST** `/api/metrics`
- **Description:** Ingests metrics from Nginx agents.
- **Auth:** None (currently), should use API Key in future.
- **Body:** `{ "metrics": [{ "name": "req_count", "value": 100, ... }] }`

### 4. Health Check
**GET** `/system/health`
- **Description:** Returns system status.
- **Response:** `{ "status": "ok", "db": "connected" }`
