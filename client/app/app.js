/**
 * Created by gireeshbabu on 30/09/16.
 */
import { Component } from 'angular2/core';

@Component({
  selector: 'flow-app',
  template: '{{welcome}}'
})
export class AppComponent {
  var welcome = 'Hello from Angular2!';
}
