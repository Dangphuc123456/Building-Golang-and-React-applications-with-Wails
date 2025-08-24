import React, { useEffect, useState } from 'react';
import { GetAllSuppliers, DeleteSupplier, CreateSupplier, UpdateSupplier } from 'wailsjs/go/main/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({
    Name: '',
    Phone: '',
    Email: '',
    Address: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    try {
      const data = await GetAllSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Lấy danh sách nhà cung cấp thất bại: ' + (err?.message || err));
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);


  const totalPages = Math.max(1, Math.ceil(suppliers.length / rowsPerPage));
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentSuppliers = suppliers.slice(indexOfFirst, indexOfLast);


  const handleAdd = () => {
    setFormData({ Name: '', Phone: '', Email: '', Address: '' });
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      Name: supplier.name || '',
      Phone: supplier.phone || '',
      Email: supplier.email || '',
      Address: supplier.address || '',
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (supplier) => {
    setSelectedSupplier(supplier);
    setModalType('delete');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalType === 'add') {
        await CreateSupplier(formData);
        toast.success('Thêm nhà cung cấp thành công!');
      } else if (modalType === 'edit') {
        await UpdateSupplier({ ...selectedSupplier, ...formData });
        toast.success('Cập nhật nhà cung cấp thành công!');
      }
      setShowModal(false);
      fetchSuppliers();
      setCurrentPage(1);
    } catch (err) {
      toast.error('Lưu thất bại: ' + (err?.message || err));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await DeleteSupplier(selectedSupplier.id);
      toast.success('Xóa nhà cung cấp thành công!');
      setShowModal(false);
      fetchSuppliers();
      setCurrentPage(1);
    } catch (err) {
      toast.error('Xóa thất bại: ' + (err?.message || err));
    }
  };


  return (
    <div className="container mt-2">
      <ToastContainer />

      {/* Header + nút thêm */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Danh sách nhà cung cấp</h3>
        <Button onClick={handleAdd}>➕ Thêm nhà cung cấp</Button>
      </div>

      {/* Bảng nhà cung cấp */}
      <div className="table-responsive">
        <Table bordered hover responsive className="text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Tên nhà cung cấp</th>
              <th>Điện thoại</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Không có nhà cung cấp</td>
              </tr>
            ) : (
              currentSuppliers.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>
                    <Link
                      to={`${s.id}`}
                      style={{
                        color: "#0d6efd",
                        textDecoration: "none",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        maxWidth: "250px",   
                        margin: "0 auto",
                      }}
                      title={s.name}>
                      {s.name}
                    </Link>
                  </td>
                  <td>{s.phone}</td>
                  <td>{s.email}</td>
                  <td>
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        maxWidth: "250px", 
                        margin: "0 auto",
                        cursor: "pointer",
                      }}
                      title={s.address}>
                      {s.address}
                    </span>
                  </td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(s)}>✏️ Sửa</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(s)}>🗑️ Xóa</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      {/* Phân trang */}
      <div className="d-flex align-items-center justify-content-end mt-3 gap-3">
        <div className="d-flex align-items-center gap-1">
          <span>Hiển thị</span>
          <select
            className="form-select"
            style={{ width: "70px", padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
            value={rowsPerPage}
            onChange={(e) => { setCurrentPage(1); setRowsPerPage(Number(e.target.value)); }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>bản ghi / trang</span>
          <span>Tổng {totalPages} trang ({suppliers.length} bản ghi)</span>
        </div>

        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(1)}>«</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(totalPages)}>»</button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal thêm/sửa/xóa */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'add' && 'Thêm nhà cung cấp'}
            {modalType === 'edit' && 'Sửa nhà cung cấp'}
            {modalType === 'delete' && 'Xóa nhà cung cấp'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(modalType === 'add' || modalType === 'edit') && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" value={formData.Name} onChange={e => setFormData({ ...formData, Name: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control type="text" value={formData.Phone} onChange={e => setFormData({ ...formData, Phone: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={formData.Email} onChange={e => setFormData({ ...formData, Email: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control type="text" value={formData.Address} onChange={e => setFormData({ ...formData, Address: e.target.value })} />
              </Form.Group>
            </Form>
          )}
          {modalType === 'delete' && (
            <p>Bạn có chắc muốn xóa nhà cung cấp <strong>{selectedSupplier?.name}</strong> không?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>❌ Hủy</Button>
          {(modalType === 'add' || modalType === 'edit') && <Button variant="primary" onClick={handleSave}>💾 Lưu</Button>}
          {modalType === 'delete' && <Button variant="danger" onClick={handleConfirmDelete}>✔️ Xóa</Button>}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
