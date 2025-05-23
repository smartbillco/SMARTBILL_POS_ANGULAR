import { Component, OnInit } from '@angular/core';
import { ReportesService } from 'src/app/services/reportes.service';
import { Reportes } from 'src/app/models/reportes';
import { Constantes } from 'src/app/comun/constantes';
import swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-quickreport',
  templateUrl: './quickreport.component.html',
  styleUrls: ['./quiqckreport.css'],
})
export class QuickreportComponent implements OnInit {

  //constructor(){}
  ngOnInit() { }
  reportesHoy: Reportes;
  reportesAyer: Reportes;
  reportesMesAnterior: Reportes;

  anioBuscar: number;
  meses: any;
  mesBuscar: number;

  fechaInicio: string;
  fechaFin: string;

  nombreMesBuscar: string;
  flagBusqueda: number;
  tipoUsuario: string;

  constructor(private reporteService: ReportesService) {

    let fecha = new Date()
    this.anioBuscar = fecha.getUTCFullYear()
    this.meses = Constantes.MESES;
    this.reportesHoy = new Reportes();
    this.mesBuscar = fecha.getUTCMonth() + 1; //months from 1-12
    var day = fecha.getUTCDate();
    var year = fecha.getUTCFullYear();
    this.consultarBalanceMes()
    this.tipoUsuario = localStorage.getItem('tipoUsuario')

    this.reportesAyer = new Reportes();
    this.reportesMesAnterior = new Reportes();
    this.reporteService.consultarReportesMes(this.mesBuscar,this.anioBuscar).subscribe((response) => {
    this.reportesHoy = response;
    });
    this.reporteService.consultarReportesAyer().subscribe((response) => {
      this.reportesAyer = response;
    });
    
    this.reporteService.consultarReportesMesAnterior().subscribe((response) => {
      this.reportesMesAnterior = response;
    });

  }



  consultarBalanceAnual() {
    $('#modal-balance-anio').modal('hide');
    this.reporteService.consultarReportesAnio(this.anioBuscar).subscribe((response) => {

      console.log(response)
      this.reportesHoy = response;
      this.flagBusqueda = 1


    }, error => Constantes.handleError(error));
  }

  consultarBalanceMes() {
    $('#modal-balance-mes').modal('hide');
    this.reporteService.consultarReportesMes(this.mesBuscar, this.anioBuscar).subscribe((response) => {

      this.flagBusqueda = 0
      this.setNombreMes()
      this.reportesHoy = response;


    }, error => Constantes.handleError(error));
  }

  consultarUltimosSeisMeses() {


  }

  consultarBalanceFechas() {
    $('#modal-balance-fechas').modal('hide');

    let dateIni = new Date(this.fechaInicio)
    let dateEnd = new Date(this.fechaFin)

    if(dateEnd > dateIni){
      this.reporteService.consultarReportesFechas(this.fechaInicio, this.fechaFin).subscribe((response) => {
        this.flagBusqueda = 2
  
        this.reportesHoy = response;
  
  
      }, error => Constantes.handleError(error));
    }else{

      swal('Error','La fecha de inicio debe ser anterior a la fecha de finalización.','error')
    }

  }

  getColorMargen(margen: number) {

    switch (true) {
      case (margen < 0):
        return 'color-margen-ganancia-rojo';
      case (margen > 0 && margen < 5):
        return 'color-margen-ganancia-amarillo';
      case (margen > 5):
        return 'color-margen-ganancia-verde';

    }
  }

  setNombreMes() {
    switch (this.mesBuscar) {
      case 1:
        this.nombreMesBuscar = 'ENERO'
        break;
      case 2:
        this.nombreMesBuscar = 'FEBRERO'
        break;
      case 3:
        this.nombreMesBuscar = 'MARZO'
        break;
      case 4:
        this.nombreMesBuscar = 'ABRIL'
        break;
      case 5:
        this.nombreMesBuscar = 'MAYO'
        break;
      case 6:
        this.nombreMesBuscar = 'JUNIO'
        break;
      case 7:
        this.nombreMesBuscar = 'JULIO'
        break;
      case 8:
        this.nombreMesBuscar = 'AGOSTO'
        break;
      case 9:
        this.nombreMesBuscar = 'SEPTIEMBRE'
        break;
      case 10:
        this.nombreMesBuscar = 'OCTUBRE'
        break;
      case 11:
        this.nombreMesBuscar = 'NOVIEMBRE'
        break;
      case 12:
        this.nombreMesBuscar = 'DICIEMBRE'
        break;
    }
  }
}
