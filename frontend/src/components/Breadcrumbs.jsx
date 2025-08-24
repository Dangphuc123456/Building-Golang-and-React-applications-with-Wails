import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    GetSupplierByID,
    GetEquipmentDetail,
    GetMaintenanceDetail
} from 'wailsjs/go/main/App';
import { Spinner } from 'react-bootstrap';

const breadcrumbNameMap = {
    suppliers: 'Nhà cung cấp',
    equipments: 'Thiết bị',
    maintenance: 'Bảo trì',
    repairs: 'Lịch sử'
};

export default function Breadcrumbs() {
    const location = useLocation();
    const [names, setNames] = useState({}); // lưu tên theo ID

    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Lọc chỉ giữ các segment cố định + ID cuối cùng
    const breadcrumbSegments = [];
    for (let i = 0; i < pathSegments.length; i++) {
        const seg = pathSegments[i];
        const prev = pathSegments[i - 1];
        if (breadcrumbNameMap[seg] || !isNaN(seg)) {
            breadcrumbSegments.push(seg);
        }
    }

    useEffect(() => {
        const fetchNames = async () => {
            const newNames = {};
            const lastSeg = breadcrumbSegments[breadcrumbSegments.length - 1];
            const prevSeg = breadcrumbSegments[breadcrumbSegments.length - 2];

            if (!isNaN(lastSeg)) {
                try {
                    if (prevSeg === 'suppliers') {
                        const data = await GetSupplierByID(Number(lastSeg));
                        newNames[lastSeg] = data?.name || `id ${lastSeg}`;
                    } else if (prevSeg === 'equipments') {
                        const data = await GetEquipmentDetail(Number(lastSeg));
                        newNames[lastSeg] = data?.name || `id ${lastSeg}`;
                    } else if (prevSeg === 'maintenance') {
                        const data = await GetMaintenanceDetail(Number(lastSeg));
                        newNames[lastSeg] = data?.description || `id ${lastSeg}`;
                    } else {
                        newNames[lastSeg] = `id ${lastSeg}`;
                    }
                } catch {
                    newNames[lastSeg] = `id ${lastSeg}`;
                }
            }
            setNames(newNames);
        };

        fetchNames();
    }, [location.pathname]);

    const buildPath = (index) => '/' + breadcrumbSegments.slice(0, index + 1).join('/');

    return (
        <nav aria-label="breadcrumb" style={{ marginBottom: '15px' }}>
            <ol className="breadcrumb">
                <li className="breadcrumb-item">
                    <Link to="/">Home</Link>
                </li>
                {breadcrumbSegments.map((seg, idx) => {
                    const isId = !isNaN(seg);
                    let displayName = breadcrumbNameMap[seg] || seg;
                    if (isId) displayName = names[seg] || <Spinner animation="border" size="sm" />;

                    return (
                        <li key={idx} className="breadcrumb-item">
                            <Link
                                to={buildPath(idx)}
                                title={typeof displayName === 'string' ? displayName : ''}
                                style={typeof displayName === 'string' ? {
                                    maxWidth: '150px',
                                    display: 'inline-block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textDecoration: 'none', 
                                    color: '#0d6efd' 
                                } : { textDecoration: 'none', color: '#0d6efd' }}
                            >
                                {displayName}
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
