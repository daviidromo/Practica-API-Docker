<template>
  <div class="container-fluid px-5 mt-4">
    <h2 class="text-primary mb-4">Configuración de Estados (H7)</h2>
    
    <div class="card p-4 bg-light mb-5 shadow-sm">
      <form @submit.prevent="guardar">
        <div class="row g-3 align-items-end">
          
          <div class="col-md-2">
            <label class="form-label fw-bold">ID (Ej: ACT_DR)</label>
            <input v-model="formulario.id" type="text" class="form-control" required :disabled="estoyEditando">
          </div>
          
          <div class="col-md-3">
            <label class="form-label fw-bold">Nombre</label>
            <input v-model="formulario.nombre" type="text" class="form-control" required>
          </div>
          
          <div class="col-md-3">
            <label class="form-label fw-bold">¿Permite Acceso?</label>
            <select v-model="formulario.permite_acceso" class="form-select">
              <option :value="true">SÍ</option>
              <option :value="false">NO</option>
            </select>
          </div>
          
          <div class="col-md-2">
            <label class="form-label fw-bold">Descripción</label>
            <input v-model="formulario.descripcion" type="text" class="form-control">
          </div>
          
          <div class="col-md-2 d-flex gap-2">
            <button type="submit" class="btn w-100 fw-bold" :class="estoyEditando ? 'btn-warning' : 'btn-success'">
              {{ estoyEditando ? 'Actualizar' : 'Añadir' }}
            </button>
            <button v-if="estoyEditando" @click="limpiar" type="button" class="btn btn-secondary">X</button>
          </div>
        </div>
      </form>
    </div>
    
    <table class="table table-striped border text-center">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acceso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="estado in listaEstados" :key="estado.id">
          <td>{{ estado.id }}</td>
          <td>{{ estado.nombre }}</td>
          <td>
            <span :class="estado.permite_acceso ? 'badge bg-success' : 'badge bg-danger'">
              {{ estado.permite_acceso ? 'SÍ' : 'NO' }}
            </span>
          </td>
          <td>
            <button @click="prepararEdicion(estado)" class="btn btn-warning btn-sm me-2">Editar</button>
            <button @click="eliminar(estado.id)" class="btn btn-danger btn-sm">Borrar</button>
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
      listaEstados: [], 
      estoyEditando: false,
      formulario: { 
        id: '', 
        nombre: '', 
        permite_acceso: true, 
        descripcion: '', 
        zusuario: 'david.romo' 
      }
    };
  },

  async mounted() { 
    await this.cargarLista(); 
  },

  methods: {
    async cargarLista() { 
      try {
        this.listaEstados = await api.getAll('estados_usuario') || []; 
      } catch (error) {
        alert("Fallo en la bbdd al cargar los estados");
      }
    },

    async guardar() {
      let datosParaEnviar = { ...this.formulario };

      // recortamos fechas por si acaso
      if (datosParaEnviar.zfecha) {
        datosParaEnviar.zfecha = datosParaEnviar.zfecha.substring(0, 10);
      }

      try {
        if (this.estoyEditando) {
          await api.update('estados_usuario', datosParaEnviar.id, datosParaEnviar); 
        } else { 
          await api.create('estados_usuario', datosParaEnviar); 
        }
        
        this.limpiar();
        setTimeout(async () => { await this.cargarLista(); }, 500);
      } catch (error) {
        alert("Fallo en la bbdd al guardar el estado");
      }
    },

    prepararEdicion(datos) { 
      this.formulario = { ...datos, zusuario: 'david.romo' }; 
      this.estoyEditando = true; 
    },

    limpiar() { 
      this.formulario = { 
        id: '', 
        nombre: '', 
        permite_acceso: true, 
        descripcion: '', 
        zusuario: 'david.romo' 
      }; 
      this.estoyEditando = false; 
    },

    async eliminar(id_estado) { 
      if (confirm('¿Seguro que quieres borrar este estado?')) { 
        try {
          await api.delete('estados_usuario', id_estado); 
          await this.cargarLista(); 
        } catch (error) {
          alert("Fallo en la bbdd al intentar borrar el estado");
        }
      } 
    }
  }
};
</script>