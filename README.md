# Express EJS 🚀

## Introduction
A robust web application boilerplate using Express.js and EJS template engine, featuring multi-cloud storage support, security, and logging capabilities.

## Features

### Template Engine
- EJS 3.1.10 integration
- Layout system
- Dynamic page rendering

### File Upload System
- Multi-cloud storage support:
    - AWS S3
    - Azure Blob Storage
    - Google Cloud Storage
    - Naver Cloud Platform
    - Local storage

- Automatic MIME type detection
- File size limits
- Custom path configuration

### Security Features
- Helmet.js integration
- CORS enabled
- Rate limiting
- Speed limiting
- Session management (FileStore)
- Compression support

### Advanced Logging
- Winston logger with daily rotation
- Morgan HTTP request logging
- Environment-specific log files

## Project Structure
```
express-ejs/
├── bin/
│   └── www                # Application entry point
├── modules/               # Reusable modules
│   ├── logger.js          # Logging system
│   ├── db.js              # Database connection
│   └── uploaders.js       # File upload handling
├── middleware/            # Middleware
│   ├── accessLogger.js    # Access logging
│   ├── routerLoader.js    # Dynamic router loading
│   └── responseHandler.js # Response handling
├── public/                # Static files
│   └── uploads/           # Uploaded files
├── routes/                # Routers
├── views/                 # EJS templates
└── sessions/              # Session storage
```

## Prerequisites
- Node.js >= 14.x
- npm >= 6.x

## Installation
```shell
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env
```

## Running the Application

### Development Mode
```shell
pm2 start ecosystem.config.js --only express-ejs/development
```

### Production Mode
```shell
pm2 start ecosystem.config.js --only express-ejs/production
```

## Configuration
Configure the following in your file: `.env`
```
# Storage Configuration
STORAGE_TYPE=local  # local, s3, azure, gcp, ncp

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your_bucket_name

# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER=your_container_name

# GCP Storage Configuration
GCP_BUCKET=your_bucket_name
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# NCP Storage Configuration
NCP_ACCESS_KEY=your_access_key
NCP_SECRET_KEY=your_secret_key
NCP_BUCKET=your_bucket_name

# Session Configuration
SESSION_SECRET=your_session_secret

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=your_database
```

## File Upload Usage
```javascript
const { uploader } = require('./modules/uploaders');

// Single file upload
router.post('/upload', 
    uploader.profile.single('avatar'),
    (req, res) => {
        res.json({ url: req.file.location });
    }
);

// Multiple file upload
router.post('/upload-multiple',
    uploader.product.array('photos', 5),
    (req, res) => {
        const urls = req.files.map(file => file.location);
        res.json({ urls });
    }
);
```

## Core Features
The following features are integrated:
- Dynamic Router Loading
- Database Connection Pool
- Compression (compression)
- Rate Limiting (express-rate-limit)
- Speed Limiting (express-slow-down)
- Session Management (express-session)
- CORS Protection
- Helmet Security Headers
- Response Handling

## Logging
Logs are automatically rotated daily and stored in the `logs` directory:
- Access logs
- Error logs
- Application logs

## Future Enhancements
- HTTPS support via Nginx
- Passport.js authentication
- Caching layer
- Custom authentication/authorization

## Contributing
Contributions are always welcome! Feel free to submit a Pull Request.

## License
This project is licensed under the UNLICENSE.

## Dependencies
```json
{
  "bcrypt": "^6.0.0",
  "compression": "^1.8.0",
  "cookie-parser": "~1.4.4",
  "cors": "^2.8.5",
  "debug": "~2.6.9",
  "dotenv": "^16.5.0",
  "ejs": "3.1.10",
  "express": "5.1.0",
  "express-rate-limit": "^7.5.0",
  "express-session": "^1.18.1",
  "express-slow-down": "^2.1.0",
  "express-validator": "^7.2.1",
  "helmet": "^8.1.0",
  "http-errors": "~1.6.3",
  "morgan": "~1.9.1",
  "multer": "^2.0.0",
  "mysql2": "^3.14.1",
  "session-file-store": "^1.5.0",
  "winston": "^3.17.0",
  "winston-daily-rotate-file": "^5.0.0"
}
```