import {HttpInterceptor,
        HttpErrorResponse,
        HttpRequest,
        HttpHandler,
        HttpEvent} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor{
        intercept(request:HttpRequest<any>, next:HttpHandler):Observable<HttpEvent<any>>{
                return next.handle(request)
                                .catch(resp => {
                                        return Observable.throw(resp);
                                });
        }
}
