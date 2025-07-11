# Architek - Architecture Community Platform

Architek is a modern web platform that brings together architects from around the world to share their ideas, projects, and knowledge. The platform facilitates collaboration and inspiration within the architectural community.

## Features

- **Article Publishing**: Architects can create and publish articles about their projects and insights
- **User Profiles**: Dedicated profiles for architects to showcase their work
- **Interactive Community**: Comment system for engaging discussions
- **Responsive Design**: Fully responsive interface that works on all devices
- **Image Management**: Support for uploading and managing project images
- **Search Functionality**: Search through articles and architect profiles
- **Authentication**: Secure login and registration system

## Technology Stack

### Frontend
- Angular (Latest Version)
- TypeScript
- HTML5/CSS3
- Bootstrap for responsive design
- Tabler Icons for iconography

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Angular CLI

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd architek
```

2. Install Backend Dependencies:
```bash
cd backend
npm install
```

3. Install Frontend Dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/architek
```

### Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the Backend Server:
```bash
cd backend
node server.js
```

3. Start the Frontend Development Server:
```bash
cd frontend
ng serve
```

The application will be available at `http://localhost:4200`

## Project Structure

```
architek/
├── frontend/           # Angular frontend application
│   ├── src/
│   │   ├── app/       # Application components
│   │   ├── assets/    # Static assets
│   │   └── ...
│   └── ...
└── backend/           # Node.js/Express backend
    ├── config/        # Configuration files
    ├── models/        # MongoDB models
    ├── routes/        # API routes
    ├── uploads/       # Image uploads
    └── ...
```

## API Endpoints

- `/user` - User management
- `/architect` - Architect profiles
- `/article` - Article management
- `/comment` - Comment system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All the architects contributing to the platform
- The open-source community for the tools and libraries used
- Contributors and maintainers

---

For more information or support, please open an issue in the repository.
# final-pfe
