import {Component, Injectable} from 'angular2/core';
import {Http} from 'angular2/http';
import {Response} from "angular2/response";

@Component({
  selector:'fa-register',
  templateUrl:'/app/login/login.template.html'
})

@Injectable()
export class LoginComponent{



  constructor(public http: Http){

  }

  submit(){
    console.debug("test");
    this.http.get('/api/Users/login').map(this.extractData).catch(this.handleError);
    console.debug("send request")
  }

  private extractData(res:Response){
    let body = res.json();
    console.log(body);
  }

  private handleError(){

  }
}
