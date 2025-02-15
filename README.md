# ChadChat Backend

This is the backend for ChadChat, a chat application. The backend is built using Node.js, Express.js, MongoDB, Socket.io.

## Technologies Used

- **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for storing chat data.
- **dotenv**: Module to load environment variables from a `.env` file.
- **Socket.io**: Library for real-time web applications.
- **Twilio**: Cloud communications platform for phone calls.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- MongoDB Atlas account or a local MongoDB server.
- Twilio account for phone call functionality.

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/MrWinRock/chadchat-backend.git
    cd chadchat_backend
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/1) file in the root directory and add your MongoDB URI and Twilio credentials:
    ```env
    MONGODB_URI=mongodb+srv://<username>:<password>@chadchatdb.gly67.mongodb.net/?retryWrites=true&w=majority&appName=ChadChatDB
    ```

4. Start the server:
    ```sh
    npm start
    ```

### Usage

The backend server will be running at `http://localhost:5000`. It connects to the MongoDB database specified in the [.env](http://_vscodecontentref_/2) file.

### Project Structure
