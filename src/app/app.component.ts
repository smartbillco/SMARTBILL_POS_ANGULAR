import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoaderService } from './services/loader.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  isLoading: Subject<boolean> = this.loaderService.isLoading;

  constructor(
    private spinner: NgxSpinnerService,
    private loaderService: LoaderService
  ) {
    this.loaderService.isLoading.subscribe((show) => {
      if (show) this.spinner.show();
      else this.spinner.hide();
    });
  }
}
