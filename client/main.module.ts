import 'zone.js';
import 'reflect-metadata';
import 'es6-shim';

import {Component} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {FlowAppModuleComponent} from 'module.component'
import {FlowAppHomeComponent} from 'app/app.component'

@Component({
  selector: 'flow-module',
  template: ` <h2><flow-module-component>
             </flow-module-component></h2>
            `,
  directives:[FlowAppModuleComponent, FlowAppHomeComponent]
})
export class FlowAppModule{

}


bootstrap(FlowAppModule);
