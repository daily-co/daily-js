// This file mocks WebRTC APIs and other browser APIs that are not available in jsdom

class MockMediaStreamTrack {
  constructor() {
    this.id = 'mock-track-id';
    this.kind = 'video';
    this.label = 'Mock Track';
    this.enabled = true;
    this.muted = false;
    this.readyState = 'live';
  }

  clone() {
    return new MockMediaStreamTrack();
  }

  stop() {
    this.readyState = 'ended';
  }

  getCapabilities() {
    return {};
  }

  getConstraints() {
    return {};
  }

  getSettings() {
    return {};
  }

  applyConstraints() {
    return Promise.resolve();
  }
}

class MockMediaStream {
  constructor() {
    this.id = 'mock-stream-id';
    this.active = true;
    this.tracks = [];
  }

  getTracks() {
    return this.tracks;
  }

  getVideoTracks() {
    return this.tracks.filter(track => track.kind === 'video');
  }

  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio');
  }

  addTrack(track) {
    this.tracks.push(track);
  }

  removeTrack(track) {
    const index = this.tracks.indexOf(track);
    if (index > -1) {
      this.tracks.splice(index, 1);
    }
  }

  clone() {
    const cloned = new MockMediaStream();
    this.tracks.forEach(track => cloned.addTrack(track.clone()));
    return cloned;
  }
}

class MockRTCPeerConnection {
  constructor() {
    this.localDescription = null;
    this.remoteDescription = null;
    this.connectionState = 'new';
    this.iceConnectionState = 'new';
    this.iceGatheringState = 'new';
    this.signalingState = 'stable';
    this.onicecandidate = null;
    this.onconnectionstatechange = null;
    this.oniceconnectionstatechange = null;
    this.ontrack = null;
    this.ondatachannel = null;
  }

  createOffer() {
    return Promise.resolve({
      type: 'offer',
      sdp: 'mock-offer-sdp'
    });
  }

  createAnswer() {
    return Promise.resolve({
      type: 'answer',
      sdp: 'mock-answer-sdp'
    });
  }

  setLocalDescription(description) {
    this.localDescription = description;
    return Promise.resolve();
  }

  setRemoteDescription(description) {
    this.remoteDescription = description;
    return Promise.resolve();
  }

  addIceCandidate() {
    return Promise.resolve();
  }

  addTrack(track, stream) {
    return {
      track: track,
      stream: stream
    };
  }

  removeTrack() {
    return Promise.resolve();
  }

  createDataChannel(label) {
    return {
      label: label,
      readyState: 'open'
    };
  }

  close() {
    this.connectionState = 'closed';
  }
}

const mockMediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve(new MockMediaStream())),
  getDisplayMedia: jest.fn(() => Promise.resolve(new MockMediaStream())),
  enumerateDevices: jest.fn(() => Promise.resolve([])),
  getSupportedConstraints: jest.fn(() => ({})),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {
  if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
    return {
      getParameter: jest.fn(() => null),
      getExtension: jest.fn(() => null),
      createShader: jest.fn(() => ({})),
      createProgram: jest.fn(() => ({})),
      createBuffer: jest.fn(() => ({})),
      createTexture: jest.fn(() => ({})),
      createFramebuffer: jest.fn(() => ({})),
      createRenderbuffer: jest.fn(() => ({})),
      createVertexArray: jest.fn(() => ({})),
      deleteShader: jest.fn(),
      deleteProgram: jest.fn(),
      deleteBuffer: jest.fn(),
      deleteTexture: jest.fn(),
      deleteFramebuffer: jest.fn(),
      deleteRenderbuffer: jest.fn(),
      deleteVertexArray: jest.fn(),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      bindBuffer: jest.fn(),
      bindTexture: jest.fn(),
      bindFramebuffer: jest.fn(),
      bindRenderbuffer: jest.fn(),
      bindVertexArray: jest.fn(),
      bufferData: jest.fn(),
      texImage2D: jest.fn(),
      texParameteri: jest.fn(),
      framebufferTexture2D: jest.fn(),
      renderbufferStorage: jest.fn(),
      framebufferRenderbuffer: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      clear: jest.fn(),
      clearColor: jest.fn(),
      clearDepth: jest.fn(),
      viewport: jest.fn(),
      drawArrays: jest.fn(),
      drawElements: jest.fn(),
      getShaderParameter: jest.fn(() => true),
      getProgramParameter: jest.fn(() => true),
      getAttribLocation: jest.fn(() => 0),
      getUniformLocation: jest.fn(() => ({})),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      uniform1f: jest.fn(),
      uniform2f: jest.fn(),
      uniform3f: jest.fn(),
      uniform4f: jest.fn(),
      uniform1i: jest.fn(),
      uniform2i: jest.fn(),
      uniform3i: jest.fn(),
      uniform4i: jest.fn(),
      uniformMatrix2fv: jest.fn(),
      uniformMatrix3fv: jest.fn(),
      uniformMatrix4fv: jest.fn(),
      activeTexture: jest.fn(),
      generateMipmap: jest.fn(),
      pixelStorei: jest.fn(),
      readPixels: jest.fn(),
      checkFramebufferStatus: jest.fn(() => 36053), // FRAMEBUFFER_COMPLETE
      isContextLost: jest.fn(() => false),
      getContextAttributes: jest.fn(() => ({})),
      getSupportedExtensions: jest.fn(() => []),
      canvas: this,
      drawingBufferWidth: 300,
      drawingBufferHeight: 150
    };
  }
  return originalGetContext.call(this, contextType, contextAttributes);
};

// Global mocks
global.MediaStreamTrack = MockMediaStreamTrack;
global.MediaStream = MockMediaStream;
global.RTCPeerConnection = MockRTCPeerConnection;

// Mock navigator
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true
});


// Mock user agent to avoid browser upgrade issues
Object.defineProperty(global.navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  writable: true
});

// Mock window.RTCPeerConnection
global.window.RTCPeerConnection = MockRTCPeerConnection;

// Mock window.MediaStreamTrack
global.window.MediaStreamTrack = MockMediaStreamTrack;

// Mock window.MediaStream
global.window.MediaStream = MockMediaStream;

// Mock global daily-js version
global.__dailyJsVersion__ = '*';
