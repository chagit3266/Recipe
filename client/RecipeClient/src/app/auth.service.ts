import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// User interfaces based on the server model
export interface User {
  _id?: string;
  name: string;
  email: string;
  address: string;
  role?: 'admin' | 'user';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  address: string;
  role?: 'admin' | 'user'; // Optional, defaults to 'user' on server
}

export interface UpdatePasswordRequest {
  password: string;
}

export interface AuthResponse {
  userName: string;
  token: string;
}

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/user'; // Adjust this to match your server URL

  /**
   * Sign in (התחברות)
   * @param credentials Email and password
   * @returns Observable with userName and token
   */
  signIn(credentials: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/sign-in`, credentials);
  }

  /**
   * Sign up (הרשמה)
   * @param userData User registration data
   * @returns Observable with userName and token
   */
  signUp(userData: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/sign-up`, userData);
  }

  /**
   * Update password (עדכון סיסמה)
   * @param passwordData New password
   * @param token Authentication token (required)
   * @returns Observable with success message
   */
  updatePassword(passwordData: UpdatePasswordRequest, token: string): Observable<MessageResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<MessageResponse>(`${this.apiUrl}`, passwordData, { headers });
  }

  /**
   * Delete user account (מחיקת משתמש)
   * @param token Authentication token (required)
   * @returns Observable with success message
   */
  deleteUser(token: string): Observable<MessageResponse> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<MessageResponse>(`${this.apiUrl}`, { headers });
  }

  /**
   * Get all users (קבלת כל המשתמשים)
   * Note: This might be better in a separate UserService
   * @returns Observable with array of users (without passwords)
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}


