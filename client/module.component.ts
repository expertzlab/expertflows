
import {Component} from 'angular2/core';

import {FlowAppHomeComponent} from 'app/app.component'

@Component({
  selector: 'flow-module-component',
  template: `<h3>Hello {{ name }}!</h3>
             <flow-app-home>
             </flow-app-home>
            `,
  directives:[FlowAppHomeComponent]
})
export class FlowAppModuleComponent {
  name: string;

  constructor() {
    this.name = 'User';
  }
}
