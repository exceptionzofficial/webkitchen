import { useState, useEffect } from 'react';
import { RefreshCw, Sun, Moon, Clock, ChefHat } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

function Header({ liveOrderCount = 0, onRefresh, activePage = 'orders', onPageChange }) {
    const [time, setTime] = useState(new Date());
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    return (
        <header className="header">
            <div className="header-brand">
                <div className="brand-logo">
                    <ChefHat size={24} />
                </div>
                <div className="brand-text">
                    <h1>SRI KALKI Kitchen</h1>
                    <span>Order Management</span>
                </div>
            </div>

            <div className="header-nav">
                <button
                    className={`nav-tab ${activePage === 'orders' ? 'active' : ''}`}
                    onClick={() => onPageChange?.('orders')}
                >
                    🍳 Live Orders
                    {liveOrderCount > 0 && (
                        <span className="order-count-badge">{liveOrderCount}</span>
                    )}
                </button>
                <button
                    className={`nav-tab ${activePage === 'history' ? 'active' : ''}`}
                    onClick={() => onPageChange?.('history')}
                >
                    📋 History
                </button>
            </div>

            <div className="header-right">
                <div className="header-time">
                    <Clock size={16} />
                    {formatTime(time)}
                </div>
                <button className="icon-btn" onClick={onRefresh} title="Refresh">
                    <RefreshCw size={20} />
                </button>
                <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
}

export default Header;
