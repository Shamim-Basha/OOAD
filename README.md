# OOAD

E-commerce webapp project using Java Spring-boot and React.js

- **Frontend**: React.js
- **Backend**: Spring-Boot

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

- Java 24 (17+)
- (Optional) IDE: IntelliJ IDEA / Eclipse

### Frontend (React.js)

- Node.js
- npm or yarn

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

```
./mvnw spring-boot:run
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
./mvnw spring-boot:test
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
./mvnw package
```

The compiled `.jar` file will be in the `Backend/target/` directory.

---

## 🌿 Working with Git Branches

To work on a new feature or fix, follow these steps:

### 1️⃣ Create a New Branch

```bash
git checkout -b your-branch-name
```

> Replace `your-branch-name` with a descriptive name like `feature/login-page` or `bugfix/api-error`.

### 2️⃣ Make Changes and Commit

```bash
git add .
git commit -m "Your descriptive commit message"
```

### 3️⃣ Push the Branch to Remote

```bash
git push origin your-branch-name
```

### 4️⃣ Create a Pull Request

Go to your Git repository on GitHub/GitLab and create a **Pull Request (PR)** from your new branch to the `main` or `develop` branch.

---

## 📬 Contact

Have questions or issues? Open an issue on the repository.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
