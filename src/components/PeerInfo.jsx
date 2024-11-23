import React, { useState, useEffect } from 'react';

function PeerInfo() {
  const [peerInfo, setPeerInfo] = useState(null);

  useEffect(() => {
    fetch('http://localhost:443/src')
      .then(response => response.json())
      .then(data => setPeerInfo(data))
      .catch(error => console.error('Error fetching peer info:', error));
  }, []);

  return (
    <div>
      {peerInfo && (
        <div>
          <p>Name: {peerInfo.name}</p>
          <p>Description: {peerInfo.description}</p>
          <p>Website: {peerInfo.website}</p>
        </div>
      )}
    </div>
  );
}

export default PeerInfo;