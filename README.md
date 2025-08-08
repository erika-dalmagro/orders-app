# Orders App

A full-stack web application for managing restaurant orders (tabs), built with:

- **Backend**: Go (Golang)
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **API Communication**: Axios

## Features

- Create and manage customer orders (tabs)
- Assign products to each order
- Track and update order status (open, in progress, closed)
- Manage available products
- Manage and track which seats (tables or positions) are occupied or available
- Automatically free up seats when an order is closed

## Tech Stack

| Layer    | Stack                       |
| -------- | --------------------------- |
| Frontend | React + TypeScript + Vite   |
| Styling  | Tailwind CSS                |
| Backend  | Go (net/http + Gorilla Mux) |
| API Comm | REST + Axios                |
| Database | PostgreSQL / SQLite (TBD)   |

## Getting Started

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```

2.  **Install dependencies:**
    ```sh
    go mod tidy
    ```

4.  **Run the backend server:**
    ```sh
    go run main.go
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run server:**
    ```sh
    npm run dev
    ```
    
### Mobile Setup

1.  **Navigate to the mobile directory:**
    ```sh
    cd mobile
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Configure Environment Variables:**
    * Create a `.env` file by copying the example file .env.example


4.  **Start the development server:**
    ```sh
    npx expo start
    ```

---

Good coding!
