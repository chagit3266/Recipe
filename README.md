# 🍽️ Recipe – Backend API (MongoDB)

Backend (server-side only) API for managing recipes, built with Node.js and MongoDB.

---

## ✅ What this API supports

### Recipes
- Create new recipes (supports multiple recipe fields/types based on the project logic)
- Get recipes (list + single recipe)
- Update recipe details
- Delete recipes (**permission-based**: deletion is allowed only for authorized users)

### Authorization & Access Control
- Protected actions are guarded by authorization middleware
- Sensitive operations (e.g., delete / edit) require valid permissions

### Database
- MongoDB is used as the main database for storing recipes and related data

---

## 📁 High-Level Structure

- Routes: API endpoints definition
- Controllers/Services: business logic
- Models: MongoDB schemas/models
- Middlewares: validation + authorization

---

