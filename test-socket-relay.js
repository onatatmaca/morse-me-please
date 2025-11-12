// Test script to verify socket message relay works
const io = require('socket.io-client');

console.log('🧪 Starting socket relay test...\n');

// Create two client sockets
const client1 = io('http://localhost:3000', { autoConnect: false });
const client2 = io('http://localhost:3000', { autoConnect: false });

let client1Paired = false;
let client2Paired = false;

// Client 1 handlers
client1.on('connect', () => {
  console.log('✅ Client 1 connected:', client1.id);
  client1.emit('set-username', 'TestUser1');
});

client1.on('paired', (data) => {
  console.log('🤝 Client 1 paired with:', data.partnerUsername);
  client1Paired = true;

  // If both paired, send a test signal
  if (client2Paired) {
    setTimeout(() => {
      console.log('\n📤 Client 1 sending dot signal...');
      client1.emit('morse-signal', { signal: 'dot', timestamp: Date.now() });
    }, 500);
  }
});

client1.on('morse-signal', (data) => {
  console.log('📡 Client 1 received morse signal from', data.from, ':', data.signal);
});

client1.on('waiting', () => {
  console.log('⏳ Client 1 waiting for partner...');
});

// Client 2 handlers
client2.on('connect', () => {
  console.log('✅ Client 2 connected:', client2.id);
  client2.emit('set-username', 'TestUser2');
});

client2.on('paired', (data) => {
  console.log('🤝 Client 2 paired with:', data.partnerUsername);
  client2Paired = true;

  // If both paired, let client 1 send a signal
  if (client1Paired) {
    setTimeout(() => {
      console.log('\n📤 Client 2 sending dash signal...');
      client2.emit('morse-signal', { signal: 'dash', timestamp: Date.now() });
    }, 1000);
  }
});

client2.on('morse-signal', (data) => {
  console.log('📡 Client 2 received morse signal from', data.from, ':', data.signal);

  // Test successful - disconnect
  setTimeout(() => {
    console.log('\n✅ Test successful! Both clients can send and receive.');
    console.log('🔌 Disconnecting clients...');
    client1.disconnect();
    client2.disconnect();
    process.exit(0);
  }, 500);
});

client2.on('waiting', () => {
  console.log('⏳ Client 2 waiting for partner...');
});

// Connect both clients
console.log('🔌 Connecting clients...\n');
client1.connect();
setTimeout(() => client2.connect(), 100);

// Timeout after 10 seconds
setTimeout(() => {
  console.log('\n❌ Test timeout - something went wrong!');
  client1.disconnect();
  client2.disconnect();
  process.exit(1);
}, 10000);
