import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import OrderQueue from './components/OrderQueue';
import OrderHistory from './components/OrderHistory';
import { ordersApi } from './services/api';
import './App.css';

function KitchenApp() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [activePage, setActivePage] = useState('orders');

  const loadOrders = useCallback(async () => {
    try {
      // Get live/open orders
      const liveOrders = await ordersApi.getLiveOrders();

      console.log('Live orders fetched:', liveOrders.length);
      if (liveOrders.length > 0) {
        console.log('Sample order:', liveOrders[0]);
      }

      // Check for new orders
      if (liveOrders.length > lastOrderCount && lastOrderCount > 0) {
        // Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => { });
        } catch (e) { }

        toast.success('New order received!', {
          duration: 5000,
          icon: '🍳',
          style: {
            background: '#22c55e',
            color: '#fff',
            fontSize: '16px',
          },
        });
      }
      setLastOrderCount(liveOrders.length);

      // Map orders to display format
      const displayOrders = liveOrders.map(order => {
        // Get all items - combine kitchenItems and barItems, or use items array
        let allItems = [];
        if (order.kitchenItems && order.kitchenItems.length > 0) {
          allItems = [...allItems, ...order.kitchenItems];
        }
        if (order.barItems && order.barItems.length > 0) {
          allItems = [...allItems, ...order.barItems];
        }
        // If no separate arrays, use items
        if (allItems.length === 0 && order.items) {
          allItems = order.items;
        }

        return {
          id: order.billid || order.billId,
          orderId: order.billid || order.billId,
          customer: order.customer,
          tableNumber: order.customer?.tableNumber,
          items: allItems,
          status: order.status,
          createdAt: order.createdAt,
          total: order.total,
        };
      });

      console.log('Display orders:', displayOrders.length);
      setOrders(displayOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [lastOrderCount]);

  // Initial load
  useEffect(() => {
    loadOrders();
  }, []);

  // Poll for new orders every 5 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => loadOrders();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadOrders]);

  const handleMarkComplete = async (orderId) => {
    try {
      await ordersApi.updateStatus(orderId, 'served');
      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Order marked as served!', {
        icon: '✅',
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update order status');
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'orders':
        return <OrderQueue orders={orders} onMarkComplete={handleMarkComplete} />;
      case 'history':
        return <OrderHistory />;
      default:
        return <OrderQueue orders={orders} onMarkComplete={handleMarkComplete} />;
    }
  };

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="loading-logo">🍳</div>
          <h2>SRI KALKI Kitchen</h2>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster position="top-right" />
      <Header
        liveOrderCount={orders.length}
        onRefresh={loadOrders}
        activePage={activePage}
        onPageChange={setActivePage}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <KitchenApp />
    </ThemeProvider>
  );
}

export default App;
