// Test script to check same-train connections
import TCDDApiService from './src/lib/tcdd-api.js';

async function testSameTrainConnections() {
  console.log('🔍 Testing same-train connections with trainSegments...');
  
  try {
    // Test with some common station IDs (you can replace these with actual station IDs)
    // Let's try Ankara (5500001) to Istanbul (5500002) - these are common routes
    const connections = await TCDDApiService.findSameTrainConnections(
      5500001, // Ankara
      5500002, // Istanbul
      '2024-12-19' // Tomorrow's date
    );
    
    console.log(`✅ Test completed! Found ${connections.length} same-train connections`);
    console.log('Connections:', connections);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSameTrainConnections();
