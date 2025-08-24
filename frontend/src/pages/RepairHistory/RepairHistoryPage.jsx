import React, { useEffect, useState } from "react";
import {
  GetAllRepairHistories,
  AddRepairHistory,
  UpdateRepairHistory,
  DeleteRepairHistory,
  GetAllUsers,
  GetAllMaintenances
} from "wailsjs/go/main/App";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button, Form, Table } from "react-bootstrap";
import Select from 'react-select';

export default function RepairHistoryPage() {
  const [histories, setHistories] = useState([]);
  const [users, setUsers] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({
    repair_date: "",
    issue_description: "",
    cost: "",
    technician_id: "",
    maintenance_id: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Lấy dữ liệu từ backend
  const fetchData = async () => {
    try {
      const [historyData, userData, maintenanceData] = await Promise.all([
        GetAllRepairHistories(),
        GetAllUsers(),
        GetAllMaintenances()
      ]);
      setHistories(historyData || []);
      setUsers(userData || []);
      setMaintenances(maintenanceData || []);
    } catch (err) {
      toast.error("Lấy dữ liệu thất bại: " + err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(histories.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentHistories = histories.slice(indexOfFirst, indexOfLast);
  const technicianOptions = users
    .filter(u => u.role === "technician")
    .map(u => ({
      value: u.id,
      label: `${u.id} - ${u.username}`
    }));

  const maintenanceOptions = maintenances
    .filter(m => m.status === 'pending')
    .map(m => ({
      value: m.id,
      label: `${m.id} - ${m.description}`
    }));
  const getUserName = (id) => users.find(u => u.id === id)?.username || "-";
  const getMaintenanceDesc = (id) => maintenances.find(m => m.id === id)?.description || "-";

  // Thêm
  const handleAdd = () => {
    setFormData({
      repair_date: "",
      issue_description: "",
      cost: "",
      technician_id: "",
      maintenance_id: "",
    });
    setModalType("add");
    setShowModal(true);
  };

  // Sửa
  const handleEdit = (history) => {
    setSelectedHistory(history);
    setFormData({
      repair_date: history.repair_date || "",
      issue_description: history.issue_description || "",
      cost: history.cost || "",
      technician_id: history.technician_id || "",
      maintenance_id: history.maintenance_id || "",
    });
    setModalType("edit");
    setShowModal(true);
  };

  // Xóa
  const handleDelete = (history) => {
    setSelectedHistory(history);
    setModalType("delete");
    setShowModal(true);
  };

  // Lưu Add/Edit
  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        technician_id: formData.technician_id ? parseInt(formData.technician_id) : null,
        maintenance_id: formData.maintenance_id ? parseInt(formData.maintenance_id) : null,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
      };

      if (modalType === "add") {
        await AddRepairHistory(dataToSave);
        toast.success("Thêm lịch sử sửa chữa thành công!");
      } else if (modalType === "edit") {
        await UpdateRepairHistory(selectedHistory.id, dataToSave);
        toast.success("Cập nhật lịch sử sửa chữa thành công!");
      }

      setShowModal(false);
      fetchData();
      setCurrentPage(1);
    } catch (err) {
      toast.error("Lưu thất bại: " + err);
    }
  };

  // Xác nhận xóa
  const handleConfirmDelete = async () => {
    try {
      await DeleteRepairHistory(selectedHistory.id);
      toast.success("Xóa thành công!");
      setShowModal(false);
      fetchData();
      setCurrentPage(1);
    } catch (err) {
      toast.error("Xóa thất bại: " + err);
    }
  };

  return (
    <div className="container mt-2">
      <ToastContainer />
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Lịch sử sửa chữa</h3>
        <Button onClick={handleAdd}>➕ Thêm lịch sử</Button>
      </div>

      <Table bordered hover className="text-center">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Ngày sửa chữa</th>
            <th>Mô tả sự cố</th>
            <th>Chi phí</th>
            <th>Kỹ thuật viên</th>
            <th>Bảo trì</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentHistories.map((h) => (
            <tr key={h.id}>
              <td>{h.id}</td>
              <td>{h.repair_date ? new Date(h.repair_date).toLocaleDateString('vi-VN') : ''}</td>
              <td
                style={{
                  maxWidth: "250px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: 'center',
                }}
                title={h.issue_description}>
                {h.issue_description}
              </td>
              <td>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(h.cost || 0)}
              </td>
              <td>{getUserName(h.technician_id)}</td>
              <td>{getMaintenanceDesc(h.maintenance_id)}</td>
              <td>{h.created_at}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(h)}>✏️ Sửa</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(h)}>🗑️ Xóa</Button>
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
            style={{ width: "70px" }}
            value={rowsPerPage}
            onChange={(e) => { setCurrentPage(1); setRowsPerPage(Number(e.target.value)); }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>bản ghi / trang — Tổng {totalPages} trang ({histories.length} bản ghi)</span>
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
            {modalType === "add" && "Thêm lịch sử"}
            {modalType === "edit" && "Sửa lịch sử"}
            {modalType === "delete" && "Xóa lịch sử"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(modalType === "add" || modalType === "edit") && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Ngày sửa chữa</Form.Label>
                <Form.Control type="date" value={formData.repair_date} onChange={e => setFormData({ ...formData, repair_date: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mô tả sự cố</Form.Label>
                <Form.Control type="text" value={formData.issue_description} onChange={e => setFormData({ ...formData, issue_description: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Chi phí</Form.Label>
                <Form.Control type="number" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
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

              <Form.Group className="mb-3">
                <Form.Label>Bảo trì</Form.Label>
                <Select
                  options={maintenanceOptions}
                  value={maintenanceOptions.find(opt => opt.value === formData.maintenance_id) || null}
                  onChange={selected => setFormData({ ...formData, maintenance_id: selected ? selected.value : null })}
                  placeholder="Chọn lịch bảo trì..."
                  isClearable
                />
              </Form.Group>
            </Form>
          )}
          {modalType === "delete" && (
            <p>Bạn có chắc muốn xóa lịch sử sửa chữa <strong>{selectedHistory?.issue_description}</strong> không?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>❌ Hủy</Button>
          {(modalType === "add" || modalType === "edit") && <Button variant="primary" onClick={handleSave}>💾 Lưu</Button>}
          {modalType === "delete" && <Button variant="danger" onClick={handleConfirmDelete}>✔️ Xóa</Button>}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
