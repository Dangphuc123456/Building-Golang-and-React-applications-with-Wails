import React, { useEffect, useState } from 'react';
import {
  GetAllMaintenances,
  CreateMaintenance,
  UpdateMaintenance,
  DeleteMaintenance,
  GetAllUsers,
  GetAllEquipment
} from 'wailsjs/go/main/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Select from 'react-select';

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState([]);
  const [users, setUsers] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  const [formData, setFormData] = useState({
    equipment_id: null,
    scheduled_date: '',
    description: '',
    status: 'pending',
    technician_id: null
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch data an toàn
  const fetchData = async () => {
    try {
      const maintData = await GetAllMaintenances().catch(() => []);
      const userData = await GetAllUsers().catch(() => []);
      const equipData = await GetAllEquipment().catch(() => []);

      setMaintenances(Array.isArray(maintData) ? maintData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setEquipments(Array.isArray(equipData) ? equipData : []);
    } catch (err) {
      toast.error('Lấy dữ liệu thất bại: ' + err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalPages = Math.max(1, Math.ceil(maintenances.length / rowsPerPage));
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentMaintenances = maintenances.slice(indexOfFirstItem, indexOfLastItem);
  const equipmentOptions = equipments.map(eq => ({
    value: eq.id,
    label: `${eq.id} - ${eq.name}`
  }));

  const technicianOptions = users
    .filter(u => u.role === "technician")
    .map(u => ({
      value: u.id,
      label: `${u.id} - ${u.username}`
    }));
  const getUserName = id => Array.isArray(users) ? users.find(u => u.id === id)?.username || '-' : '-';
  const getEquipmentName = id => Array.isArray(equipments) ? equipments.find(e => e.id === id)?.name || '-' : '-';

  const handleAdd = () => {
    setFormData({ equipment_id: null, scheduled_date: '', description: '', status: 'pending', technician_id: null });
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = maintenance => {
    const formatDate = dateStr => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    setSelectedMaintenance(maintenance);
    setFormData({
      equipment_id: maintenance.equipment_id || null,
      scheduled_date: formatDate(maintenance.scheduled_date),
      description: maintenance.description || '',
      status: maintenance.status || 'pending',
      technician_id: maintenance.technician_id || null
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = maintenance => {
    setSelectedMaintenance(maintenance);
    setModalType('delete');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const dataToSave = { ...formData, scheduled_date: formData.scheduled_date || null };
      if (modalType === 'add') await CreateMaintenance(dataToSave);
      else if (modalType === 'edit') await UpdateMaintenance(selectedMaintenance.id, dataToSave);

      toast.success(modalType === 'add' ? 'Thêm lịch thành công!' : 'Cập nhật lịch thành công!');
      setShowModal(false);
      fetchData();
      setCurrentPage(1);
    } catch (err) {
      toast.error('Lưu thất bại: ' + err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await DeleteMaintenance(selectedMaintenance.id);
      toast.success('Xóa thành công!');
      setShowModal(false);
      fetchData();
      setCurrentPage(1);
    } catch (err) {
      toast.error('Xóa thất bại: ' + err);
    }
  };

  return (
    <div className="container mt-2">
      <ToastContainer />
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Danh sách bảo trì</h3>
        <Button onClick={handleAdd}>➕ Thêm bảo trì</Button>
      </div>
      <div className="table-responsive">
        <Table bordered hover className="text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Mô tả</th>
              <th>Thiết bị</th>
              <th>Trạng thái</th>
              <th>Kỹ thuật viên</th>
              <th>Ngày bảo trì</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentMaintenances.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>
                  <Link
                    to={`${m.id}`}
                    style={{
                      textDecoration: "none",
                      color: "#0d6efd",
                      cursor: "pointer",
                      display: "block",         
                      textAlign: "center",     
                      maxWidth: "200px",         
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",      
                      margin: "0 auto",          
                    }}
                    title={m.description}>
                    {m.description}
                  </Link>
                </td>
                <td>
                  <span
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textAlign: "center",
                      maxWidth: "280px",
                      margin: "0 auto",
                      cursor: "pointer",
                      whiteSpace: "normal"
                    }}
                    title={getEquipmentName(m.equipment_id)}>
                    {getEquipmentName(m.equipment_id)}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: m.status === 'completed' ? 'green' :
                        m.status === 'pending' ? 'orange' : 'gray',
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      width: '100px',
                      boxSizing: 'border-box'
                    }}>
                    {m.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>{getUserName(m.technician_id)}</td>
                <td>{m.scheduled_date ? new Date(m.scheduled_date).toLocaleDateString('vi-VN') : ''}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(m)}>✏️ Sửa</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(m)}>🗑️ Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="d-flex align-items-center justify-content-end mt-3 gap-3">
        <div className="d-flex align-items-center gap-1">
          <span>Hiển thị</span>
          <select
            className="form-select"
            style={{ width: "70px", padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
            value={rowsPerPage}
            onChange={(e) => {
              setCurrentPage(1); // reset trang khi đổi rowsPerPage
              setRowsPerPage(Number(e.target.value));
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>bản ghi / trang</span>
          <span>Tổng {totalPages} trang ({maintenances.length} bản ghi)</span>
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


      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'add' && 'Thêm bảo trì'}
            {modalType === 'edit' && 'Sửa bảo trì'}
            {modalType === 'delete' && 'Xóa bảo trì'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(modalType === 'add' || modalType === 'edit') &&
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Thiết bị</Form.Label>
                <Select
                  options={equipmentOptions}
                  value={equipmentOptions.find(opt => opt.value === formData.equipment_id)}
                  onChange={selected => setFormData({ ...formData, equipment_id: selected ? selected.value : null })}
                  placeholder="Chọn thiết bị..."
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ngày bảo trì</Form.Label>
                <Form.Control type="date" value={formData.scheduled_date} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả..."
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Kỹ thuật viên</Form.Label>
                <Select
                  options={technicianOptions}
                  value={technicianOptions.find(opt => opt.value === formData.technician_id) || null}
                  onChange={selected => setFormData({ ...formData, technician_id: selected ? selected.value : null })}
                  placeholder="Chọn kỹ thuật viên..."
                  isClearable
                />
              </Form.Group>
            </Form>
          }
          {modalType === 'delete' && <p>Bạn có chắc muốn xóa bảo trì ID <strong>{selectedMaintenance?.id}</strong> không?</p>}
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
