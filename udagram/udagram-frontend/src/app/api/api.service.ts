import { Injectable } from '@angular/core';

import express from "express";
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
 

var app :any = express();


const API_HOST = environment.apiHost;
const x=app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
 
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json',x})
  };

  token: string;

  constructor(private http: HttpClient) {
  }

  static handleError(error: Error) {
    alert(error.message);
  }

  static extractData(res: HttpEvent<any>) {
    const body = res;
    return body || { };
  }

  setAuthToken(token) {
    this.httpOptions.headers = this.httpOptions.headers.append('Authorization', `jwt ${token}`);
    this.token = token;
  }

  get(endpoint): Promise<any> {
    const url = `${API_HOST}${endpoint}`;
    const req = this.http.get(url, this.httpOptions).pipe(map(ApiService.extractData));

    return req
            .toPromise()
            .catch((e) => {
              ApiService.handleError(e);
              throw e;
            });
  }

  post(endpoint, data): Promise<any> {
    const url = `${API_HOST}${endpoint}`;
    return this.http.post<HttpEvent<any>>(url, data, this.httpOptions)
            .toPromise()
            .catch((e) => {
              ApiService.handleError(e);
              throw e;
            });
  }

  async upload(endpoint: string, file: File, payload: any): Promise<any> {
    const signed_url = (await this.get(`${endpoint}/signed-url/${file.name}`)).url;

    const headers = new HttpHeaders({'Content-Type': file.type});
    const req = new HttpRequest( 'PUT', signed_url, file,
                                  {
                                    headers: headers,
                                    reportProgress: true, // track progress
                                  });

    return new Promise ( resolve => {
        this.http.request(req).subscribe((resp) => {
        if (resp && (<any> resp).status && (<any> resp).status === 200) {
          resolve(this.post(endpoint, payload));
        }
      });
    });
  }
}
function express() {
  throw new Error('Function not implemented.');
}

