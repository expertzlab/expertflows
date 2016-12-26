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

  username:string;
  email:string;
  password:string;

  constructor(@Inject (Http) private http: Http){
    //alert(http);
  }

  submit(){

    var params = JSON.stringify({"realm": "admin",
      "username": this.username,
      "email": this.username,
      "emailVerified": false,
      "password":this.password});

    this.http.post('/api/Users',params,{headers:this.headers})
      .map((res: Response) => res.json())
      .subscribe(res => {
        this.data = res;
        this.loading = false;
        this.extractData(res);
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
