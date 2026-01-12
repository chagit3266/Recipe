import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Recipe interfaces based on the server model
export interface RecipeOwner {
  _id: string;
  name: string;
}

export interface RecipeCategory {
  _id: string;
  description: string;
}

export interface RecipeLayer {
  description: string;
  ingredients: string[];
}

export interface Recipe {
  _id?: string;
  name: string;
  description?: string;
  category?: RecipeCategory[]; // Model uses 'category' (singular)
  categories?: RecipeCategory[]; // Some responses may use 'categories' (plural)
  preparationTime: number;
  difficultyLevel: number;
  layers?: RecipeLayer[];
  prepSteps?: string[];
  img?: string;
  isPrivate?: boolean;
  owner?: RecipeOwner;
  dateCreated?: Date;
  dateUpdated?: Date;
}

export interface RecipeQueryParams {
  search?: string;
  limit?: number;
  page?: number;
  maxTime?: number;
}

export interface AddRecipeRequest {
  name: string;
  description?: string;
  categories?: string[];
  preparationTime: number;
  difficultyLevel: number;
  layers?: RecipeLayer[];
  prepSteps?: string[];
  img?: string;
  isPrivate?: boolean;
}

export interface UpdateRecipeRequest {
  _id: string;
  newRecipe: Partial<AddRecipeRequest>;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/recipe'; // Adjust this to match your server URL

  /**
   * Get all recipes
   * If a token exists, includes user's private recipes as well
   * @param params Optional query parameters: search, limit, page, maxTime
   * @param token Optional authentication token
   */
  getAllRecipes(params?: RecipeQueryParams, token?: string): Observable<Recipe[]> {
    let httpParams = new HttpParams();
    
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.maxTime) {
      httpParams = httpParams.set('maxTime', params.maxTime.toString());
    }

    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    return this.http.get<Recipe[]>(this.apiUrl, { params: httpParams, headers });
  }

  /**
   * Get recipe by ID
   * @param id Recipe ID
   * @param token Optional authentication token
   */
  getRecipeById(id: string, token?: string): Observable<Recipe> {
    const httpParams = new HttpParams().set('_id', id);
    const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

    // Note: Server controller expects _id in query params
    // Route is /:id but controller uses req.query._id
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`, { params: httpParams, headers });
  }

  /**
   * Add a new recipe
   * @param recipe Recipe data
   * @param token Authentication token (required)
   */
  addRecipe(recipe: AddRecipeRequest, token: string): Observable<Recipe> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Recipe>(this.apiUrl, recipe, { headers });
  }

  /**
   * Update an existing recipe
   * @param updateData Object containing _id and newRecipe
   * @param token Authentication token (required)
   */
  updateRecipe(updateData: UpdateRecipeRequest, token: string): Observable<Recipe> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const httpParams = new HttpParams().set('_id', updateData._id);
    
    return this.http.put<Recipe>(this.apiUrl, { newRecipe: updateData.newRecipe }, { 
      headers, 
      params: httpParams 
    });
  }

  /**
   * Delete a recipe
   * @param id Recipe ID
   * @param token Authentication token (required)
   */
  deleteRecipe(id: string, token: string): Observable<{ message: string }> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const httpParams = new HttpParams().set('_id', id);

    return this.http.delete<{ message: string }>(this.apiUrl, { headers, params: httpParams });
  }
}

