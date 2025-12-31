import { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, CheckCircle, RefreshCw, Plus, Minus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { inventoryApi } from '../services/api';
import './KitchenInventory.css';

function KitchenInventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Kitchen',
        quantity: 0,
        unit: 'kg',
        minStock: 10,
    });

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const data = await inventoryApi.getAll();
            console.log('Inventory items:', data);
            setItems(data || []);
        } catch (error) {
            console.error('Failed to load inventory:', error);
            toast.error('Failed to load inventory');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (inventoryId, change) => {
        const item = items.find(i => i.inventoryId === inventoryId);
        if (!item) return;

        const newQuantity = Math.max(0, (item.quantity || 0) + change);

        try {
            await inventoryApi.updateStock(inventoryId, newQuantity);
            setItems(prev => prev.map(i =>
                i.inventoryId === inventoryId ? { ...i, quantity: newQuantity } : i
            ));
            toast.success(`Stock updated to ${newQuantity}`);
        } catch (error) {
            console.error('Failed to update stock:', error);
            toast.error('Failed to update stock');
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();

        if (!newItem.name.trim()) {
            toast.error('Please enter item name');
            return;
        }

        try {
            const created = await inventoryApi.create({
                name: newItem.name,
                quantity: parseInt(newItem.quantity) || 0,
                unit: newItem.unit || 'kg',
                minStock: parseInt(newItem.minStock) || 10,
                category: newItem.category || 'Kitchen',
            });

            setItems(prev => [...prev, created]);
            setShowAddModal(false);
            setNewItem({ name: '', category: 'Kitchen', quantity: 0, unit: 'kg', minStock: 10 });
            toast.success('Item added successfully!');
        } catch (error) {
            console.error('Failed to add item:', error);
            toast.error('Failed to add item: ' + error.message);
        }
    };

    const handleDeleteItem = async (inventoryId) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await inventoryApi.delete(inventoryId);
            setItems(prev => prev.filter(i => i.inventoryId !== inventoryId));
            toast.success('Item deleted');
        } catch (error) {
            console.error('Failed to delete item:', error);
            toast.error('Failed to delete item');
        }
    };

    const getStockStatus = (item) => {
        const quantity = item.quantity || 0;
        const minStock = item.minStock || 10;

        if (quantity === 0) return 'out';
        if (quantity <= minStock) return 'low';
        return 'ok';
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'all') return true;

        const status = getStockStatus(item);
        return status === filter;
    });

    const stats = {
        total: items.length,
        inStock: items.filter(i => getStockStatus(i) === 'ok').length,
        lowStock: items.filter(i => getStockStatus(i) === 'low').length,
        outOfStock: items.filter(i => getStockStatus(i) === 'out').length,
    };

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
                <h2>📦 Kitchen Inventory</h2>
                <div className="header-actions">
                    <button className="add-btn" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        Add Item
                    </button>
                    <button className="refresh-btn" onClick={loadInventory}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="inventory-stats">
                <div className="stat-card">
                    <Package size={24} />
                    <div className="stat-info">
                        <span className="stat-number">{stats.total}</span>
                        <span className="stat-text">Total Items</span>
                    </div>
                </div>
                <div className="stat-card success">
                    <CheckCircle size={24} />
                    <div className="stat-info">
                        <span className="stat-number">{stats.inStock}</span>
                        <span className="stat-text">In Stock</span>
                    </div>
                </div>
                <div className="stat-card warning">
                    <AlertTriangle size={24} />
                    <div className="stat-info">
                        <span className="stat-number">{stats.lowStock}</span>
                        <span className="stat-text">Low Stock</span>
                    </div>
                </div>
                <div className="stat-card danger">
                    <AlertTriangle size={24} />
                    <div className="stat-info">
                        <span className="stat-number">{stats.outOfStock}</span>
                        <span className="stat-text">Out of Stock</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="inventory-filters">
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
                    <option value="ok">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                </select>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="no-items">
                    <div className="no-items-icon">📦</div>
                    <h3>No items found</h3>
                    <p>Click "Add Item" to add ingredients like Tomato, Salt, Onion, etc.</p>
                </div>
            ) : (
                <div className="inventory-grid">
                    {filteredItems.map(item => {
                        const status = getStockStatus(item);
                        return (
                            <div key={item.inventoryId} className={`inventory-card status-${status}`}>
                                <div className="item-header">
                                    <h3 className="item-name">{item.name}</h3>
                                    <span className={`stock-badge ${status}`}>
                                        {status === 'out' && 'Out of Stock'}
                                        {status === 'low' && 'Low Stock'}
                                        {status === 'ok' && 'In Stock'}
                                    </span>
                                </div>

                                {item.category && (
                                    <div className="item-category">{item.category}</div>
                                )}

                                <div className="stock-control">
                                    <button
                                        className="stock-btn minus"
                                        onClick={() => handleUpdateStock(item.inventoryId, -1)}
                                        disabled={item.quantity <= 0}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <div className="stock-display">
                                        <span className="stock-value">{item.quantity || 0}</span>
                                        <span className="stock-label">{item.unit || 'pcs'}</span>
                                    </div>
                                    <button
                                        className="stock-btn plus"
                                        onClick={() => handleUpdateStock(item.inventoryId, 1)}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <div className="item-footer">
                                    <span className="min-stock-text">Min: {item.minStock || 10} {item.unit || 'pcs'}</span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteItem(item.inventoryId)}
                                        title="Delete item"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add Kitchen Ingredient</h3>
                            <button className="close-btn" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="modal-form">
                            <div className="form-group">
                                <label>Item Name *</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="e.g. Tomato, Salt, Onion, Rice..."
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option value="Kitchen">Kitchen</option>
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Spices">Spices</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Meat">Meat</option>
                                        <option value="Grains">Grains</option>
                                        <option value="Oil & Ghee">Oil & Ghee</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                    >
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="g">Grams (g)</option>
                                        <option value="L">Liters (L)</option>
                                        <option value="ml">Milliliters (ml)</option>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="packets">Packets</option>
                                        <option value="boxes">Boxes</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Initial Quantity</label>
                                    <input
                                        type="number"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Min Stock Alert</label>
                                    <input
                                        type="number"
                                        value={newItem.minStock}
                                        onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                                        min="0"
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    <Plus size={18} />
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KitchenInventory;
