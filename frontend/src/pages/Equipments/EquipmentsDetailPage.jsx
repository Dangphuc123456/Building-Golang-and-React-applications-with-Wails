import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  GetEquipmentDetail,
  CreateMaintenance,
  UpdateMaintenance,
  DeleteMaintenance,
  GetAllUsers,
  GetAllSuppliers
} from 'wailsjs/go/main/App';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumbs from '../../components/Breadcrumbs';
import Select from 'react-select';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [formData, setFormData] = useState({
    scheduled_date: '',
    description: '',
    status: 'pending',
    technician_id: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchEquipment = async () => {
    try {
      const data = await GetEquipmentDetail(parseInt(id));
      setEquipment(data);
      setMaintenances(data.schedules || []);
    } catch (err) {
      toast.error('Lấy thông tin thiết bị thất bại: ' + err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await GetAllSuppliers();
      setSuppliers(data);
    } catch (err) {
      toast.error("Không lấy được danh sách nhà cung cấp: " + err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await GetAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Không lấy được danh sách user: " + err);
    }
  };


  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.username : `User #${id}`;
  };

  const getSupplierName = (id) => {
    const s = suppliers.find(sup => sup.id === id || sup.ID === id);
    return s ? s.name || s.Name : `Supplier #${id}`;
  };


  useEffect(() => {
    fetchEquipment();
    fetchUsers();
    fetchSuppliers();
  }, [id]);

  const totalPages = Math.ceil(maintenances.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentMaintenances = maintenances.slice(indexOfFirst, indexOfLast);


  const handleAdd = () => {
    setFormData({ scheduled_date: '', description: '', status: 'pending', technician_id: '' });
    setModalType('add');
    setShowModal(true);
  };

  const handleEdit = (m) => {
    setSelectedMaintenance(m);
    setFormData({
      scheduled_date: m.scheduled_date || '',
      description: m.description || '',
      status: m.status || 'pending',
      technician_id: m.technician_id || ''
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalType === 'add') {
        await CreateMaintenance({ ...formData, equipment_id: equipment.id });
        toast.success('Thêm lịch bảo trì thành công!');
      } else if (modalType === 'edit') {
        await UpdateMaintenance(selectedMaintenance.id, formData);
        toast.success('Cập nhật lịch bảo trì thành công!');
      }
      setShowModal(false);
      fetchEquipment();
    } catch (err) {
      toast.error('Lưu thất bại: ' + err);
    }
  };
  const technicianOptions = users
    .filter(u => u.role === "technician")
    .map(u => ({
      value: u.id,
      label: `${u.id} - ${u.username}`
    }));

  const handleDeleteClick = (m) => {
    setSelectedMaintenance(m);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await DeleteMaintenance(selectedMaintenance.id);
      toast.success('Xóa lịch bảo trì thành công!');
      setShowDeleteModal(false);
      fetchEquipment();
    } catch (err) {
      toast.error('Xóa thất bại: ' + err);
    }
  };

  if (!equipment) return <p>Đang tải...</p>;

  return (
    <div className="container mt-2">
      <ToastContainer />
      <div className="row">
        <Breadcrumbs />
        {/* Thông tin thiết bị */}
        <div className="col-md-4 mb-4">
          <div style={{border:"1px solid #cac2c2ff", borderRadius:"10px", padding:"20px", backgroundColor:"#fff", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", transition:"all 0.3s ease"}}>
            <h5>Thông tin thiết bị</h5>
            <Form.Group className="mb-3 mt-4">
              <Form.Label>Tên thiết bị</Form.Label>
              <Form.Control as="textarea" value={equipment.name} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nhà cung cấp</Form.Label>
              <Form.Control as="textarea" value={getSupplierName(equipment.supplier_id)} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Gía</Form.Label>
              <Form.Control
                type="text"
                value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(equipment.price)}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ngày tạo</Form.Label>
              <Form.Control type="text" value={equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString('vi-VN') : ''} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Control type="text" value={equipment.status} readOnly />
            </Form.Group>
          </div>
        </div>

        {/* Bảng maintenance */}
        <div className="col-md-8">
          <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Lịch bảo trì</h5>
              <Button onClick={handleAdd}>➕Thêm lịch</Button>
            </div>

            <Table bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Kỹ thuật viên</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentMaintenances.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>
                      <Link
                        to={`/maintenance/${m.id}`}
                        style={{
                          color: "#0d6efd",
                          textDecoration: "none",
                          display: "-webkit-box",          
                          WebkitLineClamp: 2,             
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "230px",               
                          margin: "0 auto",
                          cursor: "pointer",
                          wordBreak: "break-word",        
                        }}
                        title={m.description}>
                        {m.description}
                      </Link>
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
                    <td>{getUserName(m.technician_id)}</td>
                    <td>{m.scheduled_date ? new Date(m.scheduled_date).toLocaleDateString('vi-VN') : ''}</td>
                    <td>
                      <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(m)}>✏️ Sửa</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteClick(m)}>🗑️ Xóa</Button>
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
          </div>
        </div>
      </div>

      {/* Modal Thêm/Sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalType === 'add' ? 'Thêm lịch bảo trì' : 'Sửa lịch bảo trì'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Scheduled Date</Form.Label>
              <Form.Control type="date" value={formData.scheduled_date} onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Technician</Form.Label>
              <Select
                options={technicianOptions}
                value={technicianOptions.find(opt => opt.value === formData.technician_id) || null}
                onChange={selected => setFormData({ ...formData, technician_id: selected ? selected.value : null })}
                placeholder="Chọn kỹ thuật viên..."
                isClearable
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>❌ Hủy</Button>
          <Button variant="primary" onClick={handleSave}>💾Lưu</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Xóa */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa lịch bảo trì</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn xóa lịch bảo trì <strong>{selectedMaintenance?.description}</strong> không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>❌ Hủy</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>✔️Xóa</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
