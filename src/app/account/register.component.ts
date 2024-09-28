import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;

    // Define the list of countries
    countries: string[] = ['United States', 'Canada', 'India', 'Australia', 'United Kingdom'];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.required],
            phone: ['', Validators.required],
            country: ['', Validators.required], // Country field is required
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, {
            validator: this.mustMatch('password', 'confirmPassword') // custom validator for password match
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.accountService.register(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Registration successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../login'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    // Custom validator to check if password and confirm password fields match
    mustMatch(password: string, confirmPassword: string) {
        return (formGroup: AbstractControl) => {
            const passwordControl = formGroup.get(password);
            const confirmPasswordControl = formGroup.get(confirmPassword);

            if (confirmPasswordControl?.errors && !confirmPasswordControl.errors.mustMatch) {
                return;
            }

            if (passwordControl?.value !== confirmPasswordControl?.value) {
                confirmPasswordControl?.setErrors({ mustMatch: true });
            } else {
                confirmPasswordControl?.setErrors(null);
            }
        };
    }
}
