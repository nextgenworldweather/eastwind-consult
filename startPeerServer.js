const { PeerServer } = require('peer');

const peerServer = PeerServer({
  port: 9000,
  path: '/services/peerjs',
});

console.log('PeerServer listening on port 9000');