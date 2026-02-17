<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Gestión de Cursos (H5)</h2>

    <div class="card p-4 bg-light mb-5 shadow-sm">
      <h5 class="mb-3">
        <span v-if="editando">Editar Curso</span>
        <span v-else>Alta de Nuevo Curso</span>
      </h5>
      
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-3">
            <label class="form-label fw-bold">Nombre Curso</label>
            <input v-model="nuevo.nombre_curso" type="text" class="form-control" placeholder="Ej: 1º DAW" required>
          </div>

          <div class="col-md-2">
            <label class="form-label fw-bold">Año Académico</label>
            <input v-model="nuevo.anio_academico" type="text" class="form-control" placeholder="2025-2026" required>
          </div>

          <div class="col-md-1">
            <label class="form-label fw-bold">Grupo</label>
            <input v-model="nuevo.grupo" type="text" class="form-control" placeholder="A" required>
          </div>

          <div class="col-md-3">
            <label class="form-label fw-bold">Tutor</label>
            <select v-model="nuevo.tutor_id" class="form-select">
              <option value="">-- Sin asignar --</option>
              
              <option v-for="profe in listaProfesoresLibres" :key="profe.dni_nie" :value="profe.dni_nie">
                {{ profe.nombre }} {{ profe.apellidos }}
              </option>

            </select>
          </div>

          <div class="col-md-1">
            <label class="form-label fw-bold small">Etapa</label>
            <input v-model="nuevo.etapa_id" type="number" class="form-control" required>
          </div>
          
          <div class="col-md-2 d-flex gap-2 justify-content-end">
            <button type="submit" class="btn fw-bold px-4" :class="editando ? 'btn-warning' : 'btn-success'">
              <span v-if="editando">Actualizar</span>
              <span v-else>Crear</span>
            </button>
            
            <button v-if="editando" @click="cancelar" type="button" class="btn btn-secondary">
              X
            </button>
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
          <th>Tutor ID</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="curso in listaCursos" :key="curso.id">
          <td>{{ curso.id }}</td>
          <td>{{ curso.nombre_curso }}</td>
          <td>{{ curso.anio_academico }}</td>
          <td>{{ curso.grupo }}</td>
          <td>{{ curso.tutor_id || 'Sin asignar' }}</td>
          <td>
            <button @click="cargarDatosEnFormulario(curso)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="borrarCurso(curso.id)" class="btn btn-danger btn-sm">Borrar</button>
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
      listaCursos: [],       
      listaProfesores: [],  
      editando: false,
      nuevo: { 
        id: null, 
        nombre_curso: '',
        anio_academico: '2025-2026',
        grupo: '',
        etapa_id: 1, 
        turno_id: 1, 
        aula_id: 1,  
        tutor_id: '' 
      }
    };
  },
  
  // Esto calcula qué profesores están libres para no repetir tutor
  computed: {
    listaProfesoresLibres() {
      let disponibles = [];

      // Recorro todos los profesores uno a uno
      for (let i = 0; i < this.listaProfesores.length; i++) {
        let profe = this.listaProfesores[i];
        let estaOcupado = false;

        // Miro si este profe ya es tutor en algún curso
        for (let j = 0; j < this.listaCursos.length; j++) {
          let curso = this.listaCursos[j];
          if (curso.tutor_id === profe.dni_nie) {
            estaOcupado = true;
            
            // Excepción: Si estoy editando y es EL MISMO curso, cuenta como libre
            if (this.editando && curso.id == this.nuevo.id) {
              estaOcupado = false;
            }
          }
        }

        // Si no está ocupado, lo añado a la lista del desplegable
        if (estaOcupado === false) {
          disponibles.push(profe);
        }
      }

      return disponibles;
    }
  },

  async mounted() {
    await this.cargarTodo();
  },

  methods: {
    async cargarTodo() {
      // Pido los datos al servidor
      this.listaCursos = await api.getAll('cursos');
      this.listaProfesores = await api.getAll('profesores');
    },

    async guardar() {
      // Hago una copia de los datos para enviarlos
      let datosParaEnviar = { ...this.nuevo };

      // Si el tutor está vacío, pongo null para que no falle la base de datos
      if (datosParaEnviar.tutor_id === '') {
        datosParaEnviar.tutor_id = null;
      }

      if (this.editando === false) {
        // --- MODO CREAR ---
        // Tengo que calcular el ID yo mismo: Busco el más alto y sumo 1
        let idMaximo = 0;
        
        for (let i = 0; i < this.listaCursos.length; i++) {
          let curso = this.listaCursos[i];
          let idNumero = parseInt(curso.id); // Convierto a número
          
          if (idNumero > idMaximo) {
            idMaximo = idNumero;
          }
        }

        // El nuevo ID es el máximo + 1
        datosParaEnviar.id = (idMaximo + 1).toString();
        
        await api.create('cursos', datosParaEnviar); 

      } else {
        // --- MODO EDITAR ---
        // Uso el ID que ya tiene
        await api.update('cursos', datosParaEnviar.id, datosParaEnviar);
      }

      this.cancelar(); // Limpio el formulario
      
      // Espero medio segundo y recargo la tabla
      setTimeout(async () => { 
        await this.cargarTodo(); 
      }, 500);
    },

    cargarDatosEnFormulario(curso) {
      // Copio los datos del curso al formulario de arriba
      this.nuevo = { ...curso };
      
      // Si no tiene tutor, pongo comillas vacías para que el select se vea bien
      if (!this.nuevo.tutor_id) {
        this.nuevo.tutor_id = '';
      }
      
      this.editando = true;
    },

    cancelar() {
      // Reseteo todo para empezar de cero
      this.nuevo = { 
        id: null, nombre_curso: '', anio_academico: '2025-2026', grupo: '',
        etapa_id: 1, turno_id: 1, aula_id: 1, tutor_id: '' 
      };
      this.editando = false;
    },

    async borrarCurso(id) {
      let seguro = confirm('¿Seguro que quieres borrar este curso?');
      
      if (seguro) {
        await api.delete('cursos', id);
        await this.cargarTodo();
      }
    }
  }
};
</script>