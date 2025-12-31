import { Clock, User, ChefHat, Check, Hash } from 'lucide-react';
import './OrderCard.css';

function OrderCard({ order, onMarkComplete }) {
    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const created = new Date(timestamp);
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}h ${diffMins % 60}m ago`;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const tableNumber = order.customer?.tableNumber || order.tableNumber;
    const customerName = order.customer?.name || 'Customer';

    return (
        <div className="order-card">
            {/* Table Number - Prominent Display */}
            <div className="table-header">
                <div className="table-number">
                    <Hash size={20} />
                    <span>Table {tableNumber || 'N/A'}</span>
                </div>
                <div className="order-time">
                    <Clock size={14} />
                    <span>{formatTime(order.createdAt)}</span>
                </div>
            </div>

            {/* Order Info */}
            <div className="order-info">
                <div className="order-id">
                    Order #{order.orderId?.slice(-6) || order.id?.slice(-6)}
                </div>
                <div className="time-ago">{getTimeAgo(order.createdAt)}</div>
            </div>

            {/* Customer */}
            <div className="customer-row">
                <User size={16} />
                <span>{customerName}</span>
            </div>

            {/* Kitchen Items */}
            <div className="order-items">
                <div className="items-header">
                    <ChefHat size={16} />
                    <span>Kitchen Items ({order.items?.length || 0})</span>
                </div>
                <ul className="items-list">
                    {order.items?.map((item, idx) => (
                        <li key={idx} className="item-row">
                            <span className="item-qty">{item.quantity}×</span>
                            <span className="item-name">{item.name}</span>
                            {item.price && (
                                <span className="item-price">₹{item.price * item.quantity}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mark Complete Button */}
            <button
                className="complete-btn"
                onClick={() => onMarkComplete?.(order.id)}
            >
                <Check size={18} />
                Mark as Served
            </button>
        </div>
    );
}

export default OrderCard;
