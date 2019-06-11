import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

// components
import { DoctorListComponent } from './doctor-list/doctor-list.component';
import { NewDoctorComponent } from './new-doctor/new-doctor.component';
import { DoctorDashboardComponent } from './doctor-dashboard/doctor-dashboard.component';
import { SignupComponent } from './user/signup/signup.component';
import { SigninComponent } from './user/signin/signin.component';

// modules
import { FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

// services
import { AuthService } from './user/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    DoctorDashboardComponent,
    SignupComponent, //
    SigninComponent //
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule

  ],
  providers: [AuthService], // yup
  bootstrap: [AppComponent]
})
export class AppModule { }
