import {Component, Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';

@Component({
  selector:'fa-register',
  templateUrl:'/login.template.html'
})

@Injectable()
export class LoginComponent{



  constructor(public http: Http){

  }

  submit(){
    console.debug("test");
    this.http.get('/api/Users/login');
    console.debug("send request")
  }

  private extractData(res:Response){
    let body = res.json();
    console.log(body);
  }

  private handleError(){

  }
}
