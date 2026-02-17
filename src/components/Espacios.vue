<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Espacios (H6)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="estoyEditando">Editar Espacio</span>
        <span v-else>Alta de Nuevo Espacio</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-3">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Ej: Aula 103" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Ubicación</label>
            <input v-model="formulario.ubicacion_planta" type="text" class="form-control" placeholder="Ej: Planta Baja" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Capacidad</label>
            <input v-model="formulario.capacidad_max" type="number" class="form-control" placeholder="30" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Equipamiento</label>
            <input v-model="formulario.equipamiento" type="text" class="form-control" placeholder="Ej: Proyector, Pizarra">
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Estado</label>
            <select v-model="formulario.estado_operativo" class="form-select">
              <option value="true">Operativo</option>
              <option value="false">No Operativo</option>
            </select>
          </div>
          
          <div class="col-md-12 mt-3 d-flex justify-content-end gap-2">
            <button type="submit" class="btn fw-bold px-4" :class="estoyEditando ? 'btn-warning' : 'btn-success'">
              <span v-if="estoyEditando">Actualizar</span>
              <span v-else>Crear</span>
            </button>
            
            <button v-if="estoyEditando" @click="cancelar" type="button" class="btn btn-secondary px-4">
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Listado de Espacios</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Ubicación</th>
          <th>Capacidad</th>
          <th>Equipamiento</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="espacio in listaDeEspacios" :key="espacio.id">
          <td>{{ espacio.id }}</td>
          <td>{{ espacio.nombre }}</td>
          <td>{{ espacio.ubicacion_planta }}</td>
          <td>{{ espacio.capacidad_max }}</td>
          <td>{{ espacio.equipamiento }}</td>
          <td>
            <span v-if="espacio.estado_operativo === 'true'" class="badge bg-success">Operativo</span>
            <span v-else class="badge bg-danger">No Operativo</span>
          </td>
          <td>
            <button @click="cargarDatosEnFormulario(espacio)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="borrarEspacio(espacio.id)" class="btn btn-danger btn-sm">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return {
      listaDeEspacios: [], // Aquí guardo lo que viene del servidor
      estoyEditando: false, // Para saber si crear o actualizar
      formulario: { 
        id: null, 
        nombre: '', 
        ubicacion_planta: '',
        capacidad_max: '', 
        equipamiento: '',
        estado_operativo: 'true' // Valor por defecto
      }
    };
  },
  
  async mounted() {
    // Al iniciar, cargamos la lista
    await this.cargarTodo();
  },

  methods: {
    async cargarTodo() {
      // Pido los datos a la tabla 'espacios'
      this.listaDeEspacios = await api.getAll('espacios');
    },

    async guardar() {
      // Hago una copia de los datos para enviarlos
      let datosParaEnviar = { ...this.formulario };

      if (this.estoyEditando === false) {
        // --- MODO CREAR ---
        // Tengo que calcular el ID yo mismo porque el servidor no es autoincremental
        
        let idMasAlto = 0;
        
        // Recorro toda la lista para encontrar el número más alto
        if (this.listaDeEspacios.length > 0) {
           for (let i = 0; i < this.listaDeEspacios.length; i++) {
             let espacio = this.listaDeEspacios[i];
             let numero = parseInt(espacio.id); // Lo convierto a número
             
             if (numero > idMasAlto) {
               idMasAlto = numero;
             }
           }
        }
        
        // El nuevo ID será el más alto + 1
        datosParaEnviar.id = (idMasAlto + 1).toString();
        
        // Lo guardamos en la base de datos
        await api.create('espacios', datosParaEnviar); 

      } else {
        // --- MODO EDITAR ---
        // Actualizamos usando el ID que ya tiene
        await api.update('espacios', datosParaEnviar.id, datosParaEnviar);
      }

      this.cancelar(); // Limpio el formulario
      
      // Espero medio segundo y recargo la tabla para ver los cambios
      setTimeout(async () => { 
        await this.cargarTodo(); 
      }, 500);
    },

    cargarDatosEnFormulario(espacio) {
      // Relleno el formulario con los datos de la fila que he clickado
      this.formulario = { ...espacio };
      this.estoyEditando = true; // Cambio el botón a "Actualizar"
    },

    cancelar() {
      // Dejo el formulario vacío y limpio
      this.formulario = { 
        id: null, 
        nombre: '', 
        ubicacion_planta: '',
        capacidad_max: '', 
        equipamiento: '',
        estado_operativo: 'true'
      };
      this.estoyEditando = false;
    },

    async borrarEspacio(id) {
      let seguro = confirm('¿Seguro que quieres borrar este espacio?');
      
      if (seguro) {
        await api.delete('espacios', id);
        await this.cargarTodo();
      }
    }
  }
};
</script>