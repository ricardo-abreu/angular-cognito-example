import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

// ES Modules, e.g. transpiling with Babel
import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

import { User } from './user.model';

// for any use case, we need to create a CognitoUserPool object by providing a UserPoolId and a ClientId, which are created in AWS
const POOL_DATA = {
  UserPoolId: 'eu-central-1_5eY81mjjg', // Your user pool id here
  ClientId: '3vb5o964hdqsgu0dfms98uf7q2' // Your client id here
};
const userPool = new CognitoUserPool(POOL_DATA);

@Injectable()
export class AuthService {
  authIsLoading = new BehaviorSubject<boolean>(false);
  authDidFail = new BehaviorSubject<boolean>(false);
  authStatusChanged = new Subject<boolean>();
  registeredUser: CognitoUser;

  constructor(private router: Router) {
  }


  // Use case 1 - a user can sign up by using a username, password and email.
  // the email is used to confirm the registration.
  // I can do it manually from AWS tho but i set the email as required because they use it in most tutorials
  signUp(username: string, email: string, password: string): void {
    this.authIsLoading.next(true);
    const user: User = {
      username,
      email,
      password
    };
    const attrList: CognitoUserAttribute[] = [];
    const emailAttribute = {
      Name: 'email',
      Value: user.email
    };
    attrList.push(new CognitoUserAttribute(emailAttribute));
    userPool.signUp(user.username, user.password, attrList, null, (err, result) => {
      if (err) {
        console.log('signUp failed!', err);
        alert(err.message || JSON.stringify(err));

        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        return;
      }
      console.log('signUp worked!', result);
      this.authDidFail.next(false);
      this.authIsLoading.next(false);
      this.registeredUser = result.user;
      console.log('user name is ' + this.registeredUser.getUsername());
    });
    return;
  }

  // Use case 2 - confirming a registered, unauthenticated user using a confirmation code received via email
  confirmUser(username: string, code: string) {
    this.authIsLoading.next(true);
    const userData = {
      Username: username,
      Pool: userPool
    };
    const cognitUser = new CognitoUser(userData);
    cognitUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.log('Confirm registration failed!', err);
        alert(err.message || JSON.stringify(err));

        this.authDidFail.next(true);
        this.authIsLoading.next(false);
        return;
      }
      console.log('Confirm registration worked!', result);
      this.authDidFail.next(false);
      this.authIsLoading.next(false);
      this.router.navigate(['/dashboard']); // go to the doctor dashboard
    });
  }

  // Use case 4 - authentication a user and establishing a user session with the Amazon Cognito Identity service
  // TODO => also allow it to use the email to sign in?
  signIn(username: string, password: string): void {
    this.authIsLoading.next(true);
    const authData = {
      Username: username,
      Password: password
    };
    const authDetails = new AuthenticationDetails(authData);
    const userData = {
      Username: username,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);
    const that = this;
    cognitoUser.authenticateUser(authDetails, {
      onSuccess(result: CognitoUserSession) {
        that.authStatusChanged.next(true);
        that.authDidFail.next(false);
        that.authIsLoading.next(false);
        console.log('user login worked!', result);

        // TODO => Not sure what to do now, with the token.
        /*
        var accessToken = result.getAccessToken().getJwtToken();

        //POTENTIAL: Region needs to be set if not already set previously elsewhere.
        AWS.config.region = '<region>';

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId : '...', // your identity pool id here
            Logins : {
                // Change the key below according to the specific region your user pool is in.
                'cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>' : result.getIdToken().getJwtToken()
            }
        });

        //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
        AWS.config.credentials.refresh((error) => {
            if (error) {
                  console.error(error);
            } else {
                  // Instantiate aws sdk service objects now that the credentials have been updated.
                  // example: var s3 = new AWS.S3();
                  console.log('Successfully logged!');
            }
        });
        */
      },
      onFailure(err) {
        that.authDidFail.next(true);
        that.authIsLoading.next(false);
        console.log('user login failed!', err);
      }
    });
    // this.authStatusChanged.next(true); // create user with cognito data
    return;
  }

  getAuthenticatedUser() {
    return userPool.getCurrentUser();
  }

  // Use case 14. Signing out from the application
  logout() {
    this.getAuthenticatedUser().signOut();
    this.authStatusChanged.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    const user = this.getAuthenticatedUser();
    const obs = new Observable<boolean>((observer) => {
      if (!user) {
        observer.next(false);
      } else {
        user.getSession((err, session) => {
          if (err) {
            observer.next(false);
          } else {
            if (session.isValid()) {
              observer.next(true);
            } else {
              observer.next(false);
            }
          }
        });
      }
      observer.complete();
    });
    return obs;
  }

  initAuth() {
    this.isAuthenticated().subscribe(
      (auth) => this.authStatusChanged.next(auth)
    );
  }
}
