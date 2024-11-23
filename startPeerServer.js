const { PeerServer } = require('peer');

const peerServer = PeerServer({
  port: 443,
  path: '/services/peerjs',
});

console.log('PeerServer listening on port 443');