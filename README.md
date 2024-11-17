# Video API Project

## Overview

This project is a **Video API System** that provides functionalities for:

1. Uploading videos with configurable limits on size and duration.
2. Trimming uploaded videos based on user input.
3. Merging multiple video clips into a single video.
4. Sharing videos via links with time-based expiry.
5. Serving videos either as streams or direct downloads.

The project is built using following tech:

- Node.js
- Express
- SQLite
- ffmpeg

---

## Requirements

- **Node.js**: `^22.11.0`
- **FFmpeg**: Must be installed and available in the system's PATH.

---

## Assumptions and Design Choices

1. **Static API Tokens**:
   - A static token is used for authentication for simplicity (`Bearer your-static-api-token`).

2. **File Storage**:
   - Video files are stored locally in the `uploads/` directory. For production, a cloud storage solution (e.g., AWS S3) should be used.

3. **Video Processing**:
   - Requires **FFmpeg** for video operations (trimming, merging, etc.).

4. **Database**:
   - **SQLite** is used for easy setup. For production, a scalable database like PostgreSQL or MySQL is recommended.

5. **Testing**:
   - Tests use test dataset, ensuring no mocks are used in e2e tests.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/MKoriya/VideoVerse.git
cd VideoVerse
```

### 2. Install Dependencies

```bash
npm install
```

## Commands

### Run the Server

```bash
npm start
```

The server will be available at `http://localhost:3000`.

### Run in Development Mode

```bash
npm run dev
```

This uses `nodemon` to restart the server automatically during development.

### Run Tests

```bash
npm run test
```

### View Test Coverage

```bash
npm run test:coverage
```

---

## Database Schema Design

### 1. **Videos Table**

This table stores information about video files uploaded to the system.

| Column Name   | Data Type   | Constraints          | Description                     |
|---------------|-------------|----------------------|---------------------------------|
| `id`          | `int`       | Primary Key, Auto Increment | Unique identifier for the video. |
| `filePath`    | `text`      | Not Null            | Path to the video file in storage. |
| `size`        | `float`     | Not Null            | Size of the video file (in MB). |
| `duration`    | `int`       | Not Null            | Duration of the video (in seconds). |
| `uploadedAt`  | `datetime`  | Default: `CURRENT_TIMESTAMP` | Timestamp of when the video was uploaded. |

### 2. **Shared Links Table**

This table manages sharing links for videos, allowing users to share videos with unique URLs and expiration times.

| Column Name   | Data Type   | Constraints          | Description                     |
|---------------|-------------|----------------------|---------------------------------|
| `id`          | `int`       | Primary Key, Auto Increment | Unique identifier for the shared link. |
| `videoId`     | `int`       | Not Null, Foreign Key | Links to the associated video in the `videos` table. |
| `slug`        | `text`      | Not Null, Unique     | Unique slug for the shared link. |
| `expiresAt`   | `datetime`  | Not Null            | Timestamp for when the link will expire. |
| `createdAt`   | `datetime`  | Default: `CURRENT_TIMESTAMP` | Timestamp of when the shared link was created. |

### ER Diagram

```plaintext
+------------+       +------------------+
|   Videos   |       |   Shared Links   |
+------------+       +------------------+
| id         |<----->| videoId          |
| filePath   |       | id               |
| size       |       | slug             |
| duration   |       | expiresAt        |
| uploadedAt |       | createdAt        |
+------------+       +------------------+
```

---

## Postman Collection

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/23755125-606bc6ed-eff3-447d-8c44-bc2185fed4c9?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D23755125-606bc6ed-eff3-447d-8c44-bc2185fed4c9%26entityType%3Dcollection%26workspaceId%3D397b6b75-3409-42e2-97a2-dd349919596a)

Note: Add Authorization api token to collection before trying out the apis

---

## References

- <https://www.npmjs.com/package/fluent-ffmpeg>

- <https://www.ffmpeg.org/>

- <https://www.sqlite.org/>

- <https://www.npmjs.com/package/jest>

---

## Future Enhancements

1. **Token-Based Authentication**:
   - Replace static tokens with JWT or OAuth for better security.

2. **Cloud Storage**:
   - Use AWS S3 or Google Cloud Storage for scalability.

3. **Video Processing Queue**:
   - Offload video processing tasks to a job queue (e.g., Bull, RabbitMQ).

4. **Caching**:
   - Use Redis for caching shared link metadata.

---
