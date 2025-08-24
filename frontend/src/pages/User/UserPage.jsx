import React, { useEffect, useState } from 'react';
import { GetAllUsers, UpdateUser, DeleteUser } from 'wailsjs/go/main/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form } from 'react-bootstrap';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'edit' hoặc 'delete'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    phone: '',
    address: '',
  });

  const fetchUsers = async () => {
    try {
      const data = await GetAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Lấy danh sách thất bại: ' + err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setModalType('delete');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedUser) return;
      await UpdateUser({
        id: selectedUser.id,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      });
      toast.success('Cập nhật người dùng thành công!');
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error('Cập nhật thất bại: ' + err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (!selectedUser) return;
      await DeleteUser(selectedUser.id);
      toast.success('Xóa người dùng thành công!');
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error('Xóa thất bại: ' + err);
    }
  };


  return (
    <div className="container mt-2">
      <ToastContainer />
      <h3>Danh sách người dùng</h3>
      <table className="table table-bordered table-hover mt-3 text-dark text-center">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Tên người dùng</th>
            <th>Email</th>
            <th>Điện thoại</th>
            <th>Địa chỉ</th>
            <th>Quyền</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="7" className="py-4">Không có người dùng</td>
            </tr>
          ) : (
            users.map(u => (
              <tr key={u.ID}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(u)}>✏️ Sửa</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u)}>🗑️ Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'edit' ? 'Sửa người dùng' : 'Xóa người dùng'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'edit' ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="technician">Technician</option>
                  <option value="staff">Staff</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Địa chỉ</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </Form.Group>
            </Form>
          ) : (
            <p>Bạn có chắc muốn xóa người dùng <strong>{selectedUser?.Username}</strong> không?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>❌ Hủy</Button>
          {modalType === 'edit' ? (
            <Button variant="primary" onClick={handleSave}>💾Lưu</Button>
          ) : (
            <Button variant="danger" onClick={handleConfirmDelete}>✔️Xóa</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
