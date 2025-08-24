import React, { useState } from "react";
import { Login } from "wailsjs/go/main/App";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (err) {
    return null;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await Login(email.trim(), password);
      if (!token) throw new Error("Không nhận được token từ backend");

      const payload = parseJwt(token);
      if (!payload || !payload.role || !payload.user_id) {
        throw new Error("Thông tin user trong token không hợp lệ");
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: payload.user_id,
        role: payload.role
      }));

      toast.success('Đăng nhập thành công!', { position: "top-center", autoClose: 2000 });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Đăng nhập thất bại: ' + err.message, { position: "top-center", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg, #6a11cb, #2575fc)" }}
    >
      <ToastContainer />
      <div className="card p-4 shadow-lg" style={{ width: "400px", borderRadius: "15px" }}>
        <h2 className="text-center mb-4 text-black">Đăng nhập</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="form-control mb-3"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="form-control mb-3"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required />
          <button
            type="submit"
            className="btn btn-primary w-100 d-flex justify-content-center align-items-center"
            disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
        <div className="d-inline-flex align-items-center justify-content-center mt-3">
          <span className="me-1">Bạn chưa có tài khoản?</span>
          <button
            onClick={() => navigate("/register")}
            className="btn btn-link p-0"
            style={{ verticalAlign: 'middle' }}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
