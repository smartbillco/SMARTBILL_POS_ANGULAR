import { Component, OnInit } from "@angular/core";
import { UtilidadesService } from "src/app/services/utilidades.service";
import { RasDian } from "src/app/models/rangosDian";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import swal from "sweetalert2";
declare var $: any;

@Component({
  selector: "app-rangos-dian",
  templateUrl: "./rangos-dian.component.html",
  styles: [],
})
export class RangosDianComponent implements OnInit {
  private idEmpresa: string;
  public listRangosDian: RasDian[];
  public form: FormGroup;

  constructor(
    private _utilidadesService: UtilidadesService,
    public _formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.idEmpresa = localStorage.getItem("idEmpresa");
    this.getRangosDian();

    this.form = this._formBuilder.group({
      prefijo: [""],
      valorInicial: [null, [Validators.required, Validators.maxLength(7)]],
      valorFinal: [null, [Validators.required, Validators.maxLength(7)]],
      resolucion: [null, Validators.required],
      fechaInicioVigencia: [null, Validators.required],
      fechaFinVigencia: [null, Validators.required],
      idEmpresa: [{ id: this.idEmpresa }, Validators.required],
    });
  }

  getRangosDian() {
    this._utilidadesService
      .getRangosDian(this.idEmpresa)
      .subscribe((data: any) => {
        this.listRangosDian = data;
      });
  }

  crearRango() {
    this._utilidadesService
      .isertarNuevoRango(this.form.value)
      .subscribe((data: any) => {
        swal("Operacion exitosa", "Rango agregado correctamente", "success");
        this.getRangosDian();
        $("#modal-insertarRango").modal("hide");
      });
  }
}
