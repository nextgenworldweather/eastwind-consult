import React, { useEffect, useRef, useState } from 'react';
import { createPeer } from '../utils/peerService';
import { db } from '../utils/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import '../styles/components/VideoConference.css';

const VideoConference = ({ username }) => {
  const [peer, setPeer] = useState(null);
  const [peers, setPeers] = useState({});
  const [calls, setCalls] = useState([]);
  const localVideoRef = useRef(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [roomId, setRoomId] = useState('main');
  const streamRef = useRef(null);

  useEffect(() => {
    const initPeer = async () => {
      const newPeer = createPeer();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Handle incoming calls
        newPeer.on('call', (call) => {
          call.answer(stream);
          handleCall(call);
        });

        // Add peer ID to Firebase
        const peerRef = ref(db, `videoRooms/${roomId}/peers/${username}`);
        set(peerRef, { peerId: newPeer.id, timestamp: Date.now() });

        setPeer(newPeer);

        // Listen for peers in room
        const roomRef = ref(db, `videoRooms/${roomId}/peers`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
          const peersData = snapshot.val() || {};
          setPeers(peersData);

          // Call new peers
          Object.entries(peersData).forEach(([peerUsername, peerData]) => {
            if (
              peerUsername !== username &&
              !calls.some((c) => c.peer === peerData.peerId)
            ) {
              const call = newPeer.call(peerData.peerId, stream);
              handleCall(call, peerUsername);
            }
          });
        });

        // Cleanup logic
        return () => {
          unsubscribe();
          stream.getTracks().forEach((track) => track.stop());
          newPeer.destroy();
          remove(peerRef);
        };
      } catch (err) {
        console.error('Failed to access media devices:', err);
      }
    };

    initPeer();
  }, [username, roomId]);

  const handleCall = (call, peerUsername = 'Unknown') => {
    call.on('stream', (remoteStream) => {
      setCalls((prev) => {
        // Remove any existing call with the same peer
        const filtered = prev.filter((c) => c.peer !== call.peer);
        return [
          ...filtered,
          {
            call,
            stream: remoteStream,
            peer: call.peer,
            username: peerUsername,
          },
        ];
      });
    });

    call.on('close', () => {
      setCalls((prev) => prev.filter((c) => c.peer !== call.peer));
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
    });
  };

  const toggleVideo = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const joinRoom = (newRoomId) => {
    // Leave current room
    remove(ref(db, `videoRooms/${roomId}/peers/${username}`));
    // Join new room
    setRoomId(newRoomId);
  };

  return (
    <div className="video-conference">
      <div className="room-controls">
        <select
          value={roomId}
          onChange={(e) => joinRoom(e.target.value)}
          className="room-selector"
        >
          <option value="main">Main Room</option>
          <option value="room1">Room 1</option>
          <option value="room2">Room 2</option>
          <option value="room3">Room 3</option>
        </select>
        <span className="room-info">Current Room: {roomId}</span>
      </div>
      <div className="video-grid">
        {/* Local Video */}
        <div className="video-container local">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <div className="video-label">You ({username})</div>
          <div className="video-controls">
            <button
              onClick={toggleVideo}
              className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
            >
              {videoEnabled ? '🎥' : '❌'}
            </button>
            <button
              onClick={toggleAudio}
              className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
            >
              {audioEnabled ? '🎤' : '🔇'}
            </button>
          </div>
        </div>

        {/* Remote Videos */}
        {calls.map((call, index) => (
          <div key={index} className="video-container remote">
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video) video.srcObject = call.stream;
              }}
            />
            <div className="video-label">{call.username}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoConference;
