import React, { useState, useEffect } from 'react';
import Peer from 'peerjs';

function startPeerServer() {
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    const peer = new Peer(undefined, {
      host: '/',
      port: 443,
      path: '/services/peerjs'
    });

    setPeer(peer);

    peer.on('open', (id) => {
      console.log('My peer ID is ' + id);
    });

    return () => {
      peer.destroy();
    };
  }, []);

  return (
    <div>
      {/* ... */}
    </div>
  );
}

export default startPeerServer;