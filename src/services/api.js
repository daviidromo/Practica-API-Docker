// src/services/api.js

// Nueva IP del servidor para el Sprint 3
const DIRECCION_API = 'http://100.27.173.196:3000';

class ServicioApi {

  async getAll(endpoint) {
    try {
      let url = `${DIRECCION_API}/${endpoint}`;
      
      // Si tenemos un zusuario guardado, lo mandamos por la URL para filtrar
      const miZusuario = localStorage.getItem('zusuario_guardado');
      if (miZusuario) {
        url = `${url}?zusuario=${miZusuario}`;
      }

      const respuesta = await fetch(url);
      
      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`);
      }

      const datos = await respuesta.json();
      return datos;
    } catch (error) {
      console.error(`Error al cargar datos de ${endpoint}:`, error);
      alert(`No se han podido cargar los datos de ${endpoint}. Revisa la consola.`);
      return []; 
    }
  }

  async create(endpoint, datos) {
    try {
      // Inyectamos el zusuario antes de guardar para dejar registro de quién lo hizo
      const miZusuario = localStorage.getItem('zusuario_guardado');
      if (miZusuario) {
        datos.zusuario = miZusuario;
      }

      const respuesta = await fetch(`${DIRECCION_API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!respuesta.ok) {
        throw new Error('Fallo al guardar en la base de datos');
      }

      return true;
    } catch (error) {
      console.error("Error al crear registro:", error);
      alert("Error al intentar guardar los datos. Revisa la consola para más detalles.");
      return false;
    }
  }

  async update(endpoint, id, datos) {
    try {
      const miZusuario = localStorage.getItem('zusuario_guardado');
      if (miZusuario) {
        datos.zusuario = miZusuario;
      }

      const respuesta = await fetch(`${DIRECCION_API}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (!respuesta.ok) {
        throw new Error('Fallo al actualizar');
      }

      return true;
    } catch (error) {
      console.error("Error al modificar registro:", error);
      alert("Error al intentar actualizar los datos.");
      return false;
    }
  }

  async delete(endpoint, id) {
    try {
      const respuesta = await fetch(`${DIRECCION_API}/${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (!respuesta.ok) {
        throw new Error('Fallo al borrar');
      }

      return true;
    } catch (error) {
      console.error("Error al borrar registro:", error);
      alert("Error al intentar borrar el registro. Es posible que esté en uso.");
      return false;
    }
  }
}

export default new ServicioApi();