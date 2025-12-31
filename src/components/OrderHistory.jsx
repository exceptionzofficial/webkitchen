import { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, Hash } from 'lucide-react';
import { ordersApi } from '../services/api';
import './OrderHistory.css';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('today');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const allOrders = await ordersApi.getAll();
            console.log('History - All orders:', allOrders.length);

            // Sort by date (newest first)
            const sorted = allOrders.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sorted);
        } catch (error) {
            console.error('Failed to load order history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`;

    const getCustomerName = (customer) => {
        if (!customer) return 'Walk-in Customer';
        if (typeof customer === 'string') return customer;
        return customer.name || 'Walk-in Customer';
    };

    const filteredOrders = orders.filter(order => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (order.billid || order.billId || '').toLowerCase().includes(searchLower) ||
            getCustomerName(order.customer).toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;

        // Date filter
        if (filterDate === 'today') {
            const today = new Date().toDateString();
            const orderDate = new Date(order.createdAt).toDateString();
            return today === orderDate;
        }

        return true;
    });

    if (loading) {
        return (
            <div className="history-loading">
                <div className="loading-spinner"></div>
                <p>Loading order history...</p>
            </div>
        );
    }

    return (
        <div className="order-history">
            <div className="history-header">
                <h2>📋 Order History</h2>
                <div className="history-stats">
                    <span className="stat-item">{filteredOrders.length} orders</span>
                    <span className="stat-item">
                        Total: {formatCurrency(filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                    </span>
                </div>
            </div>

            <div className="history-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by order ID or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="date-filter"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                >
                    <option value="today">Today</option>
                    <option value="all">All Time</option>
                </select>
                <button className="refresh-btn" onClick={loadOrders}>
                    Refresh
                </button>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="no-history">
                    <div className="no-history-icon">📋</div>
                    <h3>No orders found</h3>
                    <p>Orders will appear here</p>
                </div>
            ) : (
                <div className="history-list">
                    {filteredOrders.map(order => (
                        <div key={order.billid || order.billId} className="history-card">
                            <div className="history-card-header">
                                <div className="history-order-id">
                                    #{(order.billid || order.billId)?.slice(-8)}
                                </div>
                                <div className={`status-badge ${order.status || 'open'}`}>
                                    {order.status || 'open'}
                                </div>
                            </div>

                            <div className="history-card-body">
                                <div className="history-row">
                                    <User size={16} />
                                    <span>{getCustomerName(order.customer)}</span>
                                </div>

                                {order.customer?.tableNumber && (
                                    <div className="history-row">
                                        <Hash size={16} />
                                        <span className="table-tag">Table {order.customer.tableNumber}</span>
                                    </div>
                                )}

                                <div className="history-row">
                                    <Calendar size={16} />
                                    <span>{formatDate(order.createdAt)}</span>
                                    <Clock size={16} />
                                    <span>{formatTime(order.createdAt)}</span>
                                </div>
                            </div>

                            <div className="history-card-footer">
                                <span className="items-count">
                                    {order.items?.length || 0} items
                                </span>
                                <span className="order-total">
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistory;
