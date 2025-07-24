# CodeSphere: Your All-in-One Collaborative Coding Platform

CodeSphere is a versatile, web-based learning and coding platform designed for students, educators, and developers. Create collaborative coding rooms, tackle programming challenges, and build projects in multiple languages—all from your browser.

## Key Features

*   **Interactive Code IDE**: A powerful in-browser editor with support for multiple languages.
*   **Real-time Collaboration**: Share a link and code with others in real-time.
*   **Project Rooms**: Teachers or hosts can create rooms with coding challenges, quizzes, and interactive pages to guide users.
*   **File Storage**: Upload and manage project files directly within the platform.
*   **Custom Test Cases**: Validate coding challenge submissions with custom input/output tests.
*   **User Profiles**: Customize your profile with a bio and avatar.

---

## Getting Started: Local Development

To run CodeSphere on your local machine, you'll need to set up the frontend client and the backend server separately.

### 1. Prerequisites

*   [Node.js](https://nodejs.org/en/) (v16 or higher)
*   [npm](https://www.npmjs.com/)
*   A local or cloud-based MongoDB instance.

### 2. Backend Server (`codesphere_server`)

The server handles API requests, user authentication, and the real-time collaboration sockets.

1.  **Navigate to the server directory:**
    ```bash
    cd codesphere_server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the `codesphere_server` directory and add the following variables.

    ```env
    # The port for the backend server to run on
    PORT=3001

    # The origin URL of the frontend client
    ORIGIN=http://localhost:3000

    # Your MongoDB connection string (local or from Atlas)
    MONGO_IP=mongodb://localhost:27017/codesphere
    MONGO_DBNAME=codesphere

    # A secret key for signing JSON Web Tokens
    JWT_SECRET=your-super-secret-key
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    The server should now be running on `http://localhost:3001`.

### 3. Frontend Client (`codesphere_client`)

The client is a React application that provides the user interface.

1.  **Navigate to the client directory:**
    ```bash
    cd codesphere_client
    ```
2.  **Install dependencies:**
```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the `codesphere_client` directory and add the following:

    ```env
    # The URL of your running backend server
    REACT_APP_API_URL=http://localhost:3001
    ```

4.  **Start the client:**
    ```bash
    npm start
    ```
    Your browser should open to `http://localhost:3000` with the application running.

---

## Deployment

This project is configured for a modern, serverless deployment workflow.

*   **Backend**: Deploy the `codesphere_server` directory to [Render](https://render.com/).
*   **Frontend**: Deploy the `codesphere_client` directory to [Vercel](https://vercel.com/).
*   **Database**: Use a free-tier cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Deployment Environment Variables

When deploying, be sure to set the following environment variables in your hosting provider's dashboard:

**On Render (for the backend):**

*   `MONGO_IP`: Your full MongoDB Atlas connection string.
*   `MONGO_DBNAME`: The name of your database (e.g., `codesphere`).
*   `JWT_SECRET`: A securely generated secret key.
*   `ORIGIN`: The final production URL of your Vercel frontend.

**On Vercel (for the frontend):**

*   `REACT_APP_API_URL`: The production URL of your Render backend.
*   `NODE_OPTIONS`: `--openssl-legacy-provider` (to ensure compatibility with older build tools).

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)