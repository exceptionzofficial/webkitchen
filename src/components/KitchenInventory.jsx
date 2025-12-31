import { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { inventoryApi } from '../services/api';
import './KitchenInventory.css';

function KitchenInventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const data = await inventoryApi.getAll();
            setItems(data);
        } catch (error) {
            console.error('Failed to load inventory:', error);
            // Use empty array if API fails
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (item) => {
        const stock = item.stock || 0;
        const minStock = item.minStock || 10;

        if (stock === 0) return 'out';
        if (stock <= minStock) return 'low';
        return 'ok';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'all') return true;

        const status = getStockStatus(item);
        return status === filter;
    });

    if (loading) {
        return (
            <div className="inventory-loading">
                <div className="loading-spinner"></div>
                <p>Loading inventory...</p>
            </div>
        );
    }

    return (
        <div className="kitchen-inventory">
            <div className="inventory-header">
                <h2>Kitchen Inventory</h2>
                <div className="inventory-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Items</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                        <option value="ok">In Stock</option>
                    </select>
                    <button className="refresh-btn" onClick={loadInventory}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="inventory-stats">
                <div className="stat-card">
                    <Package size={24} />
                    <div className="stat-info">
                        <span className="stat-number">{items.length}</span>
                        <span className="stat-text">Total Items</span>
                    </div>
                </div>
                <div className="stat-card warning">
                    <AlertTriangle size={24} />
                    <div className="stat-info">
                        <span className="stat-number">
                            {items.filter(i => getStockStatus(i) === 'low').length}
                        </span>
                        <span className="stat-text">Low Stock</span>
                    </div>
                </div>
                <div className="stat-card danger">
                    <AlertTriangle size={24} />
                    <div className="stat-info">
                        <span className="stat-number">
                            {items.filter(i => getStockStatus(i) === 'out').length}
                        </span>
                        <span className="stat-text">Out of Stock</span>
                    </div>
                </div>
                <div className="stat-card success">
                    <CheckCircle size={24} />
                    <div className="stat-info">
                        <span className="stat-number">
                            {items.filter(i => getStockStatus(i) === 'ok').length}
                        </span>
                        <span className="stat-text">In Stock</span>
                    </div>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="no-items">
                    <div className="no-items-icon">📦</div>
                    <h3>No items found</h3>
                    <p>Try adjusting your search or filter</p>
                </div>
            ) : (
                <div className="inventory-grid">
                    {filteredItems.map(item => {
                        const status = getStockStatus(item);
                        return (
                            <div key={item.itemId} className={`inventory-card status-${status}`}>
                                <div className="item-header">
                                    <h3 className="item-name">{item.name}</h3>
                                    <span className={`stock-badge ${status}`}>
                                        {status === 'out' && 'Out of Stock'}
                                        {status === 'low' && 'Low Stock'}
                                        {status === 'ok' && 'In Stock'}
                                    </span>
                                </div>
                                <div className="item-details">
                                    <div className="stock-info">
                                        <span className="stock-label">Current Stock</span>
                                        <span className="stock-value">{item.stock || 0}</span>
                                    </div>
                                    <div className="stock-info">
                                        <span className="stock-label">Min Stock</span>
                                        <span className="stock-value">{item.minStock || 10}</span>
                                    </div>
                                </div>
                                {item.category && (
                                    <div className="item-category">{item.category}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default KitchenInventory;
