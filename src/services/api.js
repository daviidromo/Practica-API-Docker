// src/services/api.js

// Definimos la IP del servidor del profesor
const API_URL = 'http://100.52.46.68:3000';

class ApiService {

  // --- OBTENER DATOS (GET) ---
  // Recibe el nombre de la tabla (endpoint) y devuelve el array de datos
  async getAll(endpoint) {
    try {
      // Usamos await para esperar a que el servidor responda
      const response = await fetch(`${API_URL}/${endpoint}`);
      
      // Fetch no lanza error en 404 o 500, así que compruebo manualmente si fue bien
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      // Convertimos la respuesta "cruda" a formato JSON usable
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error cargando ${endpoint}:`, error);
      return []; // Devuelvo array vacío para evitar fallos en la vista
    }
  }

  // --- CREAR DATOS (POST) ---
  async create(endpoint, data) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST', // Indicamos que vamos a guardar datos
        headers: {
          'Content-Type': 'application/json' // Avisamos al servidor que enviamos JSON
        },
        body: JSON.stringify(data) // Convertimos el objeto JS a texto plano para enviarlo
      });

      if (!response.ok) {
        throw new Error(`Fallo al crear: ${response.statusText}`);
      }

      return true; // Retorno true para saber en la vista que todo salió bien
    } catch (error) {
      alert("Error al guardar: " + error.message);
      return false;
    }
  }

  // --- ACTUALIZAR DATOS (PUT) ---
  // Necesitamos el ID para saber qué registro modificar
  async update(endpoint, id, data) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Fallo al actualizar: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      alert("Error al actualizar: " + error.message);
      return false;
    }
  }

  // --- BORRAR DATOS (DELETE) ---
  async delete(endpoint, id) {
    try {
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE' // No necesita body ni headers, solo la URL con el ID
      });

      if (!response.ok) {
        throw new Error(`Fallo al borrar: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      alert("Error al eliminar: " + error.message);
      return false;
    }
  }
}

export default new ApiService();