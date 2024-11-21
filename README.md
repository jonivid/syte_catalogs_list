### Catalog Management API Backend Documentation

---

## Introduction

The **Catalog Management API Backend** is a service built using **NestJS**, **MySQL**, and **TypeORM**, designed to handle catalog metadata management for clients. It provides endpoints for creating, updating, deleting, and querying catalogs, supports multi-locale filtering, and automates catalog indexing.

This documentation covers the backend service in depth, including its architecture, entities, setup, and deployment instructions.

---

## Technology Stack

- **NestJS**: Backend framework for building efficient and scalable server-side applications.
- **MySQL**: Relational database for data persistence.
- **TypeORM**: ORM for database interaction.
- **Docker**: For containerizing the application and its dependencies.

---

## Entities Overview

### 1. **Catalog**
Represents a collection of metadata about a client's products.

| Field         | Type               | Description                                   |
|---------------|--------------------|-----------------------------------------------|
| `id`          | PrimaryGeneratedColumn | Unique identifier for the catalog.       |
| `name`        | String             | Catalog name, must not be empty.             |
| `vertical`    | Enum (`fashion`, `home`, `general`) | Product type.                |
| `primary`     | Boolean            | Marks the catalog as primary for its vertical.|
| `locales`     | JSON Array         | List of locales supported by the catalog.    |
| `indexedAt`   | Timestamp          | Time of the last indexing process.           |
| `updatedAt`   | Timestamp          | Time of the last updating process.           |
| `client`      | Many-to-One (Client)| Reference to the associated client.         |

---

### 2. **Client**
Represents a client who owns catalogs.

| Field         | Type               | Description                                   |
|---------------|--------------------|-----------------------------------------------|
| `id`          | PrimaryGeneratedColumn | Unique identifier for the client.        |
| `name`        | String             | Client name.                                 |
| `createdAt`   | Timestamp          | Time of client creation.                     |
| `updatedAt`   | Timestamp          | Time of the last update.                     |

---

### 3. **User**
Represents an authenticated user with access to the system.

| Field         | Type               | Description                                   |
|---------------|--------------------|-----------------------------------------------|
| `id`          | PrimaryGeneratedColumn | Unique identifier for the user.          |
| `username`    | String             | User's unique username.                      |
| `email`       | String             | User's email address.                        |
| `password`    | String (Hashed)    | User's hashed password.                      |
| `client`      | Many-to-One (Client)| Reference to the associated client.         |

---

## Key Features

1. **CRUD Operations for Catalogs**:
   - Create, read, update, and delete catalogs.
   - Bulk deletion supported.

2. **Filtering and Searching**:
   - Filter catalogs by name and multi-locale status.

3. **Indexing Process**:
   - Manual indexing of selected catalogs.
   - Automated daily indexing for all catalogs.

4. **Primary Catalog Management**:
   - Ensures only one catalog per vertical can be marked as primary.

---

## Directory Structure

```plaintext
├── syte_catalogs_list_backend/
│   ├── src/
│   │   ├── auth/                # Authentication module
│   │   ├── catalog/             # Catalog module with services and controllers
│   │   ├── client/              # Client module
│   │   ├── seeder/              # Database seeder
│   │   ├── app.module.ts        # Main module
│   │   └── main.ts              # Application entry point
│   ├── test/                    # Test cases
│   ├── wait-for-it.sh           # MySQL readiness script
├── syte_catalogs_list_frontend/ # Frontend folder
├── Dockerfile                   # Dockerfile for the backend service
├── docker-compose.yml           # Docker Compose file
├── .env 
```

---

## Installation and Setup

### Prerequisites

- **Docker** and **Docker Compose** installed.

---

### Environment Variables

Create a `.env` file in the root folder containig `syte_catalogs_list_backend` with the following content:

```plaintext
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=user
DB_PASSWORD=1234
DB_NAME=syte_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
PORT=8001
```

---

### MySQL Readiness Script

The `wait-for-it.sh` script ensures the backend waits for the MySQL service to be ready before starting. Place this file in the `syte_catalogs_list_backend` directory.

```bash
#!/bin/sh
set -e
host="$1"
shift
until mysqladmin ping -h "$host" --silent; do
  echo "Waiting for MySQL to be ready..."
  sleep 2
done
exec "$@"
```

Make it executable:
```bash
chmod +x syte_catalogs_list_backend/wait-for-it.sh
```

---

### Build and Run

#### Docker Setup
The project is fully Dockerized for simplicity. Use the following commands:

   1. Navigate to the root directory containing `docker-compose.yml`.
   2. Build and run the services:
      ```bash
      docker-compose up --build
      ```
   3. Access the backend API at `http://localhost:8001`.

#### Backend Service Dockerfile
The backend's `Dockerfile` ensures proper environment setup.

```dockerfile
# Use Node.js as the base image
FROM node:18-alpine

# Install MySQL client for wait-for-it.sh
RUN apk add --no-cache mysql-client

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Add a wait-for-it script for database readiness
COPY wait-for-it.sh /usr/bin/
RUN chmod +x /usr/bin/wait-for-it.sh

# Expose the application port
EXPOSE 8001

# Run seeder and start the application
CMD ["sh", "-c", "wait-for-it.sh mysql -- npm run seed && npm run start:prod"]

```

---

### Database Setup

The backend automatically connects to the MySQL database defined in `docker-compose.yml`. The MySQL service inside the Docker network listens on port `3306`, but it is exposed on port `3307` for external access. Follow the steps below to ensure database readiness:

1. **Verify MySQL Service**:
   - Inside the Docker network, the backend communicates with MySQL using port `3306`.
   - For external access (e.g., local tools or testing), use port `3307`.

2. **Run TypeORM Migrations**:
   To set up the schema, apply the TypeORM migrations:
   ```bash
   docker exec -it <backend-container-name> npm run typeorm migration:run
   ```
   Replace `<backend-container-name>` with the actual name of your backend container (e.g., `syte_catalogs_list_backend_backend_1`).

---

### Key Notes:
- If you're connecting to MySQL from outside Docker (e.g., via a database client), use `localhost:3307`.
- Ensure the `.env` file's `DB_HOST` is set to `mysql` for Docker-based communication within the network.

## Backend Services
### Authentication Flow

#### Login Endpoint:
Users authenticate by providing valid credentials (username/email and password).

- **Endpoint**:
  - **Path**: `/auth/login`
  - **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "username": "testuser",
    "accessToken": "jwt_token_here"
  }
  ```
The `accessToken` is a signed JWT token that includes claims like `sub` (user ID) and `clientId`.

---

#### Protected Endpoints:
All catalog endpoints (`/catalogs`) are protected by the `JwtAuthGuard`.

Clients must include the token in the `Authorization` header:
```plaintext
Authorization: Bearer <access_token>
```

---

#### JWT Structure:
The JWT token payload includes:
- `sub`: User ID.
- `clientId`: The associated client’s ID.
- `email`: User email.

**Example Payload**:
```json
{
  "sub": 1,
  "email": "user@example.com",
  "clientId": 10,
  "iat": 1690073400,
  "exp": 1690077000
}
```

---

#### Error Scenarios:
**401 Unauthorized**:
- Missing or invalid JWT token:
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized"
  }
  ```

### Catalog Service
Provides catalog CRUD operations, filtering, and indexing functionalities.

- **Create Catalog**:
  - Automatically resolves primary conflicts.
- **Filter Catalogs**:
  - By name (`LIKE`) or multi-locale (`JSON_LENGTH`).

### Client Service
Manages client-related data.

### Auth Service
Handles user authentication and token management using **JWT**.

---

## Automated Tasks

### Indexing Task
Automated indexing of all catalogs occurs daily at midnight using the **NestJS Scheduler**.

```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async handleIndexing(): Promise<void> {
  const currentTimestamp = new Date();
  await this.catalogRepository.update({}, { indexedAt: currentTimestamp });
  this.logger.log('Catalogs indexed successfully.');
}
```

---

## Deployment Guide

### For Local Development

Follow these steps to set up the backend for local development:

1. **Clone the Repository**  
   Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the Backend Directory**  
   Change to the `syte_catalogs_list_backend` folder:
   ```bash
   cd syte_catalogs_list_backend
   ```

3. **Create Environment Variables File**  
   Create a `.env` file inside the `syte_catalogs_list_backend` directory with the following content:

   ```plaintext
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3307
   DB_USERNAME=<fill your data>
   DB_PASSWORD=<fill your data>
   DB_NAME=<fill your data>

   # JWT Configuration
   JWT_SECRET=<fill your data>
   JWT_EXPIRATION=1h

   # Application Port
   PORT=8001
   ```

4. **Start Services with Docker Compose**  
   From the root directory (where the `docker-compose.yml` file is located), build and start the services:
   ```bash
   docker-compose up --build
   ```

5. **Access the Backend**  
   Once the services are running, the backend API will be accessible at:  
   ```plaintext
   http://localhost:8001
   ```

---

### Additional Notes

- **Database Access**: 
  - MySQL runs inside the Docker network on port `3306`.
  - For external access (e.g., database clients), use `localhost:3307`.
- **Verify Migration**: 
  Ensure database migrations are applied by running:
  ```bash
  docker exec -it <backend-container-name> npm run typeorm migration:run
  ```
  Replace `<backend-container-name>` with your actual backend container name.

Let me know if you need further updates or additions!

## API Endpoints

### Catalog Endpoints

Below are the elaborated details of each endpoint, including the required inputs and their significance.

---

#### **1. Create Catalog**
- **Method**: `POST`
- **Path**: `/catalogs`
- **Description**: Creates a new catalog for the authenticated user's client.
- **Inputs**:
  - **Body** (JSON):
    ```json
    {
      "name": "Catalog Name",       // String: Name of the catalog (letters only, required).
      "vertical": "fashion",        // String: Vertical type (fashion, home, general).
      "locales": ["en_US", "es_ES"], // Array of Strings: Locales supported by the catalog.
      "primary": true               // Boolean: Indicates if this is the primary catalog for the vertical.
    }
    ```
  - **Headers**:
    - **Authorization**: Bearer token (JWT) for authentication.
- **Process**:
  - Validates the name and vertical values.
  - Ensures only one catalog per vertical is marked as primary.
  - Associates the catalog with the authenticated user's client.
- **Response**:
  - **201 Created**:
    ```json
    {
      "id": 1,
      "name": "Catalog Name",
      "vertical": "fashion",
      "locales": ["en_US", "es_ES"],
      "primary": true,
      "indexedAt": null,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```

---

#### **2. Update Catalog**
- **Method**: `PUT`
- **Path**: `/catalogs/:id`
- **Description**: Updates an existing catalog's details for the authenticated user's client.
- **Inputs**:
  - **Path Parameters**:
    - `id`: The unique ID of the catalog to update.
  - **Body** (JSON):
    ```json
    {
      "name": "Updated Name",        // String: New catalog name (optional).
      "locales": ["en_CA", "fr_FR"], // Array of Strings: Updated list of locales (optional).
      "primary": true                // Boolean: Updated primary status (optional).
    }
    ```
  - **Headers**:
    - **Authorization**: Bearer token (JWT) for authentication.
- **Process**:
  - Checks if the catalog exists and belongs to the client's ID.
  - Resolves primary catalog conflicts if the catalog is being marked as primary.
  - Updates the `indexedAt` timestamp if the catalog's vertical or primary status changes.
- **Response**:
  - **200 OK**:
    ```json
    {
      "id": 1,
      "name": "Updated Name",
      "vertical": "fashion",
      "locales": ["en_CA", "fr_FR"],
      "primary": true,
      "indexedAt": "timestamp"
    }
    ```

---

#### **3. Delete Catalog**
- **Method**: `DELETE`
- **Path**: `/catalogs/:id`
- **Description**: Deletes a catalog by ID for the authenticated user's client.
- **Inputs**:
  - **Path Parameters**:
    - `id`: The unique ID of the catalog to delete.
  - **Headers**:
    - **Authorization**: Bearer token (JWT) for authentication.
- **Process**:
  - Checks if the catalog exists and belongs to the client's ID.
  - Deletes the catalog.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Catalog deleted successfully"
    }
    ```

---

#### **4. Bulk Delete**
- **Method**: `POST`
- **Path**: `/catalogs/bulk_delete`
- **Description**: Deletes multiple catalogs for the authenticated user's client.
- **Inputs**:
  - **Body** (JSON):
    ```json
    {
      "ids": [1, 2, 3] // Array of Numbers: IDs of catalogs to delete.
    }
    ```
  - **Headers**:
    - **Authorization**: Bearer token (JWT) for authentication.
- **Process**:
  - Validates the list of catalog IDs.
  - Checks if all catalogs belong to the client's ID.
  - Deletes the catalogs in bulk.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Catalogs deleted successfully",
      "deletedCount": 3
    }
    ```

---

#### **5. Manual Indexing**
- **Method**: `POST`
- **Path**: `/catalogs/index_selected`
- **Description**: Manually indexes selected catalogs for the authenticated user's client by updating their `indexedAt` timestamp.
- **Inputs**:
  - **Body** (JSON):
    ```json
    {
      "ids": [1, 2] // Array of Numbers: IDs of catalogs to index.
    }
    ```
  - **Headers**:
    - **Authorization**: Bearer token (JWT) for authentication.
- **Process**:
  - Validates the list of catalog IDs.
  - Updates the `indexedAt` timestamp for each catalog.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "Catalogs indexed successfully",
      "indexedCatalogs": [
        { "id": 1, "indexedAt": "timestamp" },
        { "id": 2, "indexedAt": "timestamp" }
      ]
    }
    ```

---

#### **6. Index All Catalogs**
- **Method**: `POST`
- **Path**: `/catalogs/index_all`
- **Description**: Indexes all catalogs for all clients by updating their `indexedAt` timestamp.
- **Inputs**:
  - None.
  - **Headers**:
    - **Authorization**: Bearer token (JWT) for authentication.
- **Process**:
  - Updates the `indexedAt` timestamp for all catalogs in the database.
- **Response**:
  - **200 OK**:
    ```json
    {
      "message": "All catalogs have been indexed successfully"
    }
    ```

---

#### **7. Get Catalogs**
- **Method**: `GET`
- **Path**: `/catalogs`
- **Description**: Retrieves a filtered list of catalogs.
- **Inputs**:
  - **Query Parameters**:
    - `name` (optional): Filters catalogs containing this substring in their name.
    - `multiLocale` (optional): Filters catalogs with more than one locale (`true` or `false`).
  - **Headers**:
    - **Authorization**: Bearer token (JWT) for authentication.
- **Response**:
  - **200 OK**:
    ```json
    [
      {
        "id": 1,
        "name": "Catalog Name",
        "vertical": "fashion",
        "locales": ["en_US", "es_ES"],
        "primary": true,
        "multiLocale": true,
        "indexedAt": "timestamp"
      }
    ]
    ```


## Conclusion

This concludes the documentation for the Catalog Management API Backend. The API provides robust features for managing catalog metadata with secure authentication, powerful filtering, and automated tasks like indexing. Feel free to reach out or contribute if you encounter any issues or have suggestions.

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit and push your changes.
4. Submit a pull request for review.

## Support

If you have any questions or need help, feel free to open an issue in the repository or contact the maintainer at yonivid@gmail.com.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
