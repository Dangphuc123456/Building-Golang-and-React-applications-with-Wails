package repositories

import (
	"Device-t/backend/models"
	"database/sql"
	"time"
	"log"
)

type UserRepository struct {
	DB *sql.DB
}

// Lấy user theo email
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var u models.User
	err := r.DB.QueryRow(
		"SELECT id, username, password_hash, role, email, phone,address,created_at, updated_at FROM users WHERE email = ? LIMIT 1",
		email,
	).Scan(&u.ID, &u.Username, &u.PasswordHash, &u.Role, &u.Email, &u.Phone,&u.Address, &u.CreatedAt, &u.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("❌ GetByEmail: không tìm thấy user với email='%s'\n", email)
			return nil, err
		}
		log.Printf("❌ GetByEmail: lỗi query với email='%s': %v\n", email, err)
		return nil, err
	}

	log.Printf("✅ GetByEmail: tìm thấy user: %+v\n", u)
	return &u, nil
}


// Lấy tất cả user
func (r *UserRepository) GetAll() ([]models.User, error) {
	rows, err := r.DB.Query("SELECT id, username, role, email, phone, address, created_at, updated_at FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Username, &u.Role, &u.Email, &u.Phone, &u.Address, &u.CreatedAt, &u.UpdatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// đăng ký
func (r *UserRepository) Create(u *models.User) error {
    _, err := r.DB.Exec(
        "INSERT INTO users (username, password_hash, role, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        u.Username, u.PasswordHash, u.Role, u.Email, u.Phone, u.Address, u.CreatedAt,
    )
    return err
}

func (r *UserRepository) ExistsByUsernameOrEmail(username, email string) (bool, error) {
	var count int
	err := r.DB.QueryRow(
		"SELECT COUNT(*) FROM users WHERE username=? OR email=?",
		username, email,
	).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Update user
func (r *UserRepository) Update(u *models.User) error {
	_, err := r.DB.Exec(
		"UPDATE users SET username=?, email=?, role=?, phone=?, address=? ,updated_at=? WHERE id=?",
		u.Username, u.Email, u.Role, u.Phone,u.Address, time.Now(), u.ID,
	)
	return err
}

// Delete user
func (r *UserRepository) Delete(userID int) error {
	_, err := r.DB.Exec("DELETE FROM users WHERE id=?", userID)
	return err
}
