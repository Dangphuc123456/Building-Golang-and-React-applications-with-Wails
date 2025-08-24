import React, { useState, useEffect } from "react";
import { CompleteRegister } from "wailsjs/go/main/App";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CompleteRegisterPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("regToken");
    setToken(t);

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Vui lòng nhập mã OTP!");
      return;
    }
    if (!token) {
      toast.error("Không tìm thấy token. Vui lòng đăng ký lại.");
      return;
    }

    setLoading(true);

    try {
      console.log("Gửi OTP với token:", token, "và otp:", otp);
      await CompleteRegister(token, otp);
      toast.success("Hoàn tất đăng ký! Chuyển hướng đến đăng nhập...", {
        position: "top-center",
        autoClose: 2000,
        onClose: () => {
          sessionStorage.removeItem("regToken"); // xóa token khi xong
          navigate("/login");
        },
      });
    } catch (err) {
      toast.error("Lỗi: " + err, { position: "top-center", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <ToastContainer />
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Xác thực OTP</h2>
        <p className="text-center text-muted">
          Nhập mã OTP đã gửi đến email của bạn
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="otp" className="form-label">Mã OTP</label>
            <input
              type="text"
              id="otp"
              className="form-control form-control-lg text-center"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-success w-100 btn-lg ${loading ? "disabled" : ""}`}
          >
            {loading ? "Đang xác nhận..." : "Xác nhận"}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            className="btn btn-link"
            onClick={() => navigate("/login")}
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
