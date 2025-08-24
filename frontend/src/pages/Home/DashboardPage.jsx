import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Table, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
} from 'chart.js';
import { GetAllEquipment, GetAllRepairHistories } from 'wailsjs/go/main/App';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, LineElement, PointElement, Title
);

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatCurrency = (value) => VND.format(Number(value || 0));

export default function DashboardPage() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [repairHistories, setRepairHistories] = useState([]);
  const [loadingRepairs, setLoadingRepairs] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(13);


  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const data = await GetAllEquipment();
      setEquipments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Lấy danh sách thiết bị thất bại: ' + (err?.message || err));
    } finally { setLoading(false); }
  };

  const fetchRepairHistories = async () => {
    setLoadingRepairs(true);
    try {
      const data = await GetAllRepairHistories();
      setRepairHistories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Lấy lịch sử bảo trì thất bại: ' + (err?.message || err));
    } finally { setLoadingRepairs(false); }
  };

  useEffect(() => { fetchEquipments(); fetchRepairHistories(); }, []);


  const total = equipments.length;
  const activeCount = equipments.filter(e => String(e.status).toLowerCase() === 'active').length;
  const inactiveCount = equipments.filter(e => String(e.status).toLowerCase() === 'inactive').length;
  const maintenanceCount = equipments.filter(e => String(e.status).toLowerCase() === 'maintenance').length;


  const monthlyCosts = useMemo(() => {
    const arr = Array(12).fill(0);
    equipments.forEach(e => {
      if (e.purchase_date && e.price != null) {
        const d = new Date(e.purchase_date);
        if (!isNaN(d.getTime())) arr[d.getMonth()] += Number(e.price) || 0;
      }
    });
    return arr;
  }, [equipments]);

  const maintenanceMonthlyCosts = useMemo(() => {
    const arr = Array(12).fill(0);
    repairHistories.forEach(r => {
      if (r.repair_date && r.cost != null) {
        const d = new Date(r.repair_date);
        if (!isNaN(d.getTime())) arr[d.getMonth()] += Number(r.cost) || 0;
      }
    });
    return arr;
  }, [repairHistories]);

  // Charts
  const pieData = useMemo(() => ({
    labels: ['Active', 'Inactive', 'Maintenance'],
    datasets: [{
      label: 'Thiết bị theo trạng thái',
      data: [activeCount, inactiveCount, maintenanceCount],
      backgroundColor: ['rgba(75, 192, 192, 0.85)', 'rgba(255, 99, 132, 0.85)', 'rgba(255, 206, 86, 0.85)'],
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
      borderWidth: 1
    }]
  }), [activeCount, inactiveCount, maintenanceCount]);

  const pieOptions = {
    responsive: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } },
      tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}` } }
    }
  };

  const barData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Chi phí mua thiết bị',
      data: monthlyCosts,
      backgroundColor: 'rgba(54, 162, 235, 0.75)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  }), [monthlyCosts]);

  const barOptions = {
    responsive: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Chi phí mua theo tháng' },
      tooltip: { callbacks: { label: ctx => formatCurrency(ctx.parsed.y) } }
    },
    scales: {
      y: { beginAtZero: false, min: 50000000, max: 2000000000, ticks: { callback: value => VND.format(value) } },
      x: { ticks: { autoSkip: false } }
    }
  };

  const lineData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Chi phí bảo trì theo tháng',
      data: maintenanceMonthlyCosts,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.3,
      fill: true,
      pointRadius: 4
    }]
  }), [maintenanceMonthlyCosts]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Chi phí bảo trì theo tháng' },
      tooltip: { callbacks: { label: ctx => formatCurrency(ctx.parsed.y) } }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 500000,
        max: 50000000,
        ticks: {
          callback: value => VND.format(value)
        }
      },
      x: { ticks: { autoSkip: false } }
    }
  };

  const cardStyle = { borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' };
  const statNumber = { fontSize: '2.2rem', fontWeight: 700 };

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); if (currentPage < 1) setCurrentPage(1); }, [totalPages]);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedEquipments = equipments.slice(startIndex, endIndex);

  const renderStatusText = (rawStatus) => {
    if (!rawStatus || String(rawStatus).trim() === '') return '-';
    const s = String(rawStatus).trim().toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div className="container mt-2">
      <ToastContainer />
      <h3 className="mb-1">Dashboard Thiết bị</h3>

      {/* Statistic cards */}
      <Row className="mb-4">
        {[{ title: 'Tổng thiết bị', val: total, bg: '#0d6efd', color: 'white' },
        { title: 'Hoạt động', val: activeCount, bg: '#198754', color: 'white' },
        { title: 'Hỏng', val: inactiveCount, bg: '#dc3545', color: 'white' },
        { title: 'Bảo trì', val: maintenanceCount, bg: '#ffc107', color: '#212529' }
        ].map((s, i) =>
          <Col md={3} key={i} className="mb-3">
            <Card className="text-center" style={{ ...cardStyle, background: s.bg, color: s.color }}>
              <Card.Body>
                <Card.Title>{s.title}</Card.Title>
                <Card.Text style={statNumber}>{loading && s.title === 'Tổng thiết bị' ? <Spinner animation="border" size="sm" /> : s.val}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Left: Pie + Bar, Right: Table */}
      <Row>
        <Col md={4} className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Pie chart cố định */}
          <Card style={{ ...cardStyle, flex: 'none', height: 400 }}>
            <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Card.Title>Biểu đồ trạng thái</Card.Title>
              <div style={{ height: 300, width: '100%' }}>
                <Pie data={pieData} options={{ ...pieOptions, responsive: true, maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
          {/* Bar chart cố định */}
          <Card style={{ ...cardStyle, flex: 'none', height: 400 }}>
            <Card.Body>
              <Card.Title>Chi phí mua theo tháng</Card.Title>
              <div style={{ height: 300 }}>
                <Bar data={barData} options={{ ...barOptions, responsive: true, maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Table */}
        <Col md={8} className="mb-4">
          <Card style={{ ...cardStyle, height: 820 }}>
            <Card.Body>
              <Card.Title>Danh sách thiết bị</Card.Title>
              <div style={{ overflowY: 'auto', maxHeight: '790px' }}>
                <Table bordered hover responsive={false} className="mt-3" style={{ textAlign: 'center' }}>
                  <colgroup>
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '44%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '17%' }} />
                    <col style={{ width: '18%' }} />
                  </colgroup>
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Tên thiết bị</th>
                      <th>Trạng thái</th>
                      <th>Ngày mua</th>
                      <th >Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedEquipments.length === 0 && !loading ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">Không có thiết bị</td>
                      </tr>
                    ) : (
                      displayedEquipments.map(e => (
                        <tr key={e.id}>
                          <td>{e.id}</td>
                          <td style={{ maxWidth: '150px', padding: '4px', textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'block',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                verticalAlign: 'middle',
                              }}
                              title={e.name}>
                              {e.name}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '4px' }}>
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
                                minWidth: '60px',       
                                maxWidth: '100%',       
                                boxSizing: 'border-box',
                                whiteSpace: 'nowrap',   
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={e.status}>
                              {e.status}
                            </span>
                          </td>
                          <td>{e.purchase_date ? new Date(e.purchase_date).toLocaleDateString('vi-VN') : '-'}</td>
                          <td className="text-center">{e.price != null ? formatCurrency(e.price) : '0 ₫'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
              {/* PHÂN TRANG */}
              <div className="d-flex align-items-center justify-content-end mt-1 gap-3">
                <span>Tổng {totalPages} trang ({total} bản ghi)</span>

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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Line chart below */}
      <Row>
        <Col>
          <Card style={{ ...cardStyle, marginBottom: '30px' }}>
            <Card.Body>
              <Card.Title>Chi phí bảo trì theo tháng</Card.Title>
              <div style={{ height: 300 }}>{loadingRepairs ? <Spinner animation="border" size="sm" /> : <Line data={lineData} options={lineOptions} />}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
