import React, { useEffect, useState } from 'react';
import { GetAllEquipment, DeleteEquipment, CreateEquipment, UpdateEquipment, GetAllSuppliers } from 'wailsjs/go/main/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Select from 'react-select';

export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    purchase_date: '',
    status: 'active',
    supplier_id: '',
    price: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  const fetchEquipment = async () => {
    try {
      const data = await GetAllEquipment();
      setEquipmentList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Lấy danh sách thiết bị thất bại: ' + (err?.message || err));
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await GetAllSuppliers();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Lấy danh sách nhà cung cấp thất bại: ' + (err?.message || err));
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchSuppliers();
  }, []);

  const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.name }));
  const handleAdd = () => {
    setFormData({ name: '', purchase_date: '', status: 'active', supplier_id: '', price: 0 });
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (eq) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    setSelectedEquipment(eq);
    setFormData({
      name: eq.name || '',
      purchase_date: formatDate(eq.purchase_date),
      status: eq.status || 'active',
      supplier_id: eq.supplier_id ?? '',
      price: eq.price ?? 0,
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = (eq) => {
    setSelectedEquipment(eq);
    setModalType('delete');
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
      fetchEquipment();
      setCurrentPage(1);
    } catch (err) {
      toast.error('Lưu thất bại: ' + (err?.message || err));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await DeleteEquipment(selectedEquipment.id);
      toast.success('Xóa thiết bị thành công!');
      setShowModal(false);
      fetchEquipment();
      setCurrentPage(1);
    } catch (err) {
      toast.error('Xóa thất bại: ' + (err?.message || err));
    }
  };
  
  const [isSmall, setIsSmall] = useState(window.innerWidth < 1200);

 
  useEffect(() => {
    const handleResize = () => setIsSmall(window.innerWidth < 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function formatShortCurrency(value) {
    if (value == null) return '-';
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'tỷ';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'tr';
    if (value >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return value.toString() + ' ₫';
  }

  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));


  const totalPages = Math.max(1, Math.ceil(equipmentList.length / rowsPerPage));
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentEquipments = equipmentList.slice(indexOfFirstItem, indexOfLastItem);


  return (
    <div className="container ">
      <ToastContainer />
      {/* Header + nút thêm */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Danh sách thiết bị</h3>
        <Button onClick={handleAdd}>➕ Thêm thiết bị</Button>
      </div>

      {/* Bảng */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-dark text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Tên thiết bị</th>
              <th>Ngày mua</th>
              <th>Trạng thái</th>
              <th>Nhà cung cấp</th>
              <th>Giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentEquipments.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">Không có thiết bị</td>
              </tr>
            ) : (
              currentEquipments.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>
                    <Link
                      to={`${e.id}`}
                      style={{
                        color: "#0d6efd",
                        textDecoration: "none",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        maxWidth: "250px",
                        margin: "0 auto",
                      }}
                      title={e.name}>
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
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {suppliers.find(s => s.id === e.supplier_id)?.name || 'Chưa có'}
                        </Tooltip>}>
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          textAlign: "center",
                          maxWidth: "250px",
                          margin: "0 auto",
                        }}
                        title={suppliers.find(s => s.id === e.supplier_id)?.name || 'Chưa có'}
                      >
                        {suppliers.find(s => s.id === e.supplier_id)?.name || 'Chưa có'}
                      </span>
                    </OverlayTrigger>
                  </td>
                  <td>
                    {e.price != null
                      ? (isSmall ? formatShortCurrency(e.price) : formatCurrency(e.price))
                      : '0 ₫'}
                  </td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(e)}>✏️Sửa</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(e)}>🗑️Xóa</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table></div>
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
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>bản ghi / trang</span>
          <span>Tổng {totalPages} trang ({equipmentList.length} bản ghi)</span>
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
                <Form.Control type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Purchase Date</Form.Label>
                <Form.Control type="date" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Supplier</Form.Label>
                <Select
                  options={supplierOptions}
                  value={supplierOptions.find(option => option.value === formData.supplier_id) || null}
                  onChange={selected => setFormData({ ...formData, supplier_id: selected ? selected.value : '' })}
                  placeholder="Chọn nhà cung cấp..."
                  isClearable
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
              </Form.Group>
            </Form>
          )}
          {modalType === 'delete' && (
            <p>Bạn có chắc muốn xóa thiết bị <strong>{selectedEquipment?.name}</strong> không?</p>
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
