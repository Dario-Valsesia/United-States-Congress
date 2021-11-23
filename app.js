const senate = document.getElementById('tabla-senate');
//const filaAnimacion = document.getElementById('fila-animacion')    
       
const app = Vue.createApp({
    data(){
        return{
            miembros:[],
            partidos:['R','D','ID'],
            estado:'',
            animacion: true,
            statistics: {
              democrats: [],
              republicans: [],
              independents: [],
              averageVotesWithPartyDemocrats: 0,
              averageVotesWithPartyRepublicans: 0,
              averageVotesWithPartyIndependents: 0,
              averageMissedVoteDemocrats: 0,
              averageMissedVoteRepublicans: 0,
              averageMissedVoteIndependents: 0,
              mostLoyal: [],                             //Mas leal
              leastLoyal: [],                            //Menos Leal
              mostEngaged: [],                           //Más comprometido
              leastEngaged: [],                          //Menos compremetido                              
            }
        }
    },
    created(){
        
        let chamber = senate ? 'senate' : 'house'
        //let endpoint = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`;
        let init = {headers: {"X-API-key": "8UUFKE3fEfje8COFWdaLlHC3CcWyVIM67EjNHH4A"}};
        fetch(`https://api.propublica.org/congress/v1/113/${chamber}/members.json`, init)
        .then(res => res.json())
        .then(json => {
        //miembros = json.results[0].members;
        this.miembros = json.results[0].members; 
        this.agregarMiembrosPartido();
        this.agregarPromedio();
        this.agregarEngaged();
        this.agregarLoyal();
        this.agregarPromedioMissed();
        this.animacion = false;
        
        
        })
        .catch(err => console.error(err.message));
        
    },
    methods:{
      agregarEngaged(){
        let miembrosVotaron = this.miembros.filter(miembro=>miembro.total_votes > 0);
        let diezPorciento = Math.ceil(miembrosVotaron.length * 0.1)
        miembrosVotaron.sort((a, b) => {
          if (a['missed_votes_pct'] < b['missed_votes_pct']) {
            return -1;
          }
          if (a['missed_votes_pct'] > b['missed_votes_pct']) {
            return 1;
          }
          return 0;
        });
        let primerosDiez = miembrosVotaron.slice(0, diezPorciento);
        let ultimosDiez = miembrosVotaron.slice(-diezPorciento);
        miembrosVotaron.forEach(miembro=>{
          if (
            miembro['missed_votes_pct'] === primerosDiez[primerosDiez.length - 1]['missed_votes_pct'] &&
            !primerosDiez.includes(miembro)
          ) {
            primerosDiez.push(miembro);
          }
          if (
            miembro['missed_votes_pct'] === ultimosDiez[0]['missed_votes_pct'] &&
            !ultimosDiez.includes(miembro)
          ) {
            ultimosDiez.unshift(miembro);
          }
        })
        this.statistics.mostEngaged = primerosDiez;
        this.statistics.leastEngaged = ultimosDiez;
      },
      agregarLoyal(){
        let miembrosVotaron = this.miembros.filter(miembro=>miembro.total_votes > 0);
        let diezPorciento = Math.ceil(miembrosVotaron.length * 0.1)
        miembrosVotaron.sort((a, b) => {
          if (a['votes_with_party_pct'] < b['votes_with_party_pct']) {
            return -1;
          }
          if (a['votes_with_party_pct'] > b['votes_with_party_pct']) {
            return 1;
          }
          return 0;
        });
        let primerosDiez = miembrosVotaron.slice(0, diezPorciento);
        let ultimosDiez = miembrosVotaron.slice(-diezPorciento);
        miembrosVotaron.forEach(miembro=>{
          let votosPresentados = miembro.total_votes - miembro.missed_votes;
          let numerosEnterosVotos = Math.round((miembro['votes_with_party_pct'] * votosPresentados) / 100);
          miembro['cantidadVotos'] = numerosEnterosVotos;
          if (
            miembro['votes_with_party_pct'] === primerosDiez[primerosDiez.length - 1]['votes_with_party_pct'] &&
            !primerosDiez.includes(miembro)
          ) {
            primerosDiez.push(miembro);
          }
          if (
            miembro['votes_with_party_pct'] === ultimosDiez[0]['votes_with_party_pct'] &&
            !ultimosDiez.includes(miembro)
          ) {
            ultimosDiez.unshift(miembro);
          }
        })
        this.statistics.mostLoyal = ultimosDiez;
        this.statistics.leastLoyal = primerosDiez;
      },
      agregarMiembrosPartido(){
       this.statistics.democrats = this.miembros.filter(miembro => miembro.party === "D");
       this.statistics.republicans = this.miembros.filter(miembro => miembro.party === "R");
       this.statistics.independents = this.miembros.filter(miembro => miembro.party === "ID");
      },
      agregarPromedio(){
        //PROMEDIO DEMOCRATAS
        let sumaTotalDemocratas = 0;
        this.statistics.democrats.forEach(miembro=>{
          sumaTotalDemocratas += miembro.votes_with_party_pct
        })
        let promedioDemocratas = sumaTotalDemocratas / this.statistics.democrats.length;
        //PROMEDIO REPUBLICANOS
        let sumaTotalRepublicanos = 0;
        this.statistics.republicans.forEach(miembro=>{
          sumaTotalRepublicanos += miembro.votes_with_party_pct
        })
        let promedioRepublicanos = sumaTotalRepublicanos / this.statistics.republicans.length;
        //PROMEDIO INDEPENDIENTES
        let sumaTotalIndependientes = 0;
        this.statistics.independents.forEach(miembro=>{
          sumaTotalIndependientes += miembro.votes_with_party_pct
        })
        let promedioIndependientes = sumaTotalIndependientes / this.statistics.independents.length;
        this.statistics.averageVotesWithPartyDemocrats = promedioDemocratas.toFixed(2);
        this.statistics.averageVotesWithPartyRepublicans = promedioRepublicanos.toFixed(2);
        this.statistics.averageVotesWithPartyIndependents = promedioIndependientes.toFixed(2);

      },
      agregarPromedioMissed(){
        //PROMEDIO DEMOCRATAS
        let sumaTotalDemocratas = 0;
        this.statistics.democrats.forEach(miembro=>{
          sumaTotalDemocratas += miembro.missed_votes_pct
        })
        let promedioDemocratas = sumaTotalDemocratas / this.statistics.democrats.length;
        //PROMEDIO REPUBLICANOS
        let sumaTotalRepublicanos = 0;
        this.statistics.republicans.forEach(miembro=>{
          sumaTotalRepublicanos += miembro.missed_votes_pct
        })
        let promedioRepublicanos = sumaTotalRepublicanos / this.statistics.republicans.length;
        //PROMEDIO INDEPENDIENTES
        let sumaTotalIndependientes = 0;
        this.statistics.independents.forEach(miembro=>{
          sumaTotalIndependientes += miembro.missed_votes_pct
        })
        let promedioIndependientes = sumaTotalIndependientes / this.statistics.independents.length;
        this.statistics.averageMissedVoteDemocrats = promedioDemocratas.toFixed(2);
        this.statistics.averageMissedVoteRepublicans = promedioRepublicanos.toFixed(2);
        this.statistics.averageMissedVoteIndependents = promedioIndependientes.toFixed(2);
        

      },
    },
    computed:{
      miembrosFiltrados(){
        let arrayNuevo = []
        arrayNuevo = this.miembros.filter(miembro=>{
          return this.partidos.includes(miembro.party) && (miembro.state === this.estado || this.estado ==='')
        })
        return arrayNuevo;
      }
    }

})

  

app.mount('#app');



/* agregarTabla(array) {
  tBody.innerHTML = "";
  if (array.length === 0) {
    let fila = document.createElement("tr");
    fila.classList.add("filaNula");
    fila.innerHTML = `<td colspan="5">No member found</td>`;
    tBody.appendChild(fila);
  }
  array.forEach(miembro => {
    let fila = document.createElement("tr");
    fila.classList.add('fila')
    fila.innerHTML = `
        <td><a href="${miembro.url}" target="_blank">${miembro.last_name},${miembro.first_name}
        ${miembro.middle_name || ""}</a></td>
        <td>${miembro.party}</td>
        <td>${miembro.state}</td>
        <td>${miembro.seniority}</td>
        <td>${miembro.votes_with_party_pct}%</td>
        `;
    tBody.appendChild(fila);
  });
},

filtrarPartidosEstado(array, partidos, estado) {
  let arrayFiltrado = [];
  array.forEach(miembro => {
    if (miembro.state === estado || estado === "") {
      if (partidos.includes(miembro.party)) {
        arrayFiltrado.push(miembro);
      }
    }
  });
  return arrayFiltrado;
},

filtrarEstado(array, estado) {
  if (estado === "") {
    return array;
  }
  let arrayFiltrado = array.filter(miembro => {
    return miembro.state === estado;
  });
  return arrayFiltrado;
}, */

