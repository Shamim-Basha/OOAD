# OOAD
E-commerce webapp project using Java Spring-boot and React.js

- **Frontend**: React.js
- **Backend**: Spring Boot

---

## 📁 Folder Structure

```
project-root/
│
├── Frontend/            # React.js frontend application
│   ├── public/
│   ├── src/
│   └── ...
│
├── Backend/             # Spring Boot backend application
│   ├── src/
│   ├── pom.xml
│   └── ...
│
└── README.md          
```

---

## 🛠️ Prerequisites

Make sure you have the following installed:

### Backend (Spring Boot)
- Java 17+
- Maven 3.8+
- (Optional) IDE: IntelliJ IDEA / Eclipse

### Frontend (React.js)
- Node.js (v18+)
- npm (v9+) or yarn

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Shamim-Basha/OOAD.git
cd OOAD
```

---

## 🔙 Backend Setup (Spring Boot)

### 📦 Install Dependencies

```bash
cd Backend
mvn clean install
```

### ▶️ Run the Backend

```bash
mvn spring-boot:run
```

- The backend will run at: `http://localhost:8080`

---

## 🌐 Frontend Setup (React.js)

### 📦 Install Dependencies

```bash
cd Frontend
npm install
```

Or using yarn:

```bash
yarn install
```

### ▶️ Run the Frontend

```bash
npm start
```

Or:

```bash
yarn start
```

- The React app will be available at: `http://localhost:3000`

---

## 🧪 Running Tests

### Backend

```bash
cd Backend
mvn test
```

### Frontend

```bash
cd Frontend
npm test
```

Or:

```bash
yarn test
```

---

## ⚙️ Build for Production

### Frontend

```bash
cd Frontend
npm run build
```

The optimized production build will be in the `Frontend/build/` folder.

### Backend

```bash
cd Backend
mvn package
```

The compiled `.jar` file will be in the `Backend/target/` directory.

---

## 📬 Contact

Have questions or issues? Open an issue on the repository.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
