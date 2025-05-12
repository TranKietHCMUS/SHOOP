# SHOOP Project
## Overview
An application that helps users find the best places to buy all their groceries and even suggests an optimal route to purchase everything efficiently.

## Project Structure
The project is organized into three main components:
- `backend/`: Contains the Python-based backend application (likely using Flask or a similar framework) that serves the API.
- `frontend/`: Contains the React-based frontend application built with Vite, providing the user interface.
- `pipeline/`: Contains the data pipeline setup, likely using Apache Airflow and Docker for orchestrating data workflows.

## Technologies Used
- **Backend**: Python, Flask
- **Frontend**: React, Vite, JavaScript, Tailwind CSS, ESLint
- **Data Pipeline**: Apache Airflow, Docker
- **Databases**: MongoDB Atlas , Redis
- **Other Tools**: Docker Compose, Git

## Installation

### Prerequisites
- [Python](https://www.python.org) for backend development
- [Node.js and npm](https://nodejs.org/en/download/) for frontend development.
- [Docker and Docker Compose](https://docs.docker.com/get-docker/) for running services and the data pipeline.

### 1. Backend Setup
The backend is a Python application.
1. **Navigate to the backend directory:**
```bash
cd backend
```
2. **Create and activate Conda environment:**
If you have an `environment.yml` file (as suggested in the original root README):
```bash
conda env create -f environment.yml
conda activate grab-test
```
3. **Install dependencies:**
```bash
pip install -r requirements.txt
```
4. **Environment Variables:**
Create a `.env` file in the `backend/` directory. This file will contain necessary configurations like database connection strings, API keys, etc.
5. **Run the backend application:**
```bash
python app.py
```
The backend API should now be running, typically on a local port like `3000`.
### 2. Frontend Setup
The frontend is a React application built with Vite.
1. **Navigate to the frontend directory:**
```bash
cd frontend
```
2. **Install dependencies:**
```bash
npm install
```
3. **Environment Variables:**
Create a `.env` file in the `Frontend/` directory. This file will contain necessary configurations like database connection strings, API keys, etc.
4. **Run the frontend development server:**
```bash
npm run dev
```
This will start the Vite development server, usually accessible at `http://localhost:5173` (or another port specified by Vite).

### 3. Data Pipeline Setup (Airflow)
The data pipeline uses Docker Compose and Apache Airflow.
1. **Navigate to the pipeline directory:**
```bash
cd pipeline
```
2. **Build and run the Airflow services using Docker Compose:**
```bash
docker-compose up -d --build
```
3. **Access Airflow UI:**
Once the services are up, you can typically access the Airflow web UI at `http://localhost:8080` (or the port configured in your `docker-compose.yaml`).
