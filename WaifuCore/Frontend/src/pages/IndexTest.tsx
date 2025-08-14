import React from 'react';

const IndexTest = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Page</h1>
      <p>If you can see this, the basic React setup is working!</p>
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginTop: '20px' }}>
        <h2>Debug Information:</h2>
        <p>Date: {new Date().toISOString()}</p>
        <p>Environment: {import.meta.env.MODE}</p>
      </div>
    </div>
  );
};

export default IndexTest;
