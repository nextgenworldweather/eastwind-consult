import React, { useEffect, useRef, useState } from 'react';
import { createPeer } from '../utils/peerService';
import { db } from '../utils/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import Moveable from 'react-moveable';
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
  const videoConferenceRef = useRef();
  const [frame, setFrame] = useState({
    translate: [0, 0],
    width: 300,
    height: 400
  });

  useEffect(() => {
    const initPeer = async () => {
      const newPeer = createPeer();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Handle incoming calls
        newPeer.on('call', call => {
          call.answer(stream);
          handleCall(call);
        });

        // Add peer ID to Firebase
        const peerRef = ref(db, `videoRooms/${roomId}/peers/${username}`);
        set(peerRef, {
          peerId: newPeer.id,
          timestamp: Date.now()
        });

        // Remove peer when disconnecting
        window.addEventListener('beforeunload', () => {
          remove(peerRef);
        });

        setPeer(newPeer);

        // Listen for other peers
        const roomRef = ref(db, `videoRooms/${roomId}/peers`);
        onValue(roomRef, (snapshot) => {
          const peersData = snapshot.val() || {};
          setPeers(peersData);

          // Call new peers
          Object.entries(peersData).forEach(([peerUsername, peerData]) => {
            if (peerUsername !== username && !calls.find(c => c.peer === peerData.peerId)) {
              const call = newPeer.call(peerData.peerId, stream);
              handleCall(call, peerUsername);
            }
          });
        });

      } catch (err) {
        console.error('Failed to get media devices:', err);
      }
    };

    initPeer();

    return () => {
      // Cleanup
      streamRef.current?.getTracks().forEach(track => track.stop());
      peer?.destroy();
      remove(ref(db, `videoRooms/${roomId}/peers/${username}`));
    };
  }, [username, roomId]);

  const handleCall = (call, peerUsername = 'Unknown') => {
    call.on('stream', remoteStream => {
      setCalls(prev => {
        // Remove any existing call with the same peer
        const filtered = prev.filter(c => c.peer !== call.peer);
        return [...filtered, {
          call,
          stream: remoteStream,
          peer: call.peer,
          username: peerUsername
        }];
      });
    });

    call.on('close', () => {
      setCalls(prev => prev.filter(c => c.peer !== call.peer));
    });
  };

  const toggleVideo = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  const joinRoom = (newRoomId) => {
    // Leave current room
    remove(ref(db, `videoRooms/${roomId}/peers/${username}`));
    // Join new room
    setRoomId(newRoomId);
  };

  return (
    <>
      <div
        ref={videoConferenceRef}
        className="video-conference-container"
        style={{
          width: frame.width,
          height: frame.height,
          transform: `translate(${frame.translate[0]}px, ${frame.translate[1]}px)`,
          zIndex: 1010
        }}
      >
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
            <div className="video-container local">
              <video ref={localVideoRef} autoPlay muted playsInline />
              <div className="video-label">You ({username})</div>
              <div className="video-controls">
                <button onClick={toggleVideo} className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}>
                  {videoEnabled ? '🎥' : '❌'}
                </button>
                <button onClick={toggleAudio} className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}>
                  {audioEnabled ? '🎤' : '🔇'}
                </button>
              </div>
            </div>
            {calls.map((call, index) => (
              <div key={index} className="video-container remote">
                <video
                  autoPlay
                  playsInline
                  ref={video => {
                    if (video) video.srcObject = call.stream;
                  }}
                />
                <div className="video-label">{call.username}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Moveable
        target={videoConferenceRef.current}
        draggable={true}
        resizable={true}
        throttleResize={0}
        onDrag={({ target, left, top }) => {
          target.style.transform = `translate(${left}px, ${top}px)`;
          setFrame({
            ...frame,
            translate: [left, top]
          });
        }}
        onResize={({ target, width, height, delta }) => {
          const beforeTranslate = delta.beforeTranslate;
          target.style.width = `${width}px`;
          target.style.height = `${height}px`;
          setFrame({
            ...frame,
            translate: [
              frame.translate[0] + beforeTranslate[0],
              frame.translate[1] + beforeTranslate[1]
            ],
            width,
            height
          });
        }}
        keepRatio={false}
        renderDirections={["nw", "ne", "sw", "se", "n", "w", "e", "s"]}
        edge={false}
      />
    </>
  );
};

export default VideoConference;
