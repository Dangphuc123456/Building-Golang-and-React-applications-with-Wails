import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GetSupplierByID, CreateEquipment, UpdateEquipment, DeleteEquipment } from 'wailsjs/go/main/App';
import { Table, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaRegCopy } from "react-icons/fa";
import Breadcrumbs from '../../components/Breadcrumbs';

export default function SupplierDetailPage() {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [equipments, setEquipments] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    purchase_date: '',
    status: 'active',
    supplier_id: parseInt(id),
    price: 0
  });


  const fetchSupplier = async () => {
    try {
      const data = await GetSupplierByID(parseInt(id));
      setSupplier(data);
      setEquipments(data.equipments || []);
    } catch (err) {
      toast.error('Lấy thông tin nhà cung cấp thất bại: ' + err);
    }
  };

  useEffect(() => { fetchSupplier(); }, [id]);


  const totalPages = Math.ceil(equipments.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentEquipments = equipments.slice(indexOfFirst, indexOfLast);

  
  const [isSmall, setIsSmall] = useState(window.innerWidth < 1200);
  useEffect(() => {
    const handleResize = () => setIsSmall(window.innerWidth < 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function formatShortCurrency(value) {
    if (value == null) return '0 ₫';
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'tỷ';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'tr';
    if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return value.toString() + ' ₫';
  }

  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      purchase_date: '',
      status: 'active',
      supplier_id: parseInt(id),
      price: 0
    });
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (eq) => {
    setSelectedEquipment(eq);
    setFormData({
      name: eq.name || '',
      purchase_date: formatDate(eq.purchase_date),
      status: eq.status || 'active',
      supplier_id: eq.supplier_id ?? parseInt(id),
      price: eq.price ?? 0
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalType === 'add') {
        await CreateEquipment(formData);
        toast.success('Thêm thiết bị thành công!');
      } else if (modalType === 'edit') {
        await UpdateEquipment(selectedEquipment.id, formData);
        toast.success('Cập nhật thiết bị thành công!');
      }
      setShowModal(false);
      fetchSupplier();
    } catch (err) {
      toast.error('Lưu thất bại: ' + err);
    }
  };

  const handleDeleteClick = (eq) => {
    setSelectedEquipment(eq);
    setModalType('delete');
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await DeleteEquipment(selectedEquipment.id);
      toast.success('Xóa thiết bị thành công!');
      setShowModal(false);
      fetchSupplier();
    } catch (err) {
      toast.error('Xóa thất bại: ' + err);
    }
  };

  if (!supplier) return <p>Đang tải...</p>;

  return (
    <div className="container mt-2">
      <ToastContainer />
      <div className="row">
        <Breadcrumbs />
        {/* Thông tin nhà cung cấp */}
        <div className="col-md-4 mb-4">
          <div style={{ border: "1px solid #cac2c2ff", borderRadius: "10px", padding: "20px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.3s ease" }}>
            <h5>Thông tin nhà cung cấp</h5>
            <Form.Group className="mb-3 mt-4">
              <Form.Label>Tên nhà cung cấp</Form.Label>
              <Form.Control as="textarea" value={supplier.name} readOnly rows={2} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <InputGroup>
                <Form.Control type="text" value={supplier.phone} readOnly />
                <Button variant="outline-secondary" onClick={() => { navigator.clipboard.writeText(supplier.phone || ""); toast.success("Đã sao chép số điện thoại!"); }}>
                  <FaRegCopy />
                </Button>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <InputGroup>
                <Form.Control type="email" value={supplier.email} readOnly />
                <Button variant="outline-secondary" onClick={() => { navigator.clipboard.writeText(supplier.email || ""); toast.success("Đã sao chép email!"); }}>
                  <FaRegCopy />
                </Button>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control as="textarea" value={supplier.address} readOnly />
            </Form.Group>
          </div>
        </div>

        {/* Danh sách thiết bị */}
        <div className="col-md-8">
          <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Danh sách thiết bị</h5>
              <Button onClick={handleAdd}>➕ Thêm thiết bị</Button>
            </div>

            <Table bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tên thiết bị</th>
                  <th>Ngày mua</th>
                  <th>Trạng thái</th>
                  <th>Gía</th>
                  <th>Hoạt động</th>
                </tr>
              </thead>
              <tbody>
                {currentEquipments.map(e => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>
                      <Link
                        to={`/equipments/${e.id}`}
                        style={{
                          color: "#0d6efd",
                          textDecoration: "none",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "230px",
                          cursor: "pointer",
                          wordBreak: "break-word",
                        }}
                        title={e.name} >
                        {e.name}
                      </Link>
                    </td>
                    <td>{e.purchase_date ? new Date(e.purchase_date).toLocaleDateString('vi-VN') : ''}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: e.status === 'active' ? 'green' :
                            e.status === 'inactive' ? 'red' :
                              e.status === 'maintenance' ? 'orange' : 'gray',
                          color: 'white',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          width: '115px',
                          boxSizing: 'border-box'
                        }}>
                        {e.status}
                      </span>
                    </td>
                    <td className="text-center">
                      {isSmall
                        ? formatShortCurrency(e.price)
                        : formatCurrency(e.price)
                      }
                    </td>
                    <td>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(e)}>✏️Sửa</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteClick(e)}>🗑️Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Phân trang */}
            <div className="d-flex align-items-center justify-content-end mt-3 gap-3">
              <div className="d-flex align-items-center gap-1">
                <span>Hiển thị</span>
                <select className="form-select" style={{ width: "70px" }} value={rowsPerPage} onChange={e => { setCurrentPage(1); setRowsPerPage(Number(e.target.value)); }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>bản ghi / trang</span>
                <span>Tổng {totalPages} trang ({equipments.length} bản ghi)</span>
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
          </div>
        </div>
      </div>

      {/* Modal Thêm/Sửa/Xóa */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'add' && 'Thêm thiết bị'}
            {modalType === 'edit' && 'Sửa thiết bị'}
            {modalType === 'delete' && 'Xóa thiết bị'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(modalType === 'add' || modalType === 'edit') && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Purchase Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.purchase_date}
                  onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </Form.Group>
            </Form>
          )}
          {modalType === 'delete' && (
            <p>Bạn có chắc muốn xóa thiết bị <strong>{selectedEquipment?.name}</strong> không?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>❌ Hủy</Button>
          {(modalType === 'add' || modalType === 'edit') && (
            <Button variant="primary" onClick={handleSave}>💾 Lưu</Button>
          )}
          {modalType === 'delete' && (
            <Button variant="danger" onClick={handleConfirmDelete}>✔️ Xóa</Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
