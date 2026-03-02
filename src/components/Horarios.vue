<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Horarios</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="estoyEditando">Modificar Horario (ID: {{ formulario.id }})</span>
        <span v-else>Crear Nuevo Horario</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">

          <div class="col-md-3">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" placeholder="Ej: 1ª Hora" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Hora Inicio</label>
            <input v-model="formulario.hora_inicio" type="time" class="form-control" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Hora Fin</label>
            <input v-model="formulario.hora_fin" type="time" class="form-control" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Turno</label>
            <select v-model="formulario.turno_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="turno in listaTurnos" :key="turno.id" :value="turno.id">
                {{ turno.nombre }}
              </option>
            </select>
          </div>
          
          <div class="col-md-2 d-flex justify-content-end gap-2">
            <button type="submit" class="btn fw-bold w-100" :class="estoyEditando ? 'btn-warning' : 'btn-success'">
              {{ estoyEditando ? 'Actualizar' : 'Añadir' }}
            </button>
            <button v-if="estoyEditando" @click="cancelar" type="button" class="btn btn-secondary">X</button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Horarios Registrados</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Turno</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="horario in listaHorarios" :key="horario.id">
          <td>{{ horario.id }}</td>
          <td>{{ horario.nombre }}</td>
          <td>{{ horario.hora_inicio }}</td>
          <td>{{ horario.hora_fin }}</td>
          <td><span class="badge bg-secondary">{{ horario.turno_id }}</span></td>
          <td>
            <button @click="cargarDatos(horario)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="borrar(horario.id)" class="btn btn-danger btn-sm">Borrar</button>
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
      listaHorarios: [],
      listaTurnos: [],
      estoyEditando: false,
      formulario: { 
        id: null, 
        nombre: '', 
        hora_inicio: '', 
        hora_fin: '', 
        turno_id: '',
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
        // obtenemos horarios y los ordenamos por hora de inicio
        let horarios = await api.getAll('horarios') || [];
        this.listaHorarios = horarios.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
        
        this.listaTurnos = await api.getAll('turnos') || [];
      } catch (error) {
        alert("Fallo en la bbdd al cargar la lista de horarios");
      }
    },

    async guardar() {
      let datosParaEnviar = { ...this.formulario };

      try {
        if (this.estoyEditando) {
          await api.update('horarios', datosParaEnviar.id, datosParaEnviar);
        } else {
          delete datosParaEnviar.id;
          await api.create('horarios', datosParaEnviar); 
        }

        this.cancelar(); 
        setTimeout(async () => { await this.cargarTodo(); }, 500);
      } catch (error) {
        alert("Fallo en la bbdd al intentar guardar el horario");
      }
    },

    cargarDatos(horario) {
      this.formulario = { ...horario, zusuario: 'david.romo' };
      this.estoyEditando = true; 
    },

    cancelar() {
      this.formulario = { 
        id: null, nombre: '', hora_inicio: '', hora_fin: '', turno_id: '', zusuario: 'david.romo'
      };
      this.estoyEditando = false;
    },

    async borrar(id_horario) {
      if (confirm('¿Seguro que quieres borrar este horario?')) {
        try {
          await api.delete('horarios', id_horario);
          await this.cargarTodo();
        } catch (error) {
          alert("Fallo en la bbdd al intentar borrar el registro");
        }
      }
    }
  }
};
</script>