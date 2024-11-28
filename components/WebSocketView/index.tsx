import { useEffect, useState } from 'react';

function WebSocketClient() {
    const [ws, setWs] = useState<any>(null);
    const [trades, setTrades] = useState<any>([]);
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const websocket = new WebSocket('wss://ws.tech.l3a.xyz');

        websocket.onopen = () => {
            console.log('Conectado ao WebSocket.');

            // Assim que a conexão estiver aberta, enviamos a mensagem de subscrição
            websocket.send(JSON.stringify({
                "action": "subscribe",
                // "channel": "dex_trades",
                "exchange": "uniswap-v2"
            }));
        };

        websocket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            console.log('Mensagem recebida:', messageData);
        
            // Verifique se messageData.data é um array
            if (Array.isArray(messageData.data)) {
                setTrades((prevTrades: any) => [...prevTrades, ...messageData.data]);
            } else {
                console.warn("Campo 'data' ausente ou não é um array:", messageData);
            }
        };

        websocket.onerror = (error) => {
            console.error(`Erro no WebSocket: ${error}`);
        };

        websocket.onclose = () => {
            console.log('WebSocket fechado.');
        };

        // Configura o WebSocket no estado para que possamos enviar mensagens se necessário
        setWs(websocket);

        // Limpeza ao desmontar o componente
        return () => {
            websocket.close();
        };
    }, []);

    const formatTaker = (taker: string) => {
        return `${taker.slice(0, 6)}...${taker.slice(-6)}`;
    };

    const formatDate = (timestamp: string) => {
        const [date, time] = timestamp.split('T');
        return `${date}, ${time.split('Z')[0]}`;
    };

    const filteredTrades = trades.map.filter((trade: any) => {
        return (
            trade.tokenBought.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trade.taker.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trade.amountSold.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trade.amountBought.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    
    return (
        <div className="py-8 bg-gray-100 px-[100px] min-h-screen">
            <h2 className="text-2xl mb-6 font-semibold">Dex trades</h2>
            <div className="mb-[25px] mt-[120px] flex h-[32px] min-w-[150px] max-w-[300px] rounded-[5px] border border-[#D9D9D9] bg-white py-[11px] px-[15px] md:h-[42px]">
                <img
                src={`/search.svg`}
                alt="image"
                className={`mr-[10px] w-[18px]`}
                />
                <input
                type="text"
                placeholder="Search here"
                className=" w-full bg-white text-[10px] font-medium text-[#000000] placeholder-[#575757] outline-none md:text-[14px] 2xl:text-[16px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="bg-white p-8 rounded-[10px] shadow-lg overflow-x-auto max-w-full mx-auto overflow-y-auto max-h-[650px]"> {/* Adicionado overflow-y-auto e max-h-96 */}
                <table className="w-full text-[13px]">
                    <thead>
                        <tr className="text-left">
                            <th className="py-2 px-4">Taker</th>
                            <th className="py-2 px-4">Token Bought</th>
                            <th className="py-2 px-4">Token Sold</th>
                            <th className="py-2 px-4">Amount Bought</th>
                            <th className="py-2 px-4">Amount Sold</th>
                            <th className="py-2 px-4">Transaction Hash</th>
                            <th className="py-2 px-4">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrades.map((trade: any, index: any) => (
                            <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                <td className="py-3 px-4 border">{formatTaker(trade.taker)}</td>
                                <td className="py-3 pr-1 pl-4 border min-w-[120px]"><div className='flex'><a className="text-[#2d3c91]" href={`https://etherscan.io/address/${trade.tokenBoughtAddr}`}>{trade.tokenBought}</a><img src={`/up-arrow.svg`} alt="image" className={`ml-auto`}/></div></td>
                                <td className="py-3 pr-1 pl-4 border min-w-[120px]"><div className='flex'><a className="text-[#2d3c91]" href={`https://etherscan.io/address/${trade.tokenSoldAddr}`}>{trade.tokenSold}</a><img src={`/down-arrow.svg`} alt="image" className={`ml-auto`}/></div></td>
                                <td className="py-3 px-4 border">{parseFloat(trade.amountBought).toFixed(5)}</td>
                                <td className="py-3 px-4 border">{parseFloat(trade.amountSold).toFixed(5)}</td>
                                <td className="py-3 px-4 border"><a className="text-[#2d3c91]" href={`https://etherscan.io/tx/${trade.transactionHash}`}>{formatTaker(trade.transactionHash)}</a></td>
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
