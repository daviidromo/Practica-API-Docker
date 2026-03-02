<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Cursos (H5)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="editando">Editar Curso (ID: {{ nuevo.id }})</span>
        <span v-else>Alta de Nuevo Curso</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-2">
            <label class="form-label fw-bold">ID (Ej: 1DAM_DR)</label>
            <input v-model="nuevo.id" type="text" class="form-control" placeholder="ID único" required :disabled="editando">
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Nombre Curso</label>
            <input v-model="nuevo.nombre_curso" type="text" class="form-control" placeholder="Ej: 1º DAW" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Año Académico</label>
            <input v-model="nuevo.anio_academico" type="text" class="form-control" placeholder="2025/2026" required>
          </div>

          <div class="col-md-1">
            <label class="form-label fw-bold">Grupo</label>
            <input v-model="nuevo.grupo" type="text" class="form-control" placeholder="A" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Etapa</label>
            <select v-model="nuevo.etapa_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="etapa in listaEtapas" :key="etapa.id" :value="etapa.id">
                {{ etapa.nombre }}
              </option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Turno</label>
            <select v-model="nuevo.turno_id" class="form-select" required>
              <option value="" disabled>Selecciona...</option>
              <option v-for="turno in listaTurnos" :key="turno.id" :value="turno.id">
                {{ turno.nombre }}
              </option>
            </select>
          </div>

          <div class="col-md-3 mt-3">
            <label class="form-label fw-bold">Tutor (CA2)</label>
            <select v-model="nuevo.tutor_id" class="form-select">
              <option value="">-- Sin asignar --</option>
              <option v-for="profe in listaProfesores" :key="profe.dni_nie" :value="profe.dni_nie">
                {{ profe.nombre }} {{ profe.apellidos }}
              </option>
            </select>
          </div>
          
          <div class="col-md-9 mt-3 d-flex gap-2 justify-content-end">
            <button type="submit" class="btn fw-bold px-4" :class="editando ? 'btn-warning' : 'btn-success'">
              <span>{{ editando ? 'Actualizar Curso' : 'Crear Curso' }}</span>
            </button>
            <button v-if="editando" @click="cancelar" type="button" class="btn btn-secondary px-4">X</button>
          </div>
        </div>
      </form>
    </div>

    <h5 class="mb-3">Listado de Cursos</h5>
    <table class="table table-striped table-hover border">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Año</th>
          <th>Grupo</th>
          <th>Tutor</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="curso in listaCursos" :key="curso.id">
          <td><span class="badge bg-secondary">{{ curso.id }}</span></td>
          <td>{{ curso.nombre_curso }}</td>
          <td>{{ curso.anio_academico }}</td>
          <td>{{ curso.grupo }}</td>
          <td>{{ obtenerNombreTutor(curso.tutor_id) }}</td>
          <td>
            <button @click="verAlumnos(curso)" class="btn btn-info btn-sm me-2 fw-bold text-white">Alumnos</button>
            <button @click="cargarDatosEnFormulario(curso)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="borrarCurso(curso.id)" class="btn btn-danger btn-sm">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="cursoSeleccionado" class="mt-5 p-4 border rounded bg-white shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="text-info mb-0">Alumnos matriculados en: {{ cursoSeleccionado.nombre_curso }} ({{ cursoSeleccionado.id }})</h5>
        <button @click="cursoSeleccionado = null" class="btn-close"></button>
      </div>
      <table class="table table-sm table-bordered">
        <thead class="table-light">
          <tr>
            <th>NIA</th>
            <th>Nombre y Apellidos</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alumno in alumnosDelCurso" :key="alumno.nia">
            <td>{{ alumno.nia }}</td>
            <td>{{ alumno.nombre }} {{ alumno.apellidos }}</td>
            <td>
              <span class="badge" :class="alumno.estado_id === 'ACT_DR' ? 'bg-success' : 'bg-danger'">
                {{ alumno.estado_id }}
              </span>
            </td>
          </tr>
          <tr v-if="alumnosDelCurso.length === 0">
            <td colspan="3" class="text-center text-muted">No hay alumnos inscritos en este curso.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return {
      listaCursos: [],       
      listaProfesores: [],
      listaEtapas: [],
      listaTurnos: [],
      listaAlumnos: [],
      cursoSeleccionado: null,
      editando: false,
      nuevo: { 
        id: '', 
        nombre_curso: '',
        anio_academico: '2025/2026',
        grupo: '',
        etapa_id: '', 
        turno_id: '', 
        aula_id: 'A223_DR', 
        tutor_id: '',
        zusuario: 'david.romo'
      }
    };
  },

  computed: {
    alumnosDelCurso() {
      if (!this.cursoSeleccionado) return [];
      return this.listaAlumnos.filter(a => a.curso_id === this.cursoSeleccionado.id);
    }
  },

  async mounted() {
    await this.cargarTodo();
  },

  methods: {
    async cargarTodo() {
      try {
        this.listaCursos = await api.getAll('cursos') || [];
        this.listaProfesores = await api.getAll('profesores') || [];
        this.listaEtapas = await api.getAll('etapas') || [];
        this.listaTurnos = await api.getAll('turnos') || [];
        this.listaAlumnos = await api.getAll('alumnos') || [];
      } catch (error) {
        alert("Fallo en la bbdd al cargar las listas");
      }
    },

    obtenerNombreTutor(dni) {
      if (!dni) return 'Sin asignar';
      const profe = this.listaProfesores.find(p => p.dni_nie === dni);
      return profe ? `${profe.nombre} ${profe.apellidos}` : dni;
    },

    verAlumnos(curso) {
      this.cursoSeleccionado = curso;
      // baja la pantalla suavemente hasta la tabla de alumnos
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    },

    async guardar() {
      // comprueba si el profesor ya tiene otro curso asignado este año
      if (this.nuevo.tutor_id) {
        const yaEsTutor = this.listaCursos.some(c => 
          c.tutor_id === this.nuevo.tutor_id && 
          c.anio_academico === this.nuevo.anio_academico && 
          c.id !== this.nuevo.id
        );

        if (yaEsTutor) {
          alert("ADVERTENCIA (CA2): Este profesor ya ha sido asignado como tutor de otro curso en el año académico " + this.nuevo.anio_academico);
          return;
        }
      }

      let datosParaEnviar = { ...this.nuevo };
      if (datosParaEnviar.tutor_id === '') datosParaEnviar.tutor_id = null;
      
      // limpiamos zfecha por si acaso para no romper el update
      delete datosParaEnviar.zfecha;

      try {
        if (this.editando) {
          await api.update('cursos', datosParaEnviar.id, datosParaEnviar);
        } else {
          await api.create('cursos', datosParaEnviar); 
        }
        this.cancelar();
        await this.cargarTodo();
      } catch (error) {
        alert("Fallo en la bbdd al guardar el curso");
      }
    },

    cargarDatosEnFormulario(curso) {
      this.nuevo = { ...curso, zusuario: 'david.romo' };
      if (!this.nuevo.tutor_id) this.nuevo.tutor_id = '';
      this.editando = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    cancelar() {
      this.nuevo = { 
        id: '', nombre_curso: '', anio_academico: '2025/2026', grupo: '',
        etapa_id: '', turno_id: '', aula_id: 'A223_DR', tutor_id: '', zusuario: 'david.romo'
      };
      this.editando = false;
      this.cursoSeleccionado = null;
    },

    async borrarCurso(id) {
      // comprueba que el curso no tenga alumnos dentro antes de borrarlo
      const tieneAlumnos = this.listaAlumnos.some(a => a.curso_id === id);
      
      if (tieneAlumnos) {
        alert("ERROR (CA1): No se puede eliminar el curso porque todavía tiene alumnos matriculados. Debes cambiar a los alumnos de curso o eliminarlos primero.");
        return;
      }

      if (confirm('¿Seguro que quieres borrar este curso?')) {
        try {
          await api.delete('cursos', id);
          await this.cargarTodo();
        } catch (error) {
          alert("Fallo en la bbdd al borrar el curso");
        }
      }
    }
  }
};
</script>