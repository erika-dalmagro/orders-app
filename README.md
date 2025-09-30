# Orders App

A web application for managing restaurant orders (tabs), built with:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Go
- **Styling**: Tailwind CSS
- **API Communication**: REST + Axios
- **Database**: PostgreSQL

## Features

- Create and manage customer orders (tabs)
- Assign products to each order
- Track and update order status (open, in progress, closed)
- Manage available products
- Manage and track which seats (tables or positions) are occupied or available
- Automatically free up seats when an order is closed


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
