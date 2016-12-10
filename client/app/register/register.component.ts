import {Component, Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';

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
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post('/api/Users',
      {firstName:'Joe',lastName:'Smith'}, {headers:headers}) .map((res: Response) => res.json())
      .subscribe((res:Response) => this.extractData(res));
  }

  private extractData(res:Response){
    let body = res.json();
    console.log(body);
  }

  private handleError(){

  }
}
