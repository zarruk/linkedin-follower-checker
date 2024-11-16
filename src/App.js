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
    <div className="app-container">
      <div className="main-card">
        <div className="card-header">
          <h1>Flujo de Automatización</h1>
          <p>Accede a flujos exclusivos para automatizar tus tareas</p>
        </div>

        <div className="card-body">
          {!procesoCompletado ? (
            <>
              {paso === 1 ? (
                <form onSubmit={handleEmailSubmit}>
                  <div className="form-group">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  <button type="submit" className="primary-button">
                    Continuar
                  </button>
                </form>
              ) : (
                <div>
                  <h2>Verifica que sigues a Salomón</h2>
                  <div
                    className="upload-zone"
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
                      <div className="loading-spinner" />
                    ) : (
                      <>
                        <span className="upload-icon">↑</span>
                        <p className="upload-text">Sube tu captura de pantalla</p>
                        <p className="upload-hint">Arrastra aquí o haz clic para seleccionar</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h2 className="success-title">¡Listo!</h2>
              <p className="success-message">Te enviaremos el acceso por correo</p>
              <button onClick={reiniciarProceso} className="secondary-button">
                Volver a empezar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
