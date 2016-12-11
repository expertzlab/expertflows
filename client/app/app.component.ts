/**
 * Created by gireeshbabu on 30/09/16.
 */
import 'reflect-metadata';

import { Component } from 'angular2/core';
import {RegisterComponent} from './register/register.component'

@Component({
  selector: 'flow-app-home',
  template: `<h5> Warm {{welcome}}</h5>
              <fa-register></fa-register>
           `,
  directives:[RegisterComponent]

})
export class FlowAppHomeComponent {

  welcome: string;

  constructor() {
    this.welcome = 'Welcome to Flow App';
  }
}
