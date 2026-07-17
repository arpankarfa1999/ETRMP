import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Root component. Everything else is rendered through <router-outlet>.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
