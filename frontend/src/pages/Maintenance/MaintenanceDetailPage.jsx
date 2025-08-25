import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GetMaintenanceDetail,
  AddRepairHistory,
  UpdateRepairHistory,
  DeleteRepairHistory,
  GetAllUsers,
  GetAllEquipment
} from 'wailsjs/go/main/App';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumbs from '../../components/Breadcrumbs';
import Select from "react-select";

export default function MaintenanceDetailPage() {
  const { id } = useParams();

  const [maintenance, setMaintenance] = useState({ repair_histories: [] });
  const [users, setUsers] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [formData, setFormData] = useState({
    repair_date: '',
    issue_description: '',
    cost: '',
    technician_id: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const technicianOptions = users
    .filter(u => u.role === "technician")
    .map(u => ({
      value: u.id,
      label: `${u.id} - ${u.username}`
    }));

  const fetchMaintenance = async () => {
    try {
      const data = await GetMaintenanceDetail(parseInt(id));
      setMaintenance({
        ...data,
        repair_histories: data.repair_histories || []
      });
    } catch (err) {
      toast.error('Lấy thông tin lịch bảo trì thất bại: ' + err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await GetAllUsers();
      setUsers(data || []);
    } catch (err) {
      toast.error("Không lấy được danh sách kỹ thuật viên: " + err);
    }
  };

  const fetchEquipments = async () => {
    try {
      const data = await GetAllEquipment();
      setEquipments(data || []);
    } catch (err) {
      toast.error("Không lấy được danh sách thiết bị: " + err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
    fetchUsers();
    fetchEquipments();
  }, [id]);

  const getUserName = (techID) => {
    const user = users.find(u => u.ID === techID || u.id === techID);
    return user ? (user.Name || user.username) : `User #${techID}`;
  };

  const getEquipmentName = (eqID) => {
    const eq = equipments.find(e => e.ID === eqID || e.id === eqID);
    return eq ? eq.Name || eq.name : `Equipment #${eqID}`;
  };


  const handleAdd = () => {
    setFormData({ repair_date: '', issue_description: '', cost: '', technician_id: '' });
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (history) => {
    setSelectedHistory(history);
    setFormData({
      repair_date: history.repair_date || '',
      issue_description: history.issue_description || '',
      cost: history.cost || '',
      technician_id: history.technician_id ? history.technician_id.toString() : ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        cost: parseFloat(formData.cost),
        technician_id: parseInt(formData.technician_id),
        maintenance_id: maintenance.id || maintenance.ID
      };

      if (modalType === 'add') {
        await AddRepairHistory(payload);
        toast.success('Thêm lịch sử sửa chữa thành công!');
      } else if (modalType === 'edit') {
        await UpdateRepairHistory(selectedHistory.id || selectedHistory.ID, payload);
        toast.success('Cập nhật lịch sử sửa chữa thành công!');
      }
      setShowModal(false);
      fetchMaintenance();
    } catch (err) {
      toast.error('Lưu thất bại: ' + err);
    }
  };


  const handleDeleteClick = (history) => {
    setSelectedHistory(history);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await DeleteRepairHistory(selectedHistory.id || selectedHistory.ID);
      toast.success('Xóa lịch sử sửa chữa thành công!');
      setShowDeleteModal(false);
      fetchMaintenance();
    } catch (err) {
      toast.error('Xóa thất bại: ' + err);
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


  const totalRecords = maintenance.repair_histories.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentHistories = maintenance.repair_histories.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="container mt-2">
      <ToastContainer />
      <div className="row">
        <Breadcrumbs />
        {/* Thông tin maintenance */}
        <div className="col-md-4 mb-4">
          <div style={{ border: "1px solid #cac2c2ff", borderRadius: "10px", padding: "20px", backgroundColor: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.3s ease" }}>
            <h5>Thông tin lịch bảo trì</h5>
            <Form.Group className="mb-3">
              <Form.Label>Thiết bị</Form.Label>
              <Form.Control
                as="textarea"
                value={getEquipmentName(maintenance.equipment_id || maintenance.EquipmentID)}
                readOnly
                rows={2}
                style={{ overflow: 'hidden' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kỹ thuật viên</Form.Label>
              <Form.Control type="text" value={getUserName(maintenance.technician_id || maintenance.TechnicianID)} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày dự kiến</Form.Label>
              <Form.Control type="text"
                value={maintenance.scheduled_date ? new Date(maintenance.scheduled_date).toLocaleDateString('vi-VN') : ''}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                value={maintenance.description}
                readOnly
                rows={1}
                style={{ overflow: 'hidden' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Control type="text" value={maintenance.status} readOnly />
            </Form.Group>
          </div>
        </div>

        {/* Bảng repair history */}
        <div className="col-md-8">
          <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Lịch sử sửa chữa</h5>
              <Button onClick={handleAdd}>➕ Thêm lịch sử</Button>
            </div>

            <Table bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Ngày sửa chữa</th>
                  <th>Mô tả sự cố</th>
                  <th>Chi phí</th>
                  <th>Kỹ thuật viên</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentHistories.map(h => (
                  <tr key={h.id || h.ID}>
                    <td>{h.id || h.ID}</td>
                    <td>{h.repair_date ? new Date(h.repair_date).toLocaleDateString('vi-VN') : ''}</td>
                    <td>
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "250px",
                          cursor: "pointer",
                          wordBreak: "break-word",
                        }}
                        title={h.issue_description}>
                        {h.issue_description}
                      </span>
                    </td>
                    <td>
                      {h.cost != null
                        ? (isSmall ? formatShortCurrency(h.cost) : formatCurrency(h.cost))
                        : '-'}
                    </td>
                    <td>{getUserName(h.technician_id)}</td>
                    <td>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(h)}>✏️Sửa</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteClick(h)}>🗑️Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

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
                <span>Tổng {totalPages} trang ({totalRecords} bản ghi)</span>
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

      {/* Modal Thêm/Sửa repair history */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Thêm lịch sử sửa chữa' : 'Sửa lịch sử sửa chữa'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ngày sửa chữa</Form.Label>
              <Form.Control type="date"
                value={formData.repair_date}
                onChange={e => setFormData({ ...formData, repair_date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả sự cố</Form.Label>
              <Form.Control type="text"
                value={formData.issue_description}
                onChange={e => setFormData({ ...formData, issue_description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Chi phí</Form.Label>
              <Form.Control type="number" step="0.01"
                value={formData.cost}
                onChange={e => setFormData({ ...formData, cost: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kỹ thuật viên</Form.Label>
              <Select
                options={technicianOptions}
                value={technicianOptions.find(opt => opt.value === parseInt(formData.technician_id)) || null}
                onChange={option => setFormData({ ...formData, technician_id: option ? option.value : '' })}
                placeholder="Chọn kỹ thuật viên..."
                isSearchable={true}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>❌ Hủy</Button>
          <Button variant="primary" onClick={handleSave}>💾 Lưu</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xóa repair history */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa lịch sử sửa chữa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xóa repair history <strong>{selectedHistory?.issue_description}</strong> không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>❌ Hủy</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>✔️ Xóa</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
