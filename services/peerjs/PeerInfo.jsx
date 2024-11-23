import React, { useState, useEffect } from 'react';

function startPeerServer() {
  const [peerInfo, setPeerInfo] = useState(null);

  useEffect(() => {
    fetch('https://nextgenworldweather.github.io/eastwind-consult/services/peerjs')
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

export default startPeerServer;