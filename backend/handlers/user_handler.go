package handlers

import (
	"Device-t/backend/models"
	"Device-t/backend/services"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type UserHandler struct {
	Service *services.UserService
}

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
    Email    string `json:"email"`
    Phone    string `json:"phone"`
    Role     string `json:"role"`
	Address  string `json:"address"`
}

type OTPRequest struct {
    Token string `json:"token"`
    OTP   string `json:"otp"`
}

// Login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request, jwtSecret string) {
	var creds Credentials
	json.NewDecoder(r.Body).Decode(&creds)

	token, err := h.Service.Login(creds.Email, creds.Password, jwtSecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// Get all users
func (h *UserHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.Service.GetAllUsers()
	if err != nil {
		http.Error(w, "Failed to get users", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(users)
}

// Update user
func (h *UserHandler) EditUser(w http.ResponseWriter, r *http.Request) {
	var u models.User
	json.NewDecoder(r.Body).Decode(&u)

	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	u.ID = id

	if err := h.Service.UpdateUser(&u); err != nil {
		http.Error(w, "Failed to update user", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "User updated successfully"})
}

// Delete user
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	if err := h.Service.DeleteUser(id); err != nil {
		http.Error(w, "Failed to delete user", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
}

func (h *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "logged out"})
}
// Đăng ký (tạo OTP + gửi mail)
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Dữ liệu không hợp lệ", http.StatusBadRequest)
		return
	}

	token, err := h.Service.RegisterTempUser(req, h.JwtSecret)
	if err != nil {
		// Nếu lỗi là do username/email đã tồn tại
		if strings.Contains(err.Error(), "tồn tại") {
			http.Error(w, err.Error(), http.StatusConflict) // 409 Conflict
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "OTP đã gửi về email, vui lòng kiểm tra",
		"token":   token,
	})
}


// Xác thực OTP và lưu vào DB
func (h *UserHandler) CompleteRegistration(w http.ResponseWriter, r *http.Request) {
	var req OTPRequest
	json.NewDecoder(r.Body).Decode(&req)

	err := h.Service.VerifyAndSaveUser(req.Token, req.OTP, h.JwtSecret)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Đăng ký thành công, hãy đăng nhập",
	})
}