import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
  });
  const [paso, setPaso] = useState(1);
  const [imagen, setImagen] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [procesoCompletado, setProcesoCompletado] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.nombre) {
      setPaso(2);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImagen(file);
      await verificarImagen(file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImagen(file);
      await verificarImagen(file);
    }
  };

  const verificarImagen = async (file) => {
    setCargando(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('imagen', file);
      formDataUpload.append('nombre', formData.nombre);
      formDataUpload.append('email', formData.email);

      console.log('Enviando datos:', {
        nombre: formData.nombre,
        email: formData.email
      });

      const response = await fetch('/api/verificar-imagen', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();
      setResultado(data);
      setProcesoCompletado(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al procesar la imagen');
    }
    setCargando(false);
  };

  const reiniciarProceso = () => {
    setFormData({ nombre: '', email: '' });
    setPaso(1);
    setImagen(null);
    setResultado(null);
    setCargando(false);
    setProcesoCompletado(false);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>Verificación de Seguidor</h1>
          <p className="subtitle">Accede a flujos exclusivos de automatización</p>
        </div>
        
        {!procesoCompletado ? (
          <>
            {paso === 1 && (
              <form onSubmit={handleEmailSubmit} className="form">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Tu nombre completo"
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="tu@email.com"
                    className="input"
                  />
                </div>
                <button type="submit" className="button">Continuar</button>
              </form>
            )}

            {paso === 2 && (
              <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  type="file"
                  id="file-input"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept="image/*"
                />
                {cargando ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Verificando imagen...</p>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">
                      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p className="upload-text">Arrastra aquí tu pantallazo que muestre que sigues a Salomon Zarruk en LinkedIn</p>
                    <p className="drop-zone-subtitle">o haz clic para seleccionar</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="completion-message">
            <div className="success-icon">✓</div>
            <h2>¡Gracias por tu interés!</h2>
            <p>Si sigues a Salomón, recibirás un correo con los flujos exclusivos muy pronto.</p>
            <button onClick={reiniciarProceso} className="button secondary">Volver a empezar</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
