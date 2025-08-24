import React, { useState } from "react";
import { RegisterUser } from "wailsjs/go/main/App";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const token = await RegisterUser({
      username: formData.username,
      password_hash: formData.password,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    });

    if (token) {
      sessionStorage.setItem("regToken", token);
      toast.success(
        "Đăng ký thành công! Vui lòng kiểm tra email để nhập OTP.",
        {
          autoClose: 2500,
          onClose: () => navigate("/register/complete"),
        }
      );
    }
  } catch (err) {
    let errorMsg = "Đăng ký thất bại";

    if (err?.message) {
      errorMsg = err.message;
    } else if (typeof err === "string") {
      errorMsg = err;
    }

    if (
      errorMsg.toLowerCase().includes("username") ||
      errorMsg.toLowerCase().includes("email")
    ) {
      toast.error(errorMsg);
    } else {
      toast.error(errorMsg, {
        autoClose: 4000,
      });
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
      }}
    >
      <ToastContainer />
      <div
        className="card p-4 shadow-lg"
        style={{ width: "400px", borderRadius: "15px" }}
      >
        <h2 className="text-center mb-4">Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="form-control mb-3"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            className="form-control mb-3"
            onChange={handleChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Địa chỉ"
            className="form-control mb-3"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang gửi...
              </>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        <div className="d-inline-flex align-items-center justify-content-center mt-3">
          <span className="me-1">Bạn đã có tài khoản?</span>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-link p-0"
            style={{ verticalAlign: 'middle' }}>
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
