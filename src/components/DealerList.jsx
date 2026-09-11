import { useState, useEffect } from 'react';

export default function DealerList(){
    
    const [dealers, setDealers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
  async function loadDealers() {
    const response = await fetch("/data/dealers.json");

    const data = await response.json();

    setDealers(data.dealers);
  }

  loadDealers();
}, []);

    

    const filteredDealers = dealers.filter(dealer =>
        dealer.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h2>Dealer List</h2>
            <input
                type="text"
                placeholder="Search dealers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <ul>
                {filteredDealers.map(dealer => (
                    <li key={dealer.name}>
                        <h3>{dealer.name}</h3>
                        <p>{dealer.city}, {dealer.province}</p>
                        <p>{dealer.category}</p>
                        <p>{dealer.address}</p>
                        <p>{dealer.phone}</p>
                        <p>{dealer.website}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}