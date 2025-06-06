import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

userForm: FormGroup;
  idEmpresa: number;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.idEmpresa = +this.route.snapshot.paramMap.get('id');
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipo: [1],
      idEmpresa: [this.idEmpresa],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator }); 
  }

  passwordsMatchValidator(form: FormGroup) {
    let password = form.get('password').value
    let confirmPassword = form.get('confirmPassword').value
    return password === confirmPassword ? null : { mismatch: true }
  }

  registerUser(): void {
    if (this.userForm.valid) {
      const {email, password, idEmpresa, tipo} = this.userForm.value;

      this.authService.registrarUsuario({email, password, idEmpresa, tipo}).subscribe({
        next: (res) => {
          swal('Éxito', 'Usuario registrado correctamente', 'success').then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          swal('Error', 'No se pudo registrar el usuario', 'error');
          console.error(err);
        }
      });
    } else {
      this.userForm.markAsTouched();
    }
  }

}
