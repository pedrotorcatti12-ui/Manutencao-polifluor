import React from 'react';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif' 
    }}>
      <h1>Manutenção Polifluor</h1>
      <p>O sistema está sendo carregado com sucesso!</p>
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <p>Verifique se as variáveis de ambiente (Gemini e Supabase) estão configuradas no Netlify.</p>
      </div>
    </div>
  );
}

export default App;
