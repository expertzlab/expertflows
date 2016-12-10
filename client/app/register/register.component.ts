import {Component, Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import {Response} from "angular2/response";

@Component({
  selector:'fa-register',
  templateUrl:'/app/register/register.template.html'
})

@Injectable()
export class RegisterComponent{



  constructor(public http: Http){

  }

  submit(){
    console.debug("test");
    this.http.get('/api/Users/login').map(this.extractData).catch(this.handleError);
  }

  private extractData(res:Response){
    let body = res.json();
    console.log(body);
  }

  private handleError(){

  }
}
