package services

import (
	"Device-t/backend/models"
	"Device-t/backend/repositories"
	"Device-t/backend/utils"
	"errors"
	"time"
    "fmt"       
    "math/rand"
	"golang.org/x/crypto/bcrypt"
	"github.com/golang-jwt/jwt/v5"
)

type UserService struct {
	Repo *repositories.UserRepository
}
func NewUserService(repo *repositories.UserRepository) *UserService {
    return &UserService{Repo: repo}
}

func (s *UserService) Login(email, password, jwtSecret string) (string, error) {
	user, err := s.Repo.GetByEmail(email)
	if err != nil {
		return "", errors.New("user not found")
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		return "", errors.New("incorrect password")
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}


func (s *UserService) GetAllUsers() ([]models.User, error) {
	return s.Repo.GetAll()
}


func (s *UserService) UpdateUser(u *models.User) error {
	return s.Repo.Update(u)
}


func (s *UserService) DeleteUser(userID int) error {
	return s.Repo.Delete(userID)
}
func (s *UserService) Logout(userID int) error {
	return nil
}

type TempUserClaims struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Role     string `json:"role"`
	Address  string `json:"address"`
	OTP      string `json:"otp"`
	jwt.RegisteredClaims
}
func (s *UserService) Register(u models.User, jwtSecret string) (string, error) {
    // Kiểm tra username/email đã tồn tại qua Repo
    exists, err := s.Repo.ExistsByUsernameOrEmail(u.Username, u.Email)
    if err != nil {
        return "", err
    }
    if exists {
        return "", fmt.Errorf("Username hoặc Email đã tồn tại, không thể tạo tài khoản")
    }

    // Tạo OTP
    otp := fmt.Sprintf("%06d", rand.Intn(1000000))

    claims := TempUserClaims{
        Username: u.Username,
        Password: u.PasswordHash,
        Email:    u.Email,
        Phone:    u.Phone,
        Role:     u.Role,
        Address:  u.Address,
        OTP:      otp,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(10 * time.Minute)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    signedToken, err := token.SignedString([]byte(jwtSecret))
    if err != nil {
        return "", err
    }

    // Gửi OTP
    if err := utils.SendOTP(u.Email, otp); err != nil {
        return "", fmt.Errorf("không gửi được email: %v", err)
    }

    fmt.Printf("📧 OTP %s đã gửi đến email %s (token: %s)\n", otp, u.Email, signedToken)
    return signedToken, nil
}


func (s *UserService) CompleteRegister(tokenStr, otp, jwtSecret string) (string, error) {
	
	token, err := jwt.ParseWithClaims(tokenStr, &TempUserClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("token không hợp lệ hoặc đã hết hạn")
	}

	claims, ok := token.Claims.(*TempUserClaims)
	if !ok {
		return "", errors.New("token không hợp lệ")
	}

	if claims.OTP != otp {
		return "", errors.New("OTP sai")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(claims.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	role := claims.Role
	if role == "" {
		role = "technician"
	}

	user := models.User{
		Username:     claims.Username,
		PasswordHash: string(hash),
		Email:        claims.Email,
		Phone:        claims.Phone,
		Role:         role,
		Address:      claims.Address,
		CreatedAt:    time.Now().Format("2006-01-02 15:04:05"),
	}

	if err := s.Repo.Create(&user); err != nil {
		return "", err
	}

	fmt.Printf("✅ User %s đã được lưu vào DB với role %s\n", user.Username, user.Role)
	return "Đăng ký thành công", nil
}
