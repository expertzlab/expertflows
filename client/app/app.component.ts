/**
 * Created by gireeshbabu on 30/09/16.
 */
import 'reflect-metadata';

import { Component } from 'angular2/core';
import {RegisterComponent} from './register/register.component'

@Component({
  selector: 'flow-app-home',
  template: `<h3> Warm {{welcome}}</h3>
              <h3><fa-register></fa-register></h3>
           `,
  directives:[RegisterComponent]

})
export class FlowAppHomeComponent {

  welcome: string;

  constructor() {
    this.welcome = 'Welcome to Flow App';
  }
}
