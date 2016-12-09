import 'zone.js';
import 'reflect-metadata';
import 'es6-shim';
import {Component} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';


@Component({
  selector: 'hello-world',
  template: `<h1>Hello {{ name }}!</h1>`
})
export class HelloWorldComponent {
  name: string;

  constructor() {
    this.name = 'Angular 2';
  }
}

bootstrap(HelloWorldComponent);
