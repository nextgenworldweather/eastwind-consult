import React, { useEffect, useRef, useState } from 'react';
import { createPeer } from '../utils/peerService';
import '../styles/components/VideoConference.css';

const VideoConference = ({ username }) => {
  const [peer, setPeer] = useState(null);
  const [calls, setCalls] = useState([]);
  const localVideoRef = useRef(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    const initPeer = async () => {
      const newPeer = createPeer();
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        newPeer.on('call', call => {
          call.answer(stream);
          call.on('stream', remoteStream => {
            setCalls(prev => [...prev, { call, stream: remoteStream }]);
          });
        });

        setPeer(newPeer);
      } catch (err) {
        console.error('Failed to get media devices:', err);
      }
    };

    initPeer();

    return () => {
      peer?.destroy();
    };
  }, []);

  const toggleVideo = () => {
    const stream = localVideoRef.current.srcObject;
    stream.getVideoTracks().forEach(track => {
      track.enabled = !videoEnabled;
    });
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    const stream = localVideoRef.current.srcObject;
    stream.getAudioTracks().forEach(track => {
      track.enabled = !audioEnabled;
    });
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className="video-conference">
      <div className="video-grid">
        <div className="video-container local">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <div className="video-label">You ({username})</div>
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
            <div className="video-label">Remote User</div>
          </div>
        ))}
      </div>
      <div className="video-controls">
        <button onClick={toggleVideo}>
          {videoEnabled ? 'Disable Video' : 'Enable Video'}
        </button>
        <button onClick={toggleAudio}>
          {audioEnabled ? 'Mute' : 'Unmute'}
        </button>
      </div>
    </div>
  );
};

export default VideoConference;