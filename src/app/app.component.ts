import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainComponent } from './main_component/main_component';
import Typed from 'typed.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rimai';

  ngOnInit() {
    const options = {
      strings: ['AI Leaders', 'Data Leaders', 'AI Engineers', 'Data Scientist', 'Data Engineers', 'Data Strategists', 'Cyber Security Experts'],
      typeSpeed: 100,
      backSpeed: 100,
      showCursor: true,
      cursorChar: '|',
      loop: true
    };

    const typed = new Typed('.typed-element', options);
  }
}
