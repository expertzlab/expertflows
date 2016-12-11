import {Component, Injectable, Inject} from 'angular2/core';
import {HTTP_PROVIDERS, Http, Headers, Response} from 'angular2/http';

import 'rxjs/add/operator/map';

@Component({
  selector:'fa-register',
  templateUrl:'/app/register/register.template.html',
  providers:[HTTP_PROVIDERS]
})

@Injectable()
export class RegisterComponent{

  data:string;
  loading:boolean = true;
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(@Inject (Http) private http: Http){
    //alert(http);
  }

  submit(){

    var params = JSON.stringify({"realm": "admin",
      "username": "admin",
      "email": "a@a.com",
      "emailVerified": false,
    "password":"a@a.com"});

    this.http.post('/api/Users',params,{headers:this.headers})
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.data = res;
        this.loading = false;
      });
    console.log('posted data');
  }

  private extractData(res:Response){
    let body = res.json();
    console.log(body);
  }

  private handleError(){

  }
}
