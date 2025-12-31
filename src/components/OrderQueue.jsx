import OrderCard from './OrderCard';
import './OrderQueue.css';

function OrderQueue({ orders, onMarkComplete }) {
    // Sort orders by creation time (newest first)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="order-queue">
            <div className="queue-header">
                <h2>🍳 Live Orders</h2>
                <span className="order-count">{orders.length} active order{orders.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="queue-content">
                {sortedOrders.length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">📭</div>
                        <h3>No active orders</h3>
                        <p>New orders will appear here automatically</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {sortedOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onMarkComplete={onMarkComplete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderQueue;
