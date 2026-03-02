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

          <div class="col-md-2">
            <label class="form-label fw-bold">ID (Ej: A223_DR)</label>
            <input v-model="formulario.id" type="text" class="form-control" placeholder="ID único" required :disabled="estoyEditando">
          </div>
          
          <div class="col-md-2">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Ej: Aula 103" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Ubicación</label>
            <select v-model="formulario.ubicacion_planta" class="form-select" required>
              <option value="" disabled>Seleccione...</option>
              <option value="Planta baja">Planta baja</option>
              <option value="Planta 1">Planta 1</option>
              <option value="Planta 2">Planta 2</option>
              <option value="Espacio Exterior">Espacio Exterior</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Capacidad</label>
            <input v-model="formulario.capacidad_max" type="number" class="form-control" placeholder="30" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Equipamiento</label>
            <input v-model="formulario.equipamiento" type="text" class="form-control" placeholder="Ej: Proyector">
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Estado</label>
            <select v-model="formulario.estado_operativo" class="form-select" required>
              <option value="OP">Operativo</option>
              <option value="MAN">Mantenimiento</option>
              <option value="AVE">Averiado</option>
              <option value="CLAU">Clausurado</option>
            </select>
          </div>
          
          <div class="col-md-12 mt-3 d-flex justify-content-end gap-2">
            <button type="submit" class="btn fw-bold px-4" :class="estoyEditando ? 'btn-warning' : 'btn-success'">
              <span v-if="estoyEditando">Actualizar</span>
              <span v-else>Crear Espacio</span>
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
            <span v-if="espacio.estado_operativo === 'OP'" class="badge bg-success">Operativo</span>
            <span v-else-if="espacio.estado_operativo === 'MAN'" class="badge bg-warning text-dark">Mantenimiento</span>
            <span v-else-if="espacio.estado_operativo === 'AVE'" class="badge bg-danger">Averiado</span>
            <span v-else-if="espacio.estado_operativo === 'CLAU'" class="badge bg-dark">Clausurado</span>
            <span v-else class="badge bg-secondary">{{ espacio.estado_operativo }}</span>
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
      listaDeEspacios: [], 
      estoyEditando: false, 
      formulario: { 
        id: '', 
        nombre: '', 
        ubicacion_planta: '',
        capacidad_max: '', 
        equipamiento: '',
        estado_operativo: 'OP', 
        zusuario: 'david.romo'
      }
    };
  },
  
  async mounted() {
    await this.cargarTodo();
  },

  methods: {
    async cargarTodo() {
      try {
        this.listaDeEspacios = await api.getAll('espacios') || [];
      } catch (error) {
        alert("Fallo en la bbdd al cargar los espacios");
      }
    },

    async guardar() {
      let datosParaEnviar = { ...this.formulario };

      // recortamos la fecha para evitar error 500
      if (datosParaEnviar.zfecha) {
        datosParaEnviar.zfecha = datosParaEnviar.zfecha.substring(0, 10);
      }

      try {
        if (this.estoyEditando) {
          await api.update('espacios', datosParaEnviar.id, datosParaEnviar);
        } else {
          await api.create('espacios', datosParaEnviar); 
        }

        this.cancelar(); 
        setTimeout(async () => { await this.cargarTodo(); }, 500);
      } catch (error) {
        alert("Fallo en la bbdd al guardar el espacio");
      }
    },

    cargarDatosEnFormulario(espacio) {
      this.formulario = { ...espacio, zusuario: 'david.romo' };
      this.estoyEditando = true; 
      
      // bajamos suavemente por si la lista es muy larga
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    cancelar() {
      this.formulario = { 
        id: '', 
        nombre: '', 
        ubicacion_planta: '',
        capacidad_max: '', 
        equipamiento: '',
        estado_operativo: 'OP',
        zusuario: 'david.romo'
      };
      this.estoyEditando = false;
    },

    async borrarEspacio(id) {
      if (confirm('¿Seguro que quieres borrar este espacio?')) {
        try {
          let exito = await api.delete('espacios', id);
          if (exito) {
            await this.cargarTodo();
          } else {
            alert("Fallo en la bbdd: no se puede borrar porque tiene reservas o incidencias asociadas");
          }
        } catch (error) {
          alert("Fallo en la bbdd al borrar el espacio");
        }
      }
    }
  }
};
</script>