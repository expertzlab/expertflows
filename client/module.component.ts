
import {Component} from 'angular2/core';
import {FlowAppHomeComponent} from 'app/app.component'

@Component({
  selector: 'flow-module',
  template: `<h1>Hello {{ name }}!</h1>
             <h2><flow-app-home>
             </flow-app-home></h2>
            `,
  directives:[FlowAppHomeComponent]
})
export class FlowAppModuleComponent {
  name: string;

  constructor() {
    this.name = 'Angular 2';
  }
}
