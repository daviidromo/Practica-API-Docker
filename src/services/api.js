// src/services/api.js

// Nueva IP del servidor para el Sprint 4
const DIRECCION_API = 'http://44.207.19.239:3000';

class ServicioApi {

  async getAll(endpoint) {
    try {
      // Construimos la URL base apuntando al servidor y a la tabla correspondiente
      let url = `${DIRECCION_API}/${endpoint}`;
      
      // Si tenemos un zusuario guardado, lo mandamos por la URL para filtrar
      const miZusuario = localStorage.getItem('zusuario_guardado');
      if (miZusuario) {
        url = `${url}?zusuario=${miZusuario}`;
      }

      // Ejecutamos la petición de lectura
      const respuesta = await fetch(url);
      
      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`);
      }

      // Convertimos y devolvemos los datos recibidos en formato JSON
      const datos = await respuesta.json();
      return datos;
    } catch (error) {
      // Mostramos alerta específica si falla la conexión o la consulta
      alert(`Fallo en la bbdd al cargar los datos de: ${endpoint}`);
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

      // Lanzamos la petición POST para crear el registro en la base de datos
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
      // Mostramos alerta específica si falla la inserción
      alert(`Fallo en la bbdd al intentar crear el registro en: ${endpoint}`);
      return false;
    }
  }

  async update(endpoint, id, datos) {
    try {
      // Aseguramos que la modificación también lleve la firma del usuario
      const miZusuario = localStorage.getItem('zusuario_guardado');
      if (miZusuario) {
        datos.zusuario = miZusuario;
      }

      // Lanzamos la petición PUT para actualizar el registro exacto usando su ID
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
      // Mostramos alerta específica si falla la actualización
      alert(`Fallo en la bbdd al intentar actualizar el registro en: ${endpoint}`);
      return false;
    }
  }

  async delete(endpoint, id) {
    try {
      // Ejecutamos la orden de borrado incluyendo la firma requerida en la URL
      const respuesta = await fetch(`${DIRECCION_API}/${endpoint}/${id}?zusuario=david.romo`, {
        method: 'DELETE'
      });
      
      if (!respuesta.ok) {
        return false;
      }
      
      return true;
    } catch (error) {
      // Mostramos alerta específica si falla la eliminación
      alert(`Fallo en la bbdd al intentar borrar el registro en: ${endpoint}`);
      return false;
    }
  }
}

// Exportamos una única instancia del servicio para toda la aplicación
export default new ServicioApi();