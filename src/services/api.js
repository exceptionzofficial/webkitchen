// API Service for SRI KALKI Kitchen Dashboard
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://jumjum-backend.vercel.app/api';

// Billing/Orders API
export const ordersApi = {
    // Get all orders/bills
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/billing`);
        const data = await response.json();
        console.log('API Response:', data);
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Get today's orders
    getToday: async () => {
        const response = await fetch(`${API_BASE_URL}/billing/today`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Get pending/open orders (live orders)
    getLiveOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/billing`);
        const data = await response.json();
        console.log('API Response for live orders:', data);
        if (!data.success) throw new Error(data.error);

        // Filter for open/pending status (not served/completed)
        return data.data.filter(order => {
            const status = order.status?.toLowerCase() || 'open';
            return status === 'open' || status === 'pending' || status === 'preparing' || status === 'ready';
        });
    },

    // Update order status
    updateStatus: async (billid, status) => {
        const response = await fetch(`${API_BASE_URL}/billing/${billid}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },
};

// Kitchen Inventory API
export const inventoryApi = {
    // Get all kitchen inventory items
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}/kitchen-inventory`);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Refill/Update stock level
    updateStock: async (inventoryId, quantity) => {
        const response = await fetch(`${API_BASE_URL}/kitchen-inventory/${inventoryId}/refill`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Create inventory item
    create: async (item) => {
        const response = await fetch(`${API_BASE_URL}/kitchen-inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: item.name,
                quantity: item.quantity || 0,
                unit: item.unit || 'pcs',
                minStock: item.minStock || 10,
                category: item.category || 'Kitchen',
            }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Update inventory item
    update: async (inventoryId, updates) => {
        const response = await fetch(`${API_BASE_URL}/kitchen-inventory/${inventoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },

    // Delete inventory item
    delete: async (inventoryId) => {
        const response = await fetch(`${API_BASE_URL}/kitchen-inventory/${inventoryId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.data;
    },
};

export default { ordersApi, inventoryApi };
