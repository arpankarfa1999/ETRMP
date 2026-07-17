import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { LoginRequest } from '../models/auth.model';

// AUTH SERVICE
// This is the single source of truth for "who is logged in".
// We use a BehaviorSubject so any component can subscribe and always
// gets the *current* value immediately, plus every future update.
// This is our lightweight alternative to NgRx (Option 2 in the brief:
// "Custom State Management using BehaviorSubject + Services").
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'etrmp_token';
  private readonly USER_KEY = 'etrmp_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.restoreUser());
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // json-server has no real auth endpoint, so we look up the matching
  // user record and fabricate a token. Swap the body of this method for
  // a real POST /auth/login call once a real backend exists - nothing
  // else in the app (guards, interceptor, components) needs to change.
  async login(req: LoginRequest): Promise<User> {
    const users = await firstValueFrom(
      this.http.get<User[]>(`${environment.apiUrl}/users?email=${req.email}`)
    );

    const user = users?.[0];
    if (!user || user.password !== req.password) {
      throw new Error('Invalid email or password');
    }

    const fakeJwt = btoa(`${user.id}:${Date.now()}`);
    const storage = req.rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, fakeJwt);
    storage.setItem(this.USER_KEY, JSON.stringify(user));

    this.currentUserSubject.next(user);
    return user;
  }

  logout(): void {
    [localStorage, sessionStorage].forEach(s => {
      s.removeItem(this.TOKEN_KEY);
      s.removeItem(this.USER_KEY);
    });
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    return !!this.currentUser && roles.includes(this.currentUser.role);
  }

  private restoreUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
