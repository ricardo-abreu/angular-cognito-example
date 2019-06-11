import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-signin', // 'app-login'
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  didFail = false;
  isLoading = false;
  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.authService.authIsLoading.subscribe(
      (isLoading: boolean) => this.isLoading = isLoading
    );
    this.authService.authDidFail.subscribe(
      (didFail: boolean) => this.didFail = didFail
    );
  }

  onSubmit(form: NgForm) {
    const usrName = form.value.username;
    const password = form.value.password;

    // also log in with the email? => TODO
    const email = form.value.email;

    this.authService.signIn(usrName, password);
  }
}
