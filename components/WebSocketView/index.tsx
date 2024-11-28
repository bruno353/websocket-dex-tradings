import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function WebSocketClient() {
    const [ws, setWs] = useState(null);
    const [trades, setTrades] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // const [isConnected, setIsConnected] = useState(false);
    // const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'blockTimestamp', direction: 'desc' });
    // const [selectedTokens, setSelectedTokens] = useState([]);
    const [minAmount, setMinAmount] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const MAX_TRADES = 100;

    const connectWebSocket = () => {
        const websocket = new WebSocket('wss://ws.tech.l3a.xyz');
        
        websocket.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            setError('');
            setConnectionAttempts(0);

            websocket.send(JSON.stringify({
                "action": "subscribe",
                "channel": "dex_trades",
                "exchange": "uniswap-v2"
            }));
        };

        websocket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            
            if (Array.isArray(messageData.data)) {
                setTrades(prevTrades => {
                    const newTrades = [...messageData.data, ...prevTrades];
                    return newTrades.slice(0, MAX_TRADES);
                });
                
                // Update token list
                messageData.data.forEach(trade => {
                    setSelectedTokens(prev => {
                        const tokens = new Set(prev);
                        tokens.add(trade.tokenBought);
                        tokens.add(trade.tokenSold);
                        return Array.from(tokens);
                    });
                });
            }
        };

        websocket.onerror = (error) => {
            console.error(`WebSocket Error: ${error}`);
            setError('Connection error occurred');
            setIsConnected(false);
        };

        websocket.onclose = () => {
            console.log('WebSocket closed');
            setIsConnected(false);
            
            // Implement reconnection logic
            if (connectionAttempts < 5) {
                setTimeout(() => {
                    setConnectionAttempts(prev => prev + 1);
                    connectWebSocket();
                }, 5000);
            } else {
                setError('Unable to establish connection after multiple attempts');
            }
        };

        setWs(websocket);
        return websocket;
    };

    useEffect(() => {
        const websocket = connectWebSocket();
        return () => websocket.close();
    }, []);

    const formatTaker = (taker) => {
        return `${taker.slice(0, 6)}...${taker.slice(-6)}`;
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filterAndSortTrades = () => {
        let filtered = trades.filter(trade => {
            const matchesSearch = 
                trade.tokenBought.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trade.taker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trade.amountSold.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trade.amountBought.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesAmount = !minAmount || 
                parseFloat(trade.amountBought) >= parseFloat(minAmount) ||
                parseFloat(trade.amountSold) >= parseFloat(minAmount);
            
            const matchesTokens = selectedTokens.length === 0 || 
                selectedTokens.includes(trade.tokenBought) ||
                selectedTokens.includes(trade.tokenSold);
            
            return matchesSearch && matchesAmount && matchesTokens;
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (sortConfig.key === 'blockTimestamp') {
                    return sortConfig.direction === 'asc' 
                        ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
                        : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
                }
                
                if (sortConfig.key === 'amountBought' || sortConfig.key === 'amountSold') {
                    return sortConfig.direction === 'asc'
                        ? parseFloat(a[sortConfig.key]) - parseFloat(b[sortConfig.key])
                        : parseFloat(b[sortConfig.key]) - parseFloat(a[sortConfig.key]);
                }
                
                return sortConfig.direction === 'asc'
                    ? a[sortConfig.key].localeCompare(b[sortConfig.key])
                    : b[sortConfig.key].localeCompare(a[sortConfig.key]);
            });
        }

        return filtered;
    };

    return (
        <div className="py-8 bg-gray-100 px-4 md:px-[100px] min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">DEX Trades</h2>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600' : 'bg-red-600'}`} />
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                    <button 
                        onClick={() => {
                            if (ws) ws.close();
                            connectWebSocket();
                        }}
                        className="p-2 rounded hover:bg-gray-200"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px] max-w-[300px]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search trades... New force"
                            className="w-full p-2 rounded border border-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-[200px] max-w-[300px]">
                    <input
                        type="number"
                        placeholder="Min amount filter"
                        className="w-full p-2 rounded border border-gray-300"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="autoScroll"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                    />
                    <label htmlFor="autoScroll">Auto-scroll</label>
                </div>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-[10px] shadow-lg overflow-x-auto">
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="text-left">
                            <th className="py-2 px-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('taker')}>
                                Taker {sortConfig.key === 'taker' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="py-2 px-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('tokenBought')}>
                                Token Bought {sortConfig.key === 'tokenBought' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="py-2 px-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('tokenSold')}>
                                Token Sold {sortConfig.key === 'tokenSold' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="py-2 px-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('amountBought')}>
                                Amount Bought {sortConfig.key === 'amountBought' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="py-2 px-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('amountSold')}>
                                Amount Sold {sortConfig.key === 'amountSold' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="py-2 px-4">Transaction Hash</th>
                            <th className="py-2 px-4 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('blockTimestamp')}>
                                Time {sortConfig.key === 'blockTimestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterAndSortTrades().map((trade, index) => (
                            <tr key={`${trade.transactionHash}-${index}`} className={`${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-gray-100`}>
                                <td className="py-3 px-4 border">{formatTaker(trade.taker)}</td>
                                <td className="py-3 pr-1 pl-4 border min-w-[120px]">
                                    <div className='flex'>
                                        <a 
                                            className="text-[#2d3c91] hover:underline" 
                                            href={`https://etherscan.io/address/${trade.tokenBoughtAddr}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {trade.tokenBought}
                                        </a>
                                        <img src={`/up-arrow.svg`} alt="up arrow" className="ml-auto"/>
                                    </div>
                                </td>
                                <td className="py-3 pr-1 pl-4 border min-w-[120px]">
                                    <div className='flex'>
                                        <a 
                                            className="text-[#2d3c91] hover:underline" 
                                            href={`https://etherscan.io/address/${trade.tokenSoldAddr}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {trade.tokenSold}
                                        </a>
                                        <img src={`/down-arrow.svg`} alt="down arrow" className="ml-auto"/>
                                    </div>
                                </td>
                                <td className="py-3 px-4 border">{parseFloat(trade.amountBought).toFixed(5)}</td>
                                <td className="py-3 px-4 border">{parseFloat(trade.amountSold).toFixed(5)}</td>
                                <td className="py-3 px-4 border">
                                    <a 
                                        className="text-[#2d3c91] hover:underline" 
                                        href={`https://etherscan.io/tx/${trade.transactionHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {formatTaker(trade.transactionHash)}
                                    </a>
                                </td>
                                <td className="py-3 px-4 border">{formatDate(trade.blockTimestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default WebSocketClient;
