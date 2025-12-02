import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h2>🎉 Test de Configuration</h2>
      <p>Si vous voyez ce composant, la configuration React fonctionne !</p>
      <div className="gradient-bg" style={{ padding: '20px', borderRadius: '10px', color: 'white', marginTop: '10px' }}>
        <p>Test du gradient background</p>
      </div>
    </div>
  );
};

export default TestComponent;