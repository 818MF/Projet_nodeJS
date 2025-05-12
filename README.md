# Favorite Movies API

A RESTful API for managing favorite movies with user authentication and TMDB integration.

## Features

- User authentication (register, login, logout)
- JWT-based authentication
- TMDB API integration for movie search and details
- CRUD operations for favorite movies
- RabbitMQ for notifications
- MongoDB for data storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- RabbitMQ
- TMDB API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/favorite-movies
   JWT_SECRET=your_jwt_secret_key_here
   TMDB_API_KEY=your_tmdb_api_key_here
   RABBITMQ_URL=amqp://localhost
   ```
4. Start MongoDB and RabbitMQ services
5. Run the application:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Movies

- `GET /api/movies/search?query=<search_term>` - Search movies on TMDB
- `GET /api/movies` - Get all favorite movies
- `POST /api/movies` - Add movie to favorites
- `PUT /api/movies/:id` - Update movie note or rating
- `DELETE /api/movies/:id` - Remove movie from favorites

## Testing

Use the provided `api.rest` file with the REST Client extension in VS Code to test the API endpoints.

## Error Handling

The API includes comprehensive error handling for:

- Authentication errors
- Duplicate movie entries
- Invalid input data
- TMDB API errors
- Database errors

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Input validation using express-validator
- Secure password requirements
