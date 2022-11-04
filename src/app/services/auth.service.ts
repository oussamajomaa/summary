import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState = new BehaviorSubject(false);
	constructor(private router: Router) { }

	login(user) {		
		if (user.email === "admin@admin.fr" && user.password === "summary2022!") {
			// localStorage.setItem('status', 'logged')
			this.router.navigateByUrl('summary')
			this.authState.next(true)
		}
		
	}


	logout() {
		this.router.navigate(['']);
		this.authState.next(false)
	}

	isAuthenticated() {
		return this.authState.value
	}
}
